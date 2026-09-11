# taskboard

実務プロダクト（参考実装）の設計を最小構成で写した、マルチテナントのタスク管理アプリ。
3 つのサービスを 1 リポジトリに置き、それぞれが参考実装と同じ層構造を持つ。作りながら設計と CS 基礎を学ぶための土台。

| ディレクトリ | 参考実装 | スタック | 役割 |
|---|---|---|---|
| `api/` | core-backend | Hono + Prisma + PostgreSQL | 認証・テナント・Project の CRUD（4 層 + DDD + 2 層認可） |
| `web/` | core-frontend | Next.js App Router + TanStack Query + openapi-fetch | 画面（Container / Presentation、生成型クライアント） |
| `ai/` | ai-backend | FastAPI + asyncpg + worker | 非同期ジョブ（要約）。API と worker の 2 プロセス、PostgreSQL キュー |

```
web (3000) ──HTTP──▶ api (8787) ──▶ db: taskboard
   │
   └────HTTP──▶ ai (8000) ──▶ db: taskboard_ai ◀── ai-worker（キューを取り出して処理）
```

## 起動

```bash
make setup        # api/web: npm ci、ai: uv sync（Python 3.12 は uv が用意する）
make up           # db / api / ai / ai-worker / web を docker compose で起動
make db-migrate   # api（Prisma）と ai（SQL）のマイグレーション
make db-seed      # dev-user（ADMIN）/ dev-guest（GUEST）とテナントを投入
```

- web: http://localhost:3000 （サインイン画面でユーザー ID に `dev-user` を入力）
- api Swagger: http://localhost:8787/api/swagger
- ai docs: http://localhost:8000/docs

ローカルの認証は `Authorization: Bearer <userId>`（web は Cookie の userId を自動で付ける）。テナント系は `X-Tenant-ID` ヘッダ必須。

```bash
T=00000000-0000-4000-8000-000000000001
curl -s localhost:8787/api/v1/tenants/projects -H "Authorization: Bearer dev-user" -H "X-Tenant-ID: $T" \
  -H 'content-type: application/json' -d '{"name":"first","description":"最初の文。次の文。三つ目。"}' | jq
curl -s localhost:8000/api/ai/v1/protected/summary-jobs -H "Authorization: Bearer dev-user" -H "X-Tenant-ID: $T" \
  -H 'content-type: application/json' -d '{"projectId":"<上の id>","text":"最初の文。次の文。三つ目。"}' | jq
```

## 検証

```bash
make check             # 全サービスの type-check + lint
make test              # 全サービスの unit テスト（Docker 不要）
make test-integration  # api / ai の統合テスト（Testcontainers で PostgreSQL を起動。Docker 必須）
make generate-client   # OpenAPI を書き出し、web の型付きクライアントを再生成
```

## 各サービスの構成

### api（`api/src/`）
```
routes/          プレゼンテーション層。1 エンドポイント 1 ファイル。検証 → 依存の組み立て → ユースケース実行
usecases/        アプリケーション層。値オブジェクト化 → 認可 → Guard → 保存。@databaseTx で 1 トランザクション
domains/         ドメイン層。集約・値オブジェクト・Repository / Authorizer の契約（実装は持たない）
authorizers/     認可の実装（テナント所属 × ロールの合成）
guards/          集約単体では判定できない業務ルール（重複・件数上限）
infrastructures/ Prisma 実装（Repository / QueryService / AsyncLocalStorage でトランザクション伝搬）
shared/          設定・ログ・リクエストコンテキスト・エラーコード→定義→文言・層別例外・ミドルウェア
```

### web（`web/src/`）
```
app/             ルーティング専用。page.tsx は page-components を返すだけ
page-components/ ページの実体。レイアウト（userContext / tenantContext）もここ
components/      機能ごとの Container（index.tsx: フック・状態）と Presentation（presentation.tsx: 見た目）
services/http/   API ごとに functions（呼び出し）/ hooks（TanStack Query）/ keys / types（生成型の再エクスポート）
services/shared/ openapi-fetch クライアントとミドルウェア（認証ヘッダ・テナントヘッダ・エラー変換）
shared/          providers / hooks / lib / UI 部品
```

### ai（`ai/src/`）
```
routes/          FastAPI ルーター。1 エンドポイント 1 ファイル、pydantic スキーマは camelCase alias
usecases/        Command（pydantic）を受けて集約を進める。worker 側のユースケースも同じ層
domains/         集約（pydantic frozen）・値オブジェクト・Repository / Summarizer / Queue の Protocol
infrastructures/ asyncpg の Repository（楽観ロック）、PostgreSQL キュー（FOR UPDATE SKIP LOCKED）、要約器
workers/         Consumer（受信ループ・ack・再試行）と Executor（job_type → ユースケース）
shared/          設定・ContextVar・JSON ログ・エラー定義・例外ハンドラ・ミドルウェア
```

依存の向きはどのサービスも `routes → usecases → domains ← infrastructures`。ドメイン層は他の層を import しない。
規約の詳細は [CLAUDE.md](CLAUDE.md)。

## この構成で学べる CS 基礎（順路）

1. **プロセスとポート**: `make up` 後に `docker compose ps` と `lsof -iTCP -sTCP:LISTEN` で、5 つのプロセスがどのポートで待つかを見る
2. **HTTP はテキスト**: `curl --trace-ascii -` で api を叩き、web の Network タブと同じバイト列を確認する
3. **同一性と不変性**: `api/src/domains/project/project.ts` と `ai/src/domains/summary_job/summary_job.py`。状態変更が新しいインスタンスを返す理由
4. **トランザクションと伝搬**: api の AsyncLocalStorage、ai の ContextVar。同じ考え方が 2 言語でどう書かれるか
5. **並行制御**: ai の楽観ロック（`version`）と `FOR UPDATE SKIP LOCKED`。統合テストが競合を再現している
6. **at-least-once とべき等性**: `ai/src/workers/consumers/message_consumer.py`。visibility timeout・ack・再試行上限
7. **型の境界**: OpenAPI → `openapi-typescript`。api の zod スキーマを変えると web がコンパイルで落ちる
8. **認証と認可の分離**: 認証（誰か）は Bearer、認可（何ができるか）はテナント所属 × ロール。3 サービスで同じ約束

## 次に足すもの

1. `Task` 集約（Project 配下）を api に足し、web の一覧に出す
2. ai から api を呼ぶ HTTP クライアント（サービス間認証）と、テナント所属の検証
3. 要約器の LLM 実装（`SummarizerFactory` で切り替え）
4. WebSocket / SSE による進捗通知（ポーリングの置き換え）
5. IdP（Cognito 等）向けの認証実装を 3 サービスの Factory に足す
6. Observability（OpenTelemetry）、CI（GitHub Actions）、Terraform
