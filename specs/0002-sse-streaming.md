# Spec 0002: SSE ストリーミング モジュール

Claude Code 向け実装仕様書。`specs/ai-taskboard-spec.md` の M4 学習モジュール（§9）を前倒しし、SSE 基盤を app/api に先に作る。
進捗は §8 の Todo 表で管理し、**1 Todo ずつ実装 → 検証報告 → ユーザー確認** で進める。

## Context

`~/workspace/work_ground/web-engineering-lab/`（骨格と Track1 01〜03 実装済み。カリキュラムは `PROGRESS.md` / `docs/` が正）に、**SSE ストリーミング**モジュールを追加する。

既存 `specs/ai-taskboard-spec.md`（ユーザー作成）は、M4 で app/ai の `/qa` を SSE 化し、§9 で M4 と対にする学習モジュールとして「SSE vs WebSocket の ADR + バッファリング再現デモ」を予定している。本計画は **その学習モジュールを前倒しし、SSE 基盤（サーバヘルパ・パーサ・web クライアント・プロキシ実験・ADR）を app/api（Hono）に先に作る**もの。M4 到達時は同じクライアントと ADR を再利用する。

ユーザー確認済みの方針:
- SSE を HTTP の仕組みから説明する（TCP、keep-alive、HTTP/1.1 vs HTTP/2、プロキシのバッファリング、SSE vs WebSocket）。一次資料は RFC 9110
- **参考実装（core-backend / core-frontend）の設計を踏襲する**。spec の絶対制約 1（クリーンルーム）はこのモジュールでは適用しない。ただしコードの転載はせず taskboard ドメインで書き直し、リポジトリ内に参考実装の固有名を出さない（別名: core-backend / core-frontend / ai-backend / infra）
- **分担は spec §9 に従う**: 私はコード・実験環境・ノートと ADR の骨子（見出し、読む範囲、観察コマンド、確認問題、空欄）を作る。理解の本文はユーザーが書き、私がレビューと口頭試問を行う
- サーバ側は **app/api（Hono）にタスク一括インポート**で実装
- クライアントはこの機会に **app/web（Next.js 16.3）を立ち上げる**
- **nginx を Docker で立て**、バッファリングと HTTP/2 を実際に観察する
- ADR は `docs/adr/` に MADR 形式（spec §0.5 の Context / Decision / Alternatives / Consequences を内包）
- **ブランチ作成とコミットは私が行う**（`feat/sse-streaming`、Conventional Commits）。push と PR 作成はユーザー。PR 本文は spec §10 の形式で `PR_BODY.md` に下書き

### 参考実装の調査結果（踏襲する設計）

バックエンド（core-backend）:
- SSE 専用 Hono app を分離し、compress とリクエスト/レスポンスログを適用しない。パスは `/sse/v1` 接頭辞（ALB ルールやログフィルタで識別するため）
- `hono/streaming` の `streamSSE` を lifecycle ラッパーで包む。`Cache-Control: no-cache, no-transform` と `X-Accel-Buffering: no` を付与。ストリーム内の例外は throw せず `{type:"error"}` を data で送る（`streamSSE` に任せると `event: error` が自動送出され契約を壊す）
- `event:` / `id:` / `retry:` を使わず、`data` の JSON 内 `type` を Zod discriminatedUnion で判別。型付き writer ファクトリ
- 中断は「クライアント切断（`c.req.raw.signal`。`@hono/node-server` 1.19 は切断で abort する）」を親にした子 AbortContext と、別 POST の stop API からの明示停止の合成。`finally` で必ず cancel しリスナーを解放。streamId → controller の in-memory レジストリ（単一インスタンス限定を明記）
- ハートビートは送らず ALB idle_timeout=3600 で対処（60 秒超の無通信で切断された障害が起点）。Node は keepAliveTimeout 3650s > ALB 3600s、headersTimeout 3660s
- OpenAPI は `responseSSE` ヘルパーで `200.content["text/event-stream"]` を宣言。認証ミドルウェアは通常 API と同じものを SSE app に多段適用

フロントエンド（core-frontend）:
- EventSource ではなく fetch + ReadableStream（POST body・Authorization ヘッダ・OpenAPI 型連動のため）。`parseAs: "stream"` で消える型を `ExtractSseEvent` 型ユーティリティで復元
- パーサは `\n\n` 分割、`event:`/`data:` のみ、複数行 data・CRLF 非対応、`id`/`retry` 無視、`[DONE]` 番兵、再接続なし。**単体テストが無い**
- 累積はジェネレータ消費関数で行い reducer には全文を渡す。制御状態は ref、正データは TanStack Query（完了時に invalidate）
- WebSocket は進捗用途。ブラウザ WS はヘッダを付けられずクエリで token を渡す

AI バックエンド: 別プロセスのワーカーが DynamoDB に進捗を書き、WebSocket がポーリングして push。

既存リポジトリの事実（Plan エージェント確認）: app/api は hono 4.13.7 / @hono/node-server 1.19.17。Hono の `compress()` は `Transfer-Encoding` や `no-transform` を見て素通しする（gzip 事故は Hono ではなく nginx など他ホップで起きる）。`docs/track1-web/00-http.md` が 0 バイトで存在（HTTP 機構ノートの受け皿にする）。`Makefile` は `package.json` を再帰的に拾うのでサブパッケージは自動で対象になる。

### 参考実装から意図的に変える点
| 項目 | 参考実装 | 本教材 | 理由 |
|---|---|---|---|
| ハートビート | 送らない（LB timeout 延長） | `: ping` コメント行を 15 秒ごと | nginx `proxy_read_timeout` で切断を踏み、両方の対処を比較する |
| パーサ | 部分実装・テスト無し | WHATWG 準拠 + 単体テスト | 仕様を読んで実装する題材 |
| `id:` / Last-Event-ID | 不使用 | GET の EventSource デモでのみ使う | 自動再接続を体験する。POST ストリームでは踏襲して使わない |

## 1. 成果物と配置

| 種別 | パス | 私が作る | ユーザーが書く |
|---|---|---|---|
| 計画書 | `specs/0002-sse-streaming.md` | 全文 + 進捗チェック | — |
| ADR | `docs/adr/README.md`、`docs/adr/0001-sse-over-websocket.md` | 規則、MADR 骨子（Options 表の軸、観察結果の差し込み位置、空欄） | Decision の理由、Consequences の本文 |
| ノート | `docs/track1-web/00-http.md` | 見出し・読む範囲・観察コマンド・確認問題 | 概念の説明本文 |
| ノート | `docs/track1-web/08-sse-realtime.md` | 同上 + 学習マップ表 | 同上 |
| 演習 | `exercises/track1-web/08-sse-realtime/{parser,server,proxy-lab}/` | コード・テスト・README・観察記録テンプレ | 観察結果の記入 |
| app | `app/api`, `app/web`, `app/proxy`, `app/docker-compose.yml`, `Makefile` | 全文 | — |
| 進捗 | `PROGRESS.md`, `references/reference-map.md`, `references/reading-list.md` | 更新 | — |
| PR | `PR_BODY.md`（リポジトリ直下、gitignore）| 下書き | push と PR 作成 |

## 2. CS 学習マップ（ノート 00-http / 08 の骨子になる）

各行は「読む → 観察する → 作る」。観察は `app/api` を 8787 で起動した状態が前提。

| # | 概念 | 読む | 観察する（コマンドと期待） | 作る |
|---|---|---|---|---|
| 1 | TCP 接続とソケット | RFC 9110 §3.3、Node `net` | `tcpdump -i lo0 port 8787 -nn`（任意）で 3-way handshake、`lsof -i :8787` | `server/` の `/health` を `nc` で手打ち |
| 2 | HTTP/1.1 のメッセージ境界（Content-Length vs chunked） | RFC 9110 §6、§8.6、RFC 9112 §6、§7.1 | `curl -N -v --raw localhost:8787/api/sse/v1/demo/clock` で `Transfer-Encoding: chunked` と 16 進サイズ行、終端 `0\r\n\r\n` | ストリームが Content-Length を持てないことのテスト |
| 3 | 持続接続と idle timeout（各ホップ） | RFC 9112 §9.3、§9.5、RFC 9110 §7.6.1 | Node `keepAliveTimeout` を短くして `tcpdump` で FIN。nginx `/slow/` で 5 秒沈黙 → 504 | `index.ts` に keepAliveTimeout と不等式コメント |
| 4 | 中間者と変換・バッファリング | RFC 9110 §3.7、§7.7、RFC 9111 §5.2.2 `no-transform` | nginx `/buffered/` は束で届き、`/api/` は逐次 | `Cache-Control: no-cache, no-transform` + `X-Accel-Buffering: no` |
| 5 | 圧縮と flush | RFC 9110 §8.4 | nginx `/gzip/` で遅延。Hono `compress()` が SSE を素通しすることを unit test で確認 | SSE app 分離の根拠 |
| 6 | SSE 仕様 | WHATWG HTML §9.2（9.2.5 format、9.2.6 interpretation） | `curl -N` の生出力に `: ping`。DevTools EventStream タブ | `parser/` と writer |
| 7 | 自動再接続と Last-Event-ID | WHATWG 9.2.4 | clock デモでサーバ再起動 → `Last-Event-ID` 付き再接続。`curl -H 'Last-Event-ID: 5'` | `/demo/clock` に `id:` `retry:` |
| 8 | HTTP/2（多重化、chunked 禁止、TCP HOL、接続数上限） | RFC 9113 §5、§8.1、§8.2.2 | `curl -vk --http2 https://localhost:8443/api/sse/v1/demo/clock` で chunked 消失。ブラウザで SSE 7 本: :8080 は 7 本目が pending、:8443 は全部届く | nginx `listen 8443 ssl http2` |
| 9 | WebSocket（Upgrade/101、フレーム、ping/pong、ヘッダ不可） | RFC 6455 §1.3、§5、§5.5.2、§7.4、RFC 8441 | `curl -i -H 'Upgrade: websocket' …` で 101。nginx `/ws/` は Upgrade 転送が無いと失敗 | `@hono/node-ws` で同ジョブを最小 WS 化（任意） |
| 10 | 中断とリソース解放 | Node AbortController、Hono `c.req.raw.signal` | `curl -N` を Ctrl-C → ログ `[SSE_ABORT]`、レジストリが空 | abortContext、stop API、`finally` |
| 11 | 状態の置き場（表示 / 制御 / 正データ） | TanStack Query invalidation | React DevTools | reducer + ref + Query |
| 12 | もう 1 ホップ: Next.js Route Handler 経由（spec §6 の構成） | Next.js Route Handlers streaming | web の `/api/proxy/...` 経由でも逐次届くか。Node fetch の `duplex` | 任意の透過プロキシ Route Handler |

**SSE vs WebSocket の判断軸**（ノートと ADR で共通）: 方向 / HTTP のまま乗るか（認証ヘッダ・パスルール・ログ・圧縮除外）/ 中継の透過性（Upgrade、idle timeout）/ 再接続と再開 / テキスト限定 / 接続数（HTTP/1.1 の 6 本制限は HTTP/2 で解消）。

## 3. ADR 骨子（`docs/adr/0001-sse-over-websocket.md`）

MADR の見出しに spec §0.5 の 4 項目を対応させる: Context and Problem Statement（= Context）/ Decision Outcome（= Decision）/ Considered Options + Pros and Cons（= Alternatives）/ Consequences。

- **Title**: 長時間ジョブの進捗配信に SSE（fetch + POST）を採用し、WebSocket を採らない
- **Context**: 数秒〜数分のジョブ進捗を片方向で、認証付きで、nginx / LB 越しに届けたい
- **Decision Drivers**: 既存 HTTP 基盤に乗る / 中継の透過性 / 再接続の容易さ / 実装・運用コスト / 将来の双方向要件
- **Options**: (a) SSE POST + fetch (b) SSE GET + EventSource (c) WebSocket (d) WebSocket + 共有ストアポーリング（別プロセスワーカー向け） (e) ポーリング
- **Decision**: (a)。骨子には「HTTP の仕組みから説明する」ための問いを空欄で置く: なぜ 200 のまま流せるのか / 101 で何を失うか / EventSource が POST できない帰結 / HTTP/2 で何が変わるか
- **Consequences**: 良い / 悪い を空欄。D セッションの観察表への参照を置く
- **Pros and Cons 表**: 6 軸 × 5 案の表を私が枠だけ作る
- **More Information**: 参考実装が (a)、AI 側が (d) を採った条件の違い。RFC / WHATWG 節番号。proxy-lab の観察記録

## 4. バックエンド設計（`app/api`）

題材: **タスクの一括インポート**。`POST /api/sse/v1/projects/{id}/tasks/import` に `{ titles: string[], stepDelayMs?: number }` を送ると、1 件ずつ Prisma で Task を作成しながら進捗を流す。LLM 不要、DB 書き込みあり、途中停止に意味があり、`stepDelayMs` で沈黙を再現できる。

```
src/
  app.ts                        root に doc/swagger。standardApi(/api: requestId + compress) と sseApi(/api/sse/v1: requestId のみ) を分離
  index.ts                      keepAliveTimeout / headersTimeout と不等式コメント。WS 使用時は injectWebSocket
  routes/tasks/{schemas,index}.ts   GET /api/projects/{id}/tasks（一覧・最小）
  routes/sse/
    events.ts                   discriminatedUnion("type", [started, progress, log, completed, failed, error]) を createSchema で命名 → TaskImportSseEvent
    schemas.ts                  ImportTasksBody / StopStreamParams
    importTasks.ts              POST …/tasks/import
    stopStream.ts               POST /api/streams/{streamId}/stop → 204 / 404（通常 app 側。参考実装と同じ分離）
    demoClock.ts                GET /api/sse/v1/demo/clock（id/retry 付き。Last-Event-ID から続き）
  routes/ws/importTasks.ts      任意。@hono/node-ws で同ジョブを JSON フレームで
  usecases/importTasks.ts       (repo, input, signal, onEvent) => Promise<void>。ルートから切り離し unit test 可能に
  repositories/taskRepository.ts  ITaskRepository { listByProject, create } + Prisma / InMemory
  shared/sse/
    streamSSEWithLifecycle.ts   ヘッダ付与、開始/完了/中断/失敗ログ、例外を {type:"error"} に変換（throw しない）
    createSSEWriter.ts          型付き writer。data: JSON のみ
    heartbeat.ts                `: ping` を interval で書き、finally で clear
    streamSessionRegistry.ts    Map<streamId, {cancel, projectId, startedAt}>。単一インスタンス限定を冒頭コメント
  shared/abort.ts               abortContext.withCancel(parentSignal) → { signal, cancel }。finally で cancel
  shared/openapi.ts             sse200(schema) 追加
  shared/auth/devHeaderAuth.ts  X-Dev-User の存在確認のみ（1-04 で JWT に差し替える印）
```

設計ルール: `event:` は使わず `data` の `type` で判別。ストリーム内で throw しない。切断 → `c.req.raw.signal` → 子 AbortContext → usecase のループ中断 → `finally` でレジストリ削除。stop API はレジストリ経由で cancel。

## 5. フロントエンド設計（`app/web`、Next.js 16.3 App Router）

```
app/web/
  src/app/layout.tsx, providers.tsx           QueryClientProvider（Client Component）
  src/app/projects/page.tsx                   一覧（1-06 の先取り、最小）
  src/app/projects/[id]/import/page.tsx       page-component を返すだけ（params は Promise）
  src/app/lab/clock/page.tsx                  EventSource デモ
  src/app/api/proxy/[...path]/route.ts        任意。透過ストリーミングプロキシ（学習マップ 12）
  src/page-components/projects/import/{index,presentation}.tsx
  src/components/task-import/import-progress-reducer.ts   純関数。unit test
  src/services/shared/clients/http-client.ts  openapi-fetch。baseUrl は NEXT_PUBLIC_API_BASE_URL（:8787 / :8080 / :8443 を切替）
  src/services/shared/clients/sse/parse-sse-stream.ts     演習 parser と同じ実装（演習側が原本）
  src/services/shared/clients/sse/sse-client.ts           POST + parseAs:"stream" + ExtractSseEvent 型
  src/services/http/tasks-import/{functions,keys,hooks}.ts
  src/services/http/tasks/{functions,keys,hooks}.ts
  src/generated/api.d.ts                      app/api/openapi.json から生成（gitignore、postinstall で生成）
  tests/unit/                                 parser / reducer / hook（偽 AsyncIterable を注入）
```

状態の三分割: 表示 = reducer、制御 = ref（AbortController、streamId）、正データ = TanStack Query（`completed` で tasks を invalidate）。

パーサ仕様（WHATWG 9.2.5〜9.2.6 準拠）: `TextDecoder` streaming（BOM 除去）。行終端 CR / LF / CRLF、chunk 末尾 CR は次 chunk の LF を待つ。`:` 始まりはコメント（`onComment` でハートビート観測可）。`field: value` の先頭 1 空白のみ除去。`data` は `\n` 連結し末尾 1 つを落とす。空行で dispatch、data 空なら破棄。`id` に NUL があれば無視。`retry` は数字のみ。テスト: 仕様例文のテーブル駆動、全分割点で結果一致、マルチバイト境界分割。

## 6. プロキシ実験（`app/proxy/` + `exercises/track1-web/08-sse-realtime/proxy-lab/`）

`app/docker-compose.yml` に `proxy`（`nginx:1.27-alpine`、`profiles: [proxy]`、`extra_hosts: host.docker.internal:host-gateway`、upstream `host.docker.internal:8787`）。`Makefile` に `up-proxy` / `cert`。`app/proxy/nginx.conf`、`app/proxy/scripts/gen-cert.sh`（openssl、SAN=localhost、`certs/` は gitignore）。演習 `proxy-lab/` は README（手順）と `OBSERVATIONS.md`（記入テンプレ）と `scripts/observe.sh`。

| location | 設定 | 期待する観察 |
|---|---|---|
| `/api/`（:8080 http1.1 / :8443 h2） | 既定。`X-Accel-Buffering` を尊重 | 逐次到達 |
| `/buffered/api/` | `proxy_ignore_headers X-Accel-Buffering;` | 束で到達 |
| `/slow/api/` | `proxy_read_timeout 5s;` | ハートビート無しで 5 秒後に切断、有りで継続 |
| `/gzip/api/` | `gzip on; gzip_types text/event-stream; proxy_buffering off;` | 遅延・束化。`no-transform` を尊重するか実測 |
| `/ws/` | `proxy_http_version 1.1; Upgrade / Connection 転送` | 無いと失敗 |

## 7. 演習パッケージ

| パッケージ | 内容 | 目安 |
|---|---|---|
| `parser/` | `parseSseStream` を依存ゼロの小ライブラリとして実装 + テスト。app/web はこれをコピー | 2h |
| `server/` | Hono 最小 SSE（clock + count ジョブ + stop）。ヘルパのプロトタイプ。`app.request()` でストリームを読む unit test | 2h |
| `proxy-lab/` | 手順・観察記録テンプレ・スクリプト（package.json 無し） | 1.5h |

ルートの `08-sse-realtime/README.md` は 3 パッケージの索引に書き換える。

## 8. 進め方: 小さな Todo を 1 つずつ

**運用ルール**: 1 Todo = 15〜45 分の変更。私が実装 → 検証コマンドを実行して結果を報告 → **ユーザーが確認して OK を出すまで次に進まない**。各 Todo は単独でコミットできる粒度にし、OK 後に私がコミット（Conventional Commits、ブランチ `feat/sse-streaming`）。ユーザーが理解を書き込む Todo（★）は私が骨子だけ作って止まる。

| # | Todo | 私がやること | 検証（私が実行して報告） | ユーザーの確認ポイント | 進捗 |
|---|---|---|---|---|---|
| 0 | ブランチと spec | `feat/sse-streaming` 作成。`specs/0002-sse-streaming.md` に本計画を保存 | `git branch --show-current`、`ls specs` | spec の内容が合意通りか | ⬜ |
| 1 | HTTP/1.1 の生バイトを見る | 演習 `server/` の最小 Hono（`/health` と `/clock` のみ、ヘルパ無し） | `curl -N -v --raw` で `Transfer-Encoding: chunked` と 16 進サイズ行を提示 | chunk の区切りと終端 `0\r\n\r\n` を自分の目で見る（学習マップ 1・2） | ⬜ |
| 2 | SSE ヘッダと lifecycle ラッパ | `server/` に `streamSSEWithLifecycle`（ヘッダ 3 種、ログ、throw しない） + テスト | `npm test`（ヘッダ検証、例外が `{type:"error"}` になる） | `no-transform` / `X-Accel-Buffering` が何のためかを説明できる | ⬜ |
| 3 | ハートビートと中断 | `server/` に heartbeat、`abortContext.withCancel(c.req.raw.signal)`、`/count` ジョブ、stop API、レジストリ + テスト | `npm test`、`curl -N` を Ctrl-C してログ `[SSE_ABORT]` を提示 | 切断がどう伝わるかを追える（学習マップ 10） | ⬜ |
| 4 | SSE パーサ（仕様準拠） | 演習 `parser/`: WHATWG 準拠 `parseSseStream` + テーブル駆動テスト | `npm test` | 仕様 9.2.5〜9.2.6 と実装を突き合わせる | ⬜ |
| 5 | パーサの分割耐性 | 全分割点テスト、CRLF、マルチバイト境界、コメント行、`id` NUL | `npm test`（ケース数を提示） | チャンク境界で壊れない理由 | ⬜ |
| 6 | app/api: SSE app 分離 | `app.ts` を standardApi / sseApi に分割。doc を root へ。既存テスト更新 | `npm run check && npm test`。`compress` が SSE を素通しする unit test | 分離の理由（学習マップ 5） | ⬜ |
| 7 | app/api: 共通ヘルパ移植 | `shared/sse/*`、`shared/abort.ts`、`sse200` を演習 `server/` から app に移す + unit test | `npm test` | 演習と app の差分が無いこと | ⬜ |
| 8 | app/api: Task リポジトリと GET | `ITaskRepository` + Prisma / InMemory、`GET /api/projects/{id}/tasks` | `npm test`、`test:integration` | 03 の Repository パターン通りか | ⬜ |
| 9 | app/api: import ユースケース | `usecases/importTasks.ts`（signal と onEvent）+ InMemory での unit test | `npm test`（イベント順序、abort で途中停止） | ルートから切り離した理由 | ⬜ |
| 10 | app/api: import ルートと stop | `routes/sse/importTasks.ts`、`stopStream.ts`、`events.ts`、統合テスト、`openapi.json` 再生成 | `test:integration`、`curl -N` の生出力、`/api/doc` に `text/event-stream` | イベント契約（discriminatedUnion）を読む | ⬜ |
| 11 | app/api: clock（id/retry） | `demoClock.ts`、`Last-Event-ID` で続きから | `curl -H 'Last-Event-ID: 5'` の出力 | 再接続の仕組み（学習マップ 7） | ⬜ |
| 12 | app/api: keep-alive 設定 | `index.ts` に keepAliveTimeout / headersTimeout と不等式コメント。任意で tcpdump 手順 | `npm run check`、短い timeout で FIN を観察する手順を提示 | 502 の原因（学習マップ 3） | ⬜ |
| 13 | app/web: 立ち上げ | Next.js 16.3 + TanStack + Tailwind + Biome + Vitest。プロジェクト一覧だけ | `npm run check && npm run build`、ブラウザで一覧 | 1-06 の先取り範囲を確認 | ⬜ |
| 14 | app/web: 型生成と SSE クライアント | `client:generate`、`parse-sse-stream.ts`（演習と同一）、`sse-client.ts`（ExtractSseEvent） | `npm run check && npm test` | `parseAs:"stream"` で型が消える話 | ⬜ |
| 15 | app/web: import 画面 | reducer / ref / Query の三層、開始・停止・進捗バー | ブラウザで進捗と停止、`npm test`（reducer） | 三層の分け方（学習マップ 11） | ⬜ |
| 16 | app/web: clock デモ | EventSource ページ。サーバ再起動で自動再接続 | DevTools EventStream タブの手順 | Last-Event-ID が付くこと | ⬜ |
| 17 | nginx: 基本と HTTP/2 | `app/proxy/`（`/api/` のみ）、自己署名証明書、compose profile、`Makefile` | `curl --http2 -vk` で chunked 消失 | 学習マップ 8 | ⬜ |
| 18 | nginx: バッファリング実験 | `/buffered/`、`/gzip/`、`/slow/`、`OBSERVATIONS.md` テンプレ、`observe.sh` | `observe.sh` の出力 | ★ 実測値を `OBSERVATIONS.md` に記入 | ⬜ |
| 19 | ★ ノート骨子 | `00-http.md`、`08-sse-realtime.md` の見出し・読む範囲・観察コマンド・確認問題 | `grep TODO` の一覧 | ★ 本文を書く。書けたら私がレビューと口頭試問 | ⬜ |
| 20 | ★ ADR 骨子 | `docs/adr/README.md`、`0001-sse-over-websocket.md`（MADR + spec §0.5 対応、Options 表の枠、空欄の問い） | ファイル提示 | ★ Decision / Consequences を書く | ⬜ |
| 21 | 任意: WebSocket 比較 | `@hono/node-ws` で同ジョブ、nginx `/ws/`、web から接続 | 101 と `websocat` | 学習マップ 9 | ⬜ |
| 22 | 任意: Route Handler プロキシ | web の透過ストリーミングプロキシ | 経由でも逐次届く | 学習マップ 12 | ⬜ |
| 23 | 仕上げ | PROGRESS / reference-map / reading-list 更新、`PR_BODY.md` | `make check && make test` | push と PR 作成 | ⬜ |

Todo 19・20 は Todo 2〜5 が終わった時点で先に出しても良い（ユーザーが書く時間を確保するため）。順序はユーザーの希望で入れ替え可能。

## 9. 検証

| 対象 | コマンド | 合格条件 |
|---|---|---|
| 演習 parser / server | `npm run check && npm test` | 全緑（分割テスト含む） |
| app/api unit | `npm test` | writer / registry / heartbeat / usecase（InMemory repo + 偽 signal）/ `compress` が SSE を素通し / `app.request()` でストリームを読み `started → progress×N → completed`、ヘッダ 3 種 |
| app/api integration | `npm run test:integration` | import 後に `GET /api/projects/{id}/tasks` が N 件。abort 後は停止時点までの件数、レジストリが空 |
| app/api 手動 | `curl -iN localhost:8787/api/sse/v1/demo/clock` | `text/event-stream`、`no-transform`、`X-Accel-Buffering: no`、chunked、`: ping` |
| 型の流れ | `cd app/api && npm run openapi:generate && cd ../web && npm run client:generate && npm run check` | `TaskImportSseEvent` が出て web の型検査が通る |
| app/web | `npm run check && npm test && npm run build` | 全緑 |
| proxy-lab | `make up-proxy && scripts/observe.sh` | `OBSERVATIONS.md` の期待列と一致（記入はユーザー） |
| ルート | `make check && make test` | 全パッケージ緑 |
| e2e 手動 | ブラウザで import 開始 → 進捗 → 停止 → 一覧反映 | サーバログ `[SSE_ABORT]`、DB に停止時点までの Task |

## 10. バージョンとリスク

| 項目 | 値 |
|---|---|
| next / react | 16.3.x / 19.2.x |
| @tanstack/react-query | ^5.101 |
| openapi-fetch / openapi-typescript | ^0.12 / ^7 |
| tailwindcss | ^3.4（shadcn は入れない） |
| hono / @hono/zod-openapi / @hono/node-server | 既存（4.13 / 0.19 / 1.19） |
| @hono/node-ws | 最新（任意） |
| nginx | 1.27-alpine |

リスク: Next 16 は Turbopack 既定、`params` が Promise、`middleware` → `proxy.ts`。`node_modules/next/dist/docs/` を先に読む。`OpenAPIHono` の doc を root に移すと spec の paths 順が変わるので既存テストを更新。`@hono/node-ws` は `serve()` 戻り値への `injectWebSocket` が必要、テストでは注入しない。nginx の gzip と `no-transform` の挙動は実測前提。`tcpdump` は sudo が要るため任意。

## 11. 制約

- 参考実装のコードを転載しない。パターンを taskboard ドメインで書き直す。参考実装の固有名を出さない
- 参考実装のリポジトリは読み取り専用
- 認証（JWT）はこのモジュールでは扱わない（1-04）。`devHeaderAuth` の差し込み位置のみ
- ノート・ADR の本文はユーザーが書く。私は骨子・コード・実験・レビュー

### Critical Files（実装時の基準。読み取り専用）
- `core-backend/src/app.ts`、`src/routes/shared/sse/{streamSSEWithLifecycle,createSSEWriter}.ts`、`src/shared/helpers/abort.ts`、`src/usecases/copilot/shared/streamSessionManager.ts`、`src/routes/v1/protectedSSE/tenantContext/schedule-charts/copilot/streamMessageV2.ts`、`src/node.ts`
- `core-frontend/src/services/shared/clients/sseClient/{core-sse-client,sse-parser}.ts`、`src/components/schedules/schedule-editor/hooks/shared/helpers/copilot-stream-session.ts`
- `infra/terraform/alb.tf`、`ai-backend/src/routes/shared/websocket/progress_websocket_handler.py`
- 本リポ: `app/api/src/app.ts`、`app/api/src/shared/openapi.ts`、`app/docker-compose.yml`、`specs/ai-taskboard-spec.md`、`docs/track1-web/{00-http,08-sse-realtime}.md`
