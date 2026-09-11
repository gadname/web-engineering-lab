# taskboard

Hono + Prisma + PostgreSQL で作るマルチテナントのタスク管理 API。
実務プロダクトのバックエンド設計（4 層 + DDD 戦術 + 2 層認可 + Factory DI）を、
最小のドメイン（Tenant / Membership / User / Project）で組んだもの。作りながら設計を学ぶための土台。

## 起動

```bash
make setup        # api/ で npm ci（postinstall で prisma generate）
make up           # PostgreSQL（db / db-test）と api コンテナ
make db-migrate   # マイグレーション適用
make db-seed      # dev-user（ADMIN）/ dev-guest（GUEST）とテナントを投入
make dev          # ホストで API を起動する場合（make up の api は止めてよい）
```

- Swagger: http://localhost:8787/api/swagger
- OpenAPI: http://localhost:8787/api/doc

ローカルの認証は `Authorization: Bearer <userId>`（Swagger の Authorize に userId を入れる）。テナント系は `X-Tenant-ID` が必須。

```bash
curl -s http://localhost:8787/api/v1/users/me -H 'Authorization: Bearer dev-user' | jq
curl -s http://localhost:8787/api/v1/tenants/projects \
  -H 'Authorization: Bearer dev-user' -H 'X-Tenant-ID: 00000000-0000-4000-8000-000000000001' \
  -H 'content-type: application/json' -d '{"name":"first project"}' | jq
```

## 検証

```bash
make check             # type-check + biome
make test              # unit（Docker 不要）
make test-integration  # Testcontainers で PostgreSQL を起動して実 DB を通す（Docker 必須）
```

## 構成

```
api/src/
  routes/          プレゼンテーション層。1 エンドポイント 1 ファイル。検証 → 依存の組み立て → ユースケース実行
  usecases/        アプリケーション層。値オブジェクト化 → 認可 → Guard → 保存。@databaseTx で 1 トランザクション
  domains/         ドメイン層。集約・値オブジェクト・Repository / Authorizer の「契約」（実装は持たない）
  authorizers/     認可の実装（ルールの合成: テナント所属 × ロール）
  guards/          集約単体では判定できない業務ルール（重複・件数上限）
  infrastructures/ Prisma 実装（Repository / QueryService / DB クライアント）
  shared/          設定・ログ・リクエストコンテキスト・エラー定義・例外・ミドルウェア
```

依存の向きは `routes → usecases → domains ← infrastructures / authorizers`。ドメイン層は他の層を import しない。
規約の詳細は [CLAUDE.md](CLAUDE.md)。

## 次に足すもの（学習の順路）

1. `Task` 集約（Project 配下）。Project と同じ経路（domain → repository IF → Prisma 実装 → authorizer → usecase → route）をなぞる
2. IdP（Cognito 等）向けの `IAuthenticator` 実装。`AuthenticatorFactory` の `default` を埋める
3. フロントエンド（Next.js）。`npm run openapi:generate` の出力から型を生成する
4. Observability（OpenTelemetry）と CI（GitHub Actions）、Terraform
