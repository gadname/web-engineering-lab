# 1-03 永続化: Prisma と PostgreSQL

ノート: `docs/track1-web/03-prisma-postgres.md`

## ゴール
Project / Task を Prisma schema で定義し、マイグレーションで PostgreSQL に反映する。
論理削除を「生きている行だけの view」で扱う Repository を実装し、Testcontainers の使い捨て DB で統合テストを通す。

## 前提
- Docker Desktop が起動していること（統合テストと開発 DB に使う）

## 手順
1. `npm ci`（postinstall で `prisma generate` が走り `src/generated/prisma` ができる）
2. `cp .env.example .env`
3. `docker compose up -d --wait` で開発 DB（localhost:5433）を起動
4. `npm run db:migrate:dev` でマイグレーションを適用。`npx prisma studio` で中身を見る
5. `npm test`（DB 不要の unit）→ `npm run test:integration`（Testcontainers）
6. 壊してみる:
   - `schema.prisma` の `ProjectRecord` に `ownerName String?` を足して `npm run db:migrate:dev --name lab_003_owner` → view から見えないことを確認し、view を作り直す migration を書く
   - `softDelete` の `where` から `deletedAt: null` を外し、2 回目の削除で `deletedAt` が上書きされることを確認する
7. `docker compose down`

## 構成
```
prisma/
  schema.prisma                        ProjectRecord（テーブル）/ Project（view）/ Task
  migrations/
    20260910054928_lab_001_init/       Prisma が生成したテーブル DDL
    20260910055000_lab_002_projects_live_view/  手書きの CREATE VIEW
src/
  db.ts                                PrismaClient のファクトリ（接続先を差し替え可能）
  repositories/projectRepository.ts    IProjectRepository + Prisma 実装（読みは view、書きはテーブル）
  generated/prisma/                    生成物（.gitignore 済み）
tests/
  unit/toProject.test.ts               DB 不要の純関数テスト
  integration/helpers/postgresGlobalSetup.ts  Testcontainers 起動 → migrate deploy → provide
  integration/projectRepository.integration.test.ts  実 DB での 10 ケース
vitest.config.ts / vitest.config.integration.ts  unit と integration で config を分離
docker-compose.yml                     開発用 DB（5433）
```

## 受け入れ条件
- [x] DB 側のカラム名が snake_case になっている（`@map` の確認テスト）
- [x] `list` / `findById` が論理削除済みを返さない
- [x] `softDelete` 後も実テーブルに行が残り、2 回目は false
- [x] 削除済みの行は `update` できない
- [x] `tasks` が project の物理削除で CASCADE される
- [x] PostgreSQL の単純 view が自動更新可能であることを確認し、Prisma の型で書き込みを塞いでいると理解した
- [x] `npm run check` / `npm test` / `npm run test:integration` が通る

## app への反映
`app/api` は `IProjectStore`（インメモリ）をこの `IProjectRepository`（Prisma）に置き換え、
`app/docker-compose.yml` に `db` / `db-test` を持つ。マイグレーション命名は `YYYYMMDDHHMMSS_lab_NNN_<説明>` で統一する。
