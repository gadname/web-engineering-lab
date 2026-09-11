# 進捗

凡例: ⬜ 未着手 / 🟨 骨子のみ / ✅ 完了

## Track 1: Web 基礎

| # | モジュール | ノート | 演習 | 検証 | app 反映 |
|---|---|---|---|---|---|
| 1-01 | [HTTP と REST、Hono ルーティング](docs/track1-web/01-hono-rest.md) | ✅ | ✅ | ✅ | ✅ |
| 1-02 | [スキーマ検証とコードファースト OpenAPI](docs/track1-web/02-zod-openapi.md) | ✅ | ✅ | ✅ | ✅ |
| 1-03 | [永続化: Prisma と PostgreSQL](docs/track1-web/03-prisma-postgres.md) | ✅ | ✅ | ✅ | ✅ |
| 1-04 | [認証: JWT と OIDC（Cognito）](docs/track1-web/04-jwt-auth.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 1-05 | [マルチテナントとリクエストコンテキスト](docs/track1-web/05-tenant-context.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 1-06 | [Next.js App Router とサーバー状態](docs/track1-web/06-nextjs-query.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 1-07 | [フォームとエラーハンドリング（FE）](docs/track1-web/07-form-error-handling.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 1-08 | [SSE とリアルタイム更新（任意）](docs/track1-web/08-sse-realtime.md) | 🟨 | ⬜ | ⬜ | ⬜ |

## Track 2: 設計手法

| # | モジュール | ノート | 演習 | 検証 | app 反映 |
|---|---|---|---|---|---|
| 2-01 | [レイヤードアーキテクチャと依存方向](docs/track2-design/01-layered-architecture.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 2-02 | [DDD 戦術パターン](docs/track2-design/02-ddd-tactical.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 2-03 | [リポジトリとファクトリ DI](docs/track2-design/03-repository-factory-di.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 2-04 | [ユースケースとトランザクション](docs/track2-design/04-usecase-transaction.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 2-05 | [CQRS: QueryService](docs/track2-design/05-cqrs-query-service.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 2-06 | [認可の 2 層モデルとガード](docs/track2-design/06-authorization-layers.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 2-07 | [エラー階層とレスポンス整形](docs/track2-design/07-error-hierarchy.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 2-08 | [テスト戦略と静的解析](docs/track2-design/08-testing-static-analysis.md) | 🟨 | ⬜ | ⬜ | ⬜ |

## Track 3: コンテナ・インフラ

| # | モジュール | ノート | 演習 | 検証 | app 反映 |
|---|---|---|---|---|---|
| 3-01 | [Docker 基礎とマルチステージビルド](docs/track3-container-infra/01-docker-multistage.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 3-02 | [docker-compose とローカル開発環境](docs/track3-container-infra/02-compose-local-dev.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 3-03 | [サーバー運用基礎: keep-alive と graceful shutdown](docs/track3-container-infra/03-graceful-shutdown.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 3-04 | [Observability: ログ・トレース・メトリクス](docs/track3-container-infra/04-observability.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 3-05 | [CI: GitHub Actions](docs/track3-container-infra/05-github-actions-ci.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 3-06 | [Terraform 基礎と環境分離](docs/track3-container-infra/06-terraform-basics.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 3-07 | [ECS Fargate + ALB + RDS](docs/track3-container-infra/07-ecs-alb-rds.md) | 🟨 | ⬜ | ⬜ | ⬜ |
| 3-08 | [デプロイ戦略と運用ガード](docs/track3-container-infra/08-deploy-strategy.md) | 🟨 | ⬜ | ⬜ | ⬜ |

## Appendix: AI エージェント基盤（ノートのみ）

| # | モジュール | ノート | 演習 | 検証 | app 反映 |
|---|---|---|---|---|---|
| A-01 | [Python での DDD 構成と SQS ワーカー](docs/appendix-ai/01-python-ddd-worker.md) | 🟨 | — | ⬜ | — |
| A-02 | [エージェント実行基盤のサンドボックス設計](docs/appendix-ai/02-agent-sandbox.md) | 🟨 | — | ⬜ | — |

