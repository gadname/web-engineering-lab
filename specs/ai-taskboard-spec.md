# Spec: taskboard AI アシスタント(プロジェクトQ&A)

Claude Code 向け実装仕様書。`web-engineering-lab/specs/ai-taskboard-spec.md` として配置し、マイルストーン単位で実装を依頼する。

---

## 0. コンテキストと現状

taskboard は本リポジトリの積み上げアプリ。現状:

- `app/api`: Hono + `@hono/zod-openapi`。`createApp(deps)` によるDI(`IProjectRepository` を注入、本番=Prisma実装/テスト=インメモリ実装)。Prisma は soft-delete を `ProjectRecord`(書き込み)+`Project` view(読み取り、`projects_live`)で分離。`Task` あり。biome / vitest(unit・integration分離)/ `openapi:generate` 整備済み
- `app/web`: 未作成
- `app/docker-compose.yml`: あり(Postgres)

このSpecで追加するのは **1機能のみ**: プロジェクトに紐づく文書への自然言語Q&A(出典引用+SSEストリーミング)と、その **評価(eval)基盤**。

### 絶対制約(全マイルストーン共通)

1. **クリーンルーム**: いかなる社外秘コードベースの参照・転写もしない。既存の taskboard 規約(1エンドポイント1ファイル、DI、エラー整形、`@map` 命名)に従う
2. ダミーデータはすべて創作(架空のSaaS開発プロジェクト等)。実在企業・建設/工程ドメインの語彙は使わない
3. スコープ固定: このSpecにない機能(エージェント化、マルチテナント、認可、タスク自動生成)は実装しない。提案があれば `docs/adr/` に将来案として書くに留める
4. 各マイルストーンは Issue → ブランチ → PR(本文に変更理由と検証手順)→ merge。コミットは Conventional Commits(`feat:`/`fix:`/`docs:`/`test:`)
5. 主要な技術判断は `docs/adr/NNNN-<slug>.md` に1判断1ファイルで記録(フォーマット: Context / Decision / Alternatives / Consequences)

---

## 1. ゴール / 非ゴール

**ゴール**: ユーザーがプロジェクト画面のチャットパネルで「認証まわりで決まったことは?」と聞くと、回答がSSEでストリーミング表示され、根拠文書への出典リンクが付く。検索・生成品質はゴールデンセットで計測され、CIで回帰が検知される。デモモードではDB・課金なしで動く。

**非ゴール**: 本番運用インフラ(ECS等)、認証認可、複数LLMの切替UI、会話履歴の永続化、エージェント的なツール実行。

## 2. アーキテクチャ

```
app/web (Next.js App Router)
  └─ チャットUI: fetch + ReadableStream でSSE消費、出典カード表示
app/api (Hono, 既存)
  └─ Document CRUD(読み取り中心)を追加。AIサービスのための文書提供元
app/ai (FastAPI, 新規)
  ├─ ingest: app/api から文書を取得→チャンク化→埋め込み→ベクトルストア
  ├─ /qa: 検索→生成(出典付き)、SSEで配信
  └─ eval/: ゴールデンセット+検索評価(決定的)+生成評価(RAGAS)
```

### 主要な技術決定(ADR化すること)

- **埋め込みはローカル実行**: `fastembed` の `intfloat/multilingual-e5-small`。理由: 埋め込みAPIコストゼロ、**CIでの検索評価が決定的かつ無料**になる、日本語対応。
- **ベクトルストアは抽象化**: `VectorStore` インターフェースに `QdrantStore`(開発、docker-compose追加)と `InMemoryStore`(numpyコサイン類似、デモ/CI用)の2実装。環境変数 `VECTOR_STORE=qdrant|memory` で切替
- **LLMは生成のみに使用**: プロバイダは env で選択(`LLM_PROVIDER=anthropic|openai`、`LLM_API_KEY`)。デモモードではリクエストヘッダ `X-LLM-API-Key` によるBYOKを許可(キーはログ・トレースに絶対に出さない)
- **SSEはPOST + ReadableStream**(EventSourceはGET限定のため不使用)

## 3. データモデル(app/api)

`schema.prisma` に追加(既存のsoft-delete view パターンに従う):

```prisma
model DocumentRecord {
  id        String    @id @default(uuid())
  projectId String    @map("project_id")
  title     String
  content   String    // Markdown本文
  kind      String    // "minutes" | "spec" | "note"
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  project   ProjectRecord @relation(fields: [projectId], references: [id], onDelete: Cascade)
  @@index([projectId])
  @@index([deletedAt])
  @@map("documents")
}
// + Document view (documents_live) を既存Projectと同様に定義
```

- `IDocumentRepository` + Prisma実装 + インメモリ実装(既存Repositoryの構成に合わせる)
- ルート: `GET /api/projects/:projectId/documents`(一覧、id/title/kind/updatedAt)、`GET /api/documents/:id`(本文込み)。zod-openapiでスキーマ定義
- シード: `prisma/seed.ts` に架空プロジェクト2件(例:「フィットネスアプリ開発」「社内ヘルプデスク改善」)+各6〜8文書(議事録・仕様メモ・調査ノート、各400〜1200字の日本語Markdown)+タスク10件程度。**インメモリ実装にも同一シードを持たせ、デモモードで同じデータが出るようにする**

## 4. AIサービス(app/ai)

- Python 3.12 / FastAPI / uv 管理。`ruff` + `pytest`。構成は薄い層分け: `routers/` `services/`(ingest, retrieval, generation)`stores/`(vector store 2実装)`eval/` `tests/`
- チャンク化: Markdownをheading優先で分割、目安400字・オーバーラップ80字。チャンクに `doc_id` / `title` / `heading` を保持
- **API**:
  - `POST /ingest` `{api_base_url, project_id}` → app/api から文書取得→チャンク→埋め込み→格納。返り値: 文書数/チャンク数
  - `POST /qa`(SSE): `{project_id, question}` → top-k検索(k=6)→プロンプト構築(出典番号付き)→ストリーミング生成。イベント: `citations`(先頭で `[{doc_id,title,heading,score}]`)→ `token`(delta)→ `done`(`{input_tokens,output_tokens,latency_ms}`)/ `error`(`{code,message}`)
  - `GET /health`
- 品質要件: LLM呼び出しにタイムアウト(30s)と1回リトライ。検索結果0件時は「文書に根拠が見つからない」旨を生成せず定型応答(ハルシネーション防止をテストで担保)。question長の上限(1000字)をバリデーション。OTel(またはロガー)でステップ別latencyとトークン数を構造化ログ出力

## 5. 評価基盤(app/ai/eval)

- `golden.jsonl`: 30問。`{id, project_id, question, expected_doc_ids: [..], reference_answer}`。シード文書から人手で作る(Claude Codeがドラフト→人間がレビューして確定、のフローで良い)。回答不能質問(文書に根拠なし)を3問含める
- **検索評価(決定的・無料)**: `python -m eval.retrieval` → hit@k / MRR を計算し `eval/results/retrieval.json` へ。**閾値: hit@6 >= 0.8**。下回れば exit 1
- **生成評価(要APIキー)**: `python -m eval.generation` → RAGAS(faithfulness / answer_relevancy)。結果を `eval/results/generation.json` と `eval/REPORT.md`(改善前後の表)へ
- **CI(.github/workflows/ci.yml)**:
  - PR毎: api `npm run check && npm test` / ai `ruff check && pytest` / **検索評価(InMemoryStore+ローカル埋め込みで実行、閾値ゲート)**
  - 手動trigger(workflow_dispatch): 生成評価(リポジトリsecretのキー使用)

## 6. Web UI(app/web)

- Next.js 15 App Router / TypeScript / Tailwind。`npm run check`(tsc+biome)を api と揃える
- 画面: プロジェクト一覧 → プロジェクト詳細(タスク一覧+文書一覧+**チャットパネル**)
- チャット: 送信→ `citations` イベントで出典カードを先に表示→ `token` を逐次レンダリング(Markdown対応、`done` まで)。エラー時はリトライボタン。応答中の中断(AbortController)対応
- 出典カードクリック→文書ビューア(該当headingへアンカー)
- APIアクセス: サーバー側Route Handler経由で app/api / app/ai をプロキシ(CORS回避+将来の認証挿入点)。デモモードではBYOK入力欄(localStorage不使用、メモリ保持のみ)

## 7. デモモード

`DEMO=1` で: api はインメモリRepository+シード、ai は `VECTOR_STORE=memory` +起動時自動ingest、web はBYOK入力欄を表示。**DBなし・事前課金なしで `docker compose up` 一発で全部動く**こと(compose に api/ai/web を追加)。README にデモGIFとQuickstart(3コマンド)を載せる。

## 8. マイルストーン(この順で1つずつPR)

| M | 内容 | 完了条件(検証コマンド) |
|---|---|---|
| M1 | Documentモデル+Repository+ルート+シード | `npm run check && npm test && npm run test:integration` 通過。`/api/projects/:id/documents` がswaggerに出る |
| M2 | app/ai骨格+ingest+非ストリーミング`/qa`(出典付きJSON) | `ruff check && pytest` 通過。ingest→qaがcurlで動く |
| M3 | eval: golden 30問+検索評価+CI閾値ゲート | CI green。`eval/results/retrieval.json` 生成、hit@6>=0.8 |
| M4 | `/qa` SSE化+タイムアウト/0件時定型応答テスト | SSEイベント順序のpytest通過 |
| M5 | app/web: 一覧〜チャットUI+文書ビューア | `npm run check` 通過+手動E2E(スクショをPRに) |
| M6 | デモモード+compose統合+README(GIF/評価表/ADRリンク) | クリーンなマシン想定で3コマンド起動 |

M3以降、生成評価(RAGAS)を1回実行して `eval/REPORT.md` に初期値を記録し、以後の改善(チャンクサイズ変更等)は必ず前後比較で残す。

## 9. CS基礎 同期学習モジュール(マイルストーン連動)

各マイルストーンに「そこで使うCS基礎」を対にする。**分担**: Claude Code はノート雛形(確認問題付き)・ADRスケルトン・計測スクリプトを生成する。書籍を読み、理解を自分の言葉で記入するのは人間。Claude Code は記入後にレビューと口頭試問(確認問題の追加出題)を行う。ノートは既存の `docs/` 形式(概念→なぜ必要か→仕組み→実例→落とし穴→確認問題)に従い、`PROGRESS.md` を更新する。

| 連動先 | CS題材(読む範囲) | Claude Codeが生成するもの | 人間が完成させる成果物 |
|---|---|---|---|
| M1(Document+Prisma) | 『達人に学ぶDB設計』該当章: インデックス・実行計画・トランザクション | `exercises/track1-web/03` 追補: documents クエリの `EXPLAIN ANALYZE` 実行スクリプトと結果記録テンプレ | ノート更新(indexの効き方を実測値で説明) |
| M2(FastAPI AIサービス) | 『Linuxのしくみ』該当章: プロセス/スレッド、イベントループ、シグナル | graceful shutdown の動作確認スクリプト(SIGTERM送信→処理中リクエストの完走確認)+設計メモ雛形 | `app/ai/docs/design-workers.md`: uvicornワーカー/asyncの設計判断メモ(3-03ノートと相互リンク) |
| M3(評価ハーネス) | けんちょん本の計算量パート+近似最近傍(ANN)の概念 | `eval/` に検索の実行時間計測(全探索コサイン vs Qdrant HNSW、件数を変えて)スクリプト | `eval/REPORT.md` に計測表+「なぜANNが要るか」を計算量で説明する節 |
| M4(SSE) | 『マスタリングTCP/IP 入門編』該当章: TCP・keep-alive・HTTP/1.1と2の差、プロキシのバッファリング | `docs/adr/` に「SSE vs WebSocket」ADRスケルトン+バッファリング再現デモ(バッファするリバースプロキシ越しにSSEが壊れる/直る実験) | ADR完成(1-08ノートと相互リンク)──面接のシステムデザイン対策の主砲 |
| M5〜M6の間(アプリ作業が軽い週) | 応用情報セキュリティ分野: 公開鍵暗号、セッション vs トークン | `exercises/track1-web/04-jwt-auth` の演習スケルトン(JWT検証ミドルウェアを最小実装)※**taskboard本体には組み込まない**(スコープ固定を維持) | 演習完了+1-04ノート完成 |

運用ルール: 学習モジュールは対応するマイルストーンの実装**と同じ週**に消化する(ジャストインタイム原則)。読めなかった週はスキップしてよいが、ADR(M4)だけは面接価値が高いので期限内必須。ノート・ADRはZenn記事の下書きを兼ねる。

## 10. Claude Code への運用指示

- 各マイルストーン開始時にこのSpecの該当節を再読し、**完了条件のコマンドが通るまで完了と報告しない**
- 迷ったらスコープを狭く取り、拡張案はADRの Alternatives に書く
- PR本文: 目的 / 変更点 / 検証手順(実行したコマンドと結果) / AIに任せた点と人間が確認すべき点
- ルートの `CLAUDE.md` を M1 で作成: 本Specへのポインタ、絶対制約1〜5、検証コマンド一覧を記載
- 各マイルストーン完了時、§9の対応する学習モジュールの雛形生成までをそのマイルストーンの完了条件に含める(人間の記入待ちはブロッカーにしない)。人間がノート/ADRを記入したら、レビューと確認問題の出題を行う
