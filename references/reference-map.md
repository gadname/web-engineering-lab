# 参考実装 参照索引

ノートの「実例」で参照する参考実装側のパス一覧。パスは各リポジトリのルートからの相対パスで、先頭の名前はリポジトリの別名。**読み取り専用**。

| 別名 | 内容 |
|---|---|
| `core-backend` | TypeScript / Hono / Prisma のコア API |
| `core-frontend` | Next.js App Router のフロントエンド |
| `ai-backend` | Python / FastAPI / LangGraph の AI バックエンド |
| `agent-platform` | エージェント実行基盤（ハーネス） |
| `infra` | Terraform（AWS） |

実体のディレクトリ名はローカル環境に依存するため、ここには書かない。

## Track 1: Web 基礎

### 1-01 HTTP と REST、Hono ルーティング

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/app.ts` | basePath とミドルウェア登録順（requestId → context → cors → compress → log）にコメントで根拠がある |
| core-backend | `src/routes/v1/protected/tenantContext/sites/getSites.ts` | 1 エンドポイント 1 ファイルの構成 |
| core-backend | `src/routes/health.ts` | ヘルスチェックをミドルウェア無しの rootApp に置く理由 |

### 1-02 スキーマ検証とコードファースト OpenAPI

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/routes/shared/helpers/createSchema.ts` | スキーマ名を prefix にして各 field に openapi メタデータを付ける小さなヘルパー |
| core-backend | `src/routes/shared/helpers/openAPISchema.ts` | requestBody / response200 などのボイラープレートを畳む |
| core-backend | `scripts/openapi/generate.ts` | 起動中サーバから /doc を取得して YAML 化 |
| core-frontend | `src/services/http/sites/types.ts` | 生成型を services 層で再エクスポートする |

### 1-03 永続化: Prisma と PostgreSQL

| repo | path | 見どころ |
|---|---|---|
| core-backend | `prisma/schema.prisma` | @map による命名対応、views preview 機能で論理削除の live-only view を実現（冒頭コメント） |
| core-backend | `prisma/migrations/` | `YYYYMMDDHHMMSS_<チケット>` 命名 |
| core-backend | `tests/integration/helpers/postgresGlobalSetup.ts` | Testcontainers で Postgres を起動し migrate deploy してから provide |
| core-backend | `vitest.config.integration.ts` | unit と integration を config 分離し、INTEGRATION_TARGET で切替 |

### 1-04 認証: JWT と OIDC（Cognito）

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/shared/middlewares/auth/jwt/jwtAuthMiddleware.ts` | 401 を throw せず return する（OTel の span を Error 化しないため） |
| core-backend | `src/shared/middlewares/auth/jwt/strategies/` | cognito / development / loadTest の 3 実装 |
| core-backend | `src/shared/middlewares/auth/jwt/authenticatorFactory.ts` | 環境で認証器を選ぶ Factory |
| core-frontend | `src/services/shared/clients/authClient/cognitoAuthClient.ts` | Amplify v6 + CookieStorage |

### 1-05 マルチテナントとリクエストコンテキスト

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/shared/middlewares/auth/tenant/tenantAuthMiddleware.ts` | JWT 認証の後段でテナント所属を検証 |
| core-backend | `src/shared/context/requestContext.ts` | AsyncLocalStorage によるリクエストコンテキスト |
| core-backend | `src/shared/logger/logger.ts` | OTel span から trace_id を自動付与、予約フィールド上書き防止 |
| core-backend | `src/shared/middlewares/requestContextMiddleware.ts` | コンテキスト開始点 |

### 1-06 Next.js App Router とサーバー状態

| repo | path | 見どころ |
|---|---|---|
| core-frontend | `src/services/shared/clients/httpClient/core/httpClient.ts` | openapi-fetch + 3 つのミドルウェア（認証・テナント・エラー） |
| core-frontend | `src/services/http/sites/keys.ts` | `all` を prefix にした階層的 query key |
| core-frontend | `src/app/layout.tsx` | Provider の多段ネストと順序 |
| core-frontend | `src/app/(tenant-context)/tenants/[tenantId]/sites/page.tsx` | page.tsx は page-component を返すだけ |

### 1-07 フォームとエラーハンドリング（FE）

| repo | path | 見どころ |
|---|---|---|
| core-frontend | `src/services/shared/clients/httpClient/middlewares/errorHandlingMiddleware.ts` | 非 2xx を StructuredApiError / FetchError に変換 |
| core-frontend | `src/services/shared/exceptions/use-error-handler.ts` | コード別にトースト or setError |
| core-frontend | `src/components/tenant-settings/label-settings/presentation.tsx` | index.tsx（ロジック）+ presentation.tsx（見た目） |
| core-frontend | `.rulesync/rules/error-handling.md` | エラー処理の設計ルール |

### 1-08 SSE とリアルタイム更新（任意）

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/app.ts` | SSE 用アプリを分離し compress / ログを適用しない |
| core-frontend | `src/services/shared/clients/sseClient/` | core-sse-client と sse-parser |
| core-frontend | `src/services/http/schedule/helpers/apply-batch-operation-to-cache.ts` | 楽観的更新を純関数として切り出し単体テスト |

## Track 2: 設計手法

### 2-01 レイヤードアーキテクチャと依存方向

| repo | path | 見どころ |
|---|---|---|
| core-backend | `CLAUDE.md` | 4 層 + Factory DI の規約を明文化 |
| core-backend | `tests/unit/architecture/dateHandling.test.ts` | 規約そのものをテストする |
| ai-backend | `src/domains/workers/protocols/` | Python でも Protocol で同じ DIP を実現（ファイル冒頭に理由） |

### 2-02 DDD 戦術パターン

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/domains/shared/dddObjectBases/` | 基底クラス群（Symbol brand で型的に集約を識別） |
| core-backend | `src/domains/site/site.ts` | private constructor + validateConstructorArgs、上限値にコメントで根拠 |
| core-backend | `src/domains/site/valueObjects/` | VO の実装例 |

### 2-03 リポジトリとファクトリ DI

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/domains/site/repositories/site.ts` | IF はドメイン層 |
| core-backend | `src/infrastructures/repositories/site.ts` | Prisma 実装 |
| core-backend | `src/infrastructures/shared/clients/databaseClient/factory.ts` | optional 引数で依存を注入する Factory |

### 2-04 ユースケースとトランザクション

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/usecases/site/createSite.ts` | コンストラクタ注入 + @databaseTx |
| core-backend | `src/shared/decorators/transaction.ts` | IDatabaseTxManager プロパティ規約 |
| core-backend | `tsconfig.build.json` | decorator を動かすため target を ES2022 に固定する理由 |

### 2-05 CQRS: QueryService

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/domains/queries/getSitesQueryService.ts` | Query IF はドメイン層 |
| core-backend | `src/infrastructures/queries/getSitesQueryService.ts` | Prisma 直叩きの Read 実装 |
| core-backend | `src/authorizers/getSitesQueryServiceAuthorizer.ts` | Query 専用の認可 |

### 2-06 認可の 2 層モデルとガード

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/domains/shared/authorizers/` | 2 層の IF |
| core-backend | `src/authorizers/site.ts` | 実装はドメイン外 |
| core-backend | `src/guards/siteGuard.ts` | 存在確認・重複チェックを Guard に |

### 2-07 エラー階層とレスポンス整形

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/shared/exceptions/` | domain / usecase / infrastructure / route / middleware の層別例外 |
| core-backend | `src/shared/errors/codes/` | コード定数の集約 |
| core-backend | `src/shared/errors/errorResponseFormatter.ts` | resolveMessageForCode が唯一の文言解決経路 |
| core-backend | `src/shared/middlewares/handleOnErrorMiddleware.ts` | onError での一括処理 |

### 2-08 テスト戦略と静的解析

| repo | path | 見どころ |
|---|---|---|
| core-backend | `biome.jsonc` | noExplicitAny: error、overrides で path 別ルール |
| core-backend | `plugins/calendarDatePair.grit` | 構文レベルの独自禁止ルール |
| core-backend | `vitest.config.ts` | coverage を domains / authorizers に限定して 90% |
| ai-backend | `tests/unit/conftest.py` | autouse fixture で外部 SaaS への誤送信を封じる |

## Track 3: コンテナ・インフラ

### 3-01 Docker 基礎とマルチステージビルド

| repo | path | 見どころ |
|---|---|---|
| core-backend | `Dockerfile` | 4 ステージ、npm prune --omit=dev、--chown、CMD の --import で OTel を先読み |
| ai-backend | `Dockerfile` | 3 ステージ + uvicorn graceful shutdown を ECS stopTimeout から逆算 |
| agent-platform | `.github/workflows/ci.yml` | 実イメージを起動して uid / 権限 / サイズを実測 |

### 3-02 docker-compose とローカル開発環境

| repo | path | 見どころ |
|---|---|---|
| core-backend | `docker-compose.yml` | 外部ネットワーク、LocalStack の init script、db / db-test 分離 |
| core-backend | `Dockerfile.migration` | マイグレーション専用イメージ |
| core-backend | `Makefile` | compose を make に隠蔽し override を自動で拾う |

### 3-03 サーバー運用基礎: keep-alive と graceful shutdown

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/node.ts` | keepAliveTimeout > ALB idle_timeout、25 秒タイムアウト付き多段 shutdown |
| ai-backend | `Dockerfile` | uvicorn --timeout-graceful-shutdown 110 と ECS stopTimeout 120 |

### 3-04 Observability: ログ・トレース・メトリクス

| repo | path | 見どころ |
|---|---|---|
| core-backend | `src/instrumentation.ts` | 計装対象より先にロードする |
| core-backend | `ecs/otel-collector/config.yaml` | OTLP 受信 → Datadog exporter |
| core-backend | `docker-compose.observability.yml` | Loki / Alloy / Grafana のローカルスタック |
| core-backend | `src/shared/logger/logger.ts` | trace_id / span_id の自動付与 |

### 3-05 CI: GitHub Actions

| repo | path | 見どころ |
|---|---|---|
| core-backend | `.github/workflows/pr-check-code.yml` | type-check + biome |
| core-backend | `.github/workflows/pr-integration-test.yml` | Testcontainers on CI |
| infra | `terraform/gh-action-linkage/` | GitHub OIDC provider と deploy ロール |
| ai-backend | `.github/workflows/image-smoke.yml` | production イメージの起動確認 |

### 3-06 Terraform 基礎と環境分離

| repo | path | 見どころ |
|---|---|---|
| infra | `terraform/variables.tf` | 命名 locals（`${env}-<service>-<domain>`）の集約 |
| infra | `terraform/vpc.tf` | cidrsubnet と natgw_count（prod 3 / dev 1） |
| infra | `terraform/security_group.tf` | ingress / egress rule を別リソースで定義 |
| infra | `terraform/aws.tf` | provider alias によるドメイン分離 |
| infra | `terraform/versions.tf` | HCP Terraform の cloud ブロック |

### 3-07 ECS Fargate + ALB + RDS

| repo | path | 見どころ |
|---|---|---|
| infra | `terraform/ecs.tf` | task_definition / desired_count を ignore_changes |
| infra | `terraform/alb.tf` | TLS1.3・アクセスログ・host-based routing |
| infra | `terraform/rds.tf` | Aurora Serverless v2、env で instance count |
| infra | `terraform/ssm.tf` | 84 パラメータが他リポとの契約面 |
| core-backend | `ecs/task-definitions/base.libsonnet` | jsonnet でタスク定義を DRY 化 |
| infra | `terraform/batch.tf` | 秘匿値を state に載せない方針（冒頭コメント） |

### 3-08 デプロイ戦略と運用ガード

| repo | path | 見どころ |
|---|---|---|
| infra | `.github/workflows/terraform-comment.yml` | dev → stg → prod 逐次 apply、全成功で自動マージ |
| infra | `.github/actions/tf-plan-fingerprint/` | apply 直前に再 plan して差分があれば中止 |
| infra | `.github/actions/tf-lock-lib/lock.js` | git ref をミューテックスにした apply ロック |
| infra | `terraform/preview.tf` | per-PR preview の共有基盤 |
| core-backend | `.github/workflows/preview-be.yml` | ラベル駆動で preview を upsert |
| core-backend | `.github/workflows/rollback.yml` | ロールバック |

## Appendix: AI エージェント基盤（ノートのみ）

### A-01 Python での DDD 構成と SQS ワーカー

| repo | path | 見どころ |
|---|---|---|
| ai-backend | `src/main.py` | ミドルウェア登録順の根拠をコメントで固定 |
| ai-backend | `src/workers/consumers/sqs_consumer.py` | aioboto3 の自作ワーカー |
| ai-backend | `src/domains/workers/protocols/` | Protocol による DIP |
| ai-backend | `src/shared/managers/langchain_manager/langchain_manager.py` | timeout / retry を本番実測値で決めた根拠コメント |

### A-02 エージェント実行基盤のサンドボックス設計

| repo | path | 見どころ |
|---|---|---|
| agent-platform | `Dockerfile` | root 所有 0444 の設定ファイル + 親 1770 で unlink を防ぐ |
| agent-platform | `src/tool-policy.ts` | 字面ベースの Bash 拒否リスト |
| agent-platform | `src/mcp-auth-proxy.ts` | invoke ごとに認証ヘッダを差し替えるローカル MCP プロキシ |
| agent-platform | `README.md` | 設計判断の長文記録 |

