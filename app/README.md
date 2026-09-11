# taskboard（積み上げアプリ）

各トラックの演習で学んだことを反映して育てるアプリ。Track 1 の 01〜03 を反映した状態が現在地。

```
Workspace（テナント） ─┬─ Member（所属ユーザー）     ← Track 1-04/05 で追加
                       └─ Project ─── Task           ← 現在: Project の CRUD、Task はテーブルのみ
```

## 構成
| ディレクトリ | 内容 | 状態 |
|---|---|---|
| `api/` | Hono + Zod-OpenAPI + Prisma の REST API | 1-01〜1-03 反映済み |
| `web/` | Next.js App Router | 1-06 で追加 |
| `infra/` | Terraform | 3-06 で追加 |
| `docker-compose.yml` | ローカル DB（`make up` / `make down`） | 3-01 以降で api / LocalStack を追加 |

## 起動
```bash
make up                      # リポジトリルートで。db (localhost:5434) を起動
cd app/api
cp .env.example .env         # 初回のみ
npm ci                       # postinstall で prisma generate
npm run db:migrate           # マイグレーション適用
npm run dev                  # http://localhost:8787  (/api/swagger で UI)
```

## テスト
```bash
cd app/api
npm run check                # type-check + biome
npm test                     # unit（インメモリ Repository）
npm run test:integration     # Testcontainers の実 DB
npm run openapi:generate     # openapi.json を更新（web の型生成の入力）
```

## api/ の構成（現在）
```
src/
  index.ts                     エントリ。Prisma 実装を組み立てて serve
  app.ts                       createApp(deps)。/health, /api/doc, /api/swagger, notFound/onError
  routes/projects/             schemas.ts + index.ts（createRoute で 5 オペレーション）
  repositories/
    projectRepository.ts       IProjectRepository + Prisma 実装（読みは view、書きはテーブル）
    inMemoryProjectRepository.ts  テスト用
  shared/                      createSchema / openapi / errors ヘルパー
  db.ts                        PrismaClient ファクトリ
prisma/                        schema + migrations（lab_001_init, lab_002_projects_live_view）
scripts/generateOpenapi.ts     openapi.json を出力
tests/unit, tests/integration
```

## 今後の反映予定
- 1-04: JWT 認証ミドルウェア（Strategy）
- 1-05: Workspace / Member とテナントミドルウェア、AsyncLocalStorage、構造化ログ
- 1-06/07: `web/` を追加し `openapi.json` から型生成
- Track 2: `routes → usecases → domains ← infrastructures` へ再構成
- Track 3: Dockerfile（多段）、compose に api / LocalStack、OTel、CI、Terraform
