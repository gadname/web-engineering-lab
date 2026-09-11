# 1-03 永続化: Prisma と PostgreSQL

> トラック: Track 1: Web 基礎 / 目安時間: 3 時間 / 前提: 02

## 学習目標
- Prisma schema でテーブル・命名（camelCase ↔ snake_case）・リレーションを設計できる
- マイグレーションの生成・適用・命名規則を運用できる
- 論理削除を view で扱う手法と、その制約を説明できる
- Testcontainers で使い捨て DB を使う統合テストを書ける

## 概要
インメモリの Map を PostgreSQL に置き換える。ORM（Prisma）で **スキーマを宣言し、マイグレーションで DB を追従させ、型付きクライアントで読み書きする** 流れを一通り体験する。
あわせて「論理削除」という頻出の要件を、view を使って安全に扱う設計と、本物の DB を使う統合テストの組み方を学ぶ。

## なぜ必要か
- **スキーマは契約**: API の契約（02）と同じく、DB のスキーマも「コードで宣言し、差分を履歴として残す」対象。手作業で `ALTER TABLE` すると環境ごとに DB がズレていく
- **命名の 2 重基準**: TypeScript は camelCase、SQL は snake_case が慣習。どちらかに寄せると片方が読みにくくなる。ORM のマッピング機能で両立させる
- **論理削除は `WHERE deleted_at IS NULL` の付け忘れとの戦い**: 100 箇所のクエリに条件を書くのではなく、「条件付きの view から読む」ことで構造的に防ぐ
- **モックの DB テストは嘘をつく**: index・制約・view・CASCADE の挙動はモックでは再現できない。使い捨ての本物を使う

## 仕組み

### Prisma の 3 点セット
| 要素 | 役割 | コマンド |
|---|---|---|
| `schema.prisma` | モデル定義（唯一の正） | — |
| `prisma migrate dev / deploy` | schema と DB の差分を SQL として履歴化・適用 | `dev` は開発（対話あり）、`deploy` は CI / 本番（適用のみ） |
| `prisma generate` | schema から型付きクライアントを生成 | `postinstall` で自動実行 |

### 命名の対応
```prisma
model ProjectRecord {
  createdAt DateTime @default(now()) @map("created_at")   // 列名
  @@map("projects")                                       // テーブル名
}
```
`@map` は「TS 側の名前 ↔ DB 側の名前」の翻訳表。マイグレーション SQL は DB 側の名前で生成される。

### 論理削除と view
```
projects（テーブル: 全行, deleted_at あり）  ← 書き込みはここ
    └─ projects_live（view: WHERE deleted_at IS NULL）  ← 読み取りはここ
```
- Prisma の `view` モデルは **読み取り専用** で、`create/update/delete` が生成されない。「読みは view、書きはテーブル」がコードで強制される
- view の DDL は Prisma が生成しない。**migration に手書き**する（演習の `lab_002`）
- テーブルに列を足したら、view も作り直す migration が必要（view は列を固定で列挙している）
- view には index を張れない。検索性能は実テーブル側の index（`deleted_at` の index など）に依存する

### マイグレーションの命名
`YYYYMMDDHHMMSS_<識別子>_<説明>`。時刻順に並び、識別子（チケット番号など）で「なぜこの変更か」を辿れる。
演習では `lab_001_init` / `lab_002_projects_live_view`。

### 統合テストの構造
```
vitest.config.integration.ts
  └─ globalSetup: postgresGlobalSetup.ts
       1. Testcontainers で postgres:16-alpine を起動
       2. prisma migrate deploy
       3. project.provide("databaseUrl", url)   ← テストは inject("databaseUrl") で受け取る
  └─ 各テスト: beforeEach で TRUNCATE（DB を作り直すより速い）
```
unit と integration で config を分けるのは、「Docker が無い環境でも unit は回る」状態を保つため。

## 実例
> 実例: 参考実装では schema の冒頭コメントで「views preview 機能で論理削除の live-only view を実現する」判断と、
> 「view モデルは read-only」「view には index を張れないので実テーブル側の複合 index が担う」という制約を明記している
> （core-backend/prisma/schema.prisma）
>
> 実例: 参考実装ではマイグレーションを `YYYYMMDDHHMMSS_kun_XXXX` と Linear のチケット番号で命名し、
> 変更の理由をチケットから辿れるようにしている（core-backend/prisma/migrations/）
>
> 実例: 参考実装では Testcontainers の globalSetup で Postgres を起動し `migrate deploy` してから `provide` する。
> 演習の構成はこれと同じ（core-backend/tests/integration/helpers/postgresGlobalSetup.ts）
>
> 実例: 参考実装では unit と integration の vitest config を分け、`INTEGRATION_TARGET` 環境変数で
> postgres / aws（LocalStack）/ 両方を切り替える。カバレッジ閾値は unit にだけ課す
> （core-backend/vitest.config.integration.ts）
>
> 実例: 参考実装の AI 側は「Prisma はスキーマ管理専用、実行時は asyncpg」と割り切り、その理由（pgvector の型非対応）を
> schema の冒頭に書いている。ORM を「全部」使わない選択もある（ai-backend/prisma/knowledgebase/schema.prisma）

## よくある落とし穴
- **PostgreSQL の単純 view は自動更新可能**。単一テーブルの `SELECT ... WHERE` で作った view には INSERT/UPDATE/DELETE が通り、基底テーブルに転送される。
  「view だから書けない」は SQL レベルでは嘘で、Prisma の型が塞いでいるだけ。演習のテストで確認する
- **view の列は固定**。テーブルに列を足しても view には現れない。`CREATE OR REPLACE VIEW` の migration が必要
- **`updateMany` と `update` の違い**。`update` は対象が無いと throw、`updateMany` は count 0 で返る。softDelete の「2 回目は false」は後者で書くと素直
- **`migrate dev` を本番で使わない**。schema と DB の差分を見て対話的に「リセットしますか」と聞いてくる。CI / 本番は `migrate deploy`
- **PrismaClient を毎回 new しない**。内部にコネクションプールを持つ。アプリで 1 つ、テストでは `afterAll` で `$disconnect()`
- **TRUNCATE と CASCADE**。外部キーで参照されるテーブルは `TRUNCATE ... CASCADE` でないと失敗する
- **Node は `.env` を自動で読まない**。Prisma CLI は読むので `migrate` は通り、アプリだけ「DATABASE_URL が無い」で落ちる。
  app では Node 組み込みの `--env-file-if-exists=.env` で読み、起動時に `loadConfig()` で環境変数を検証して fail-fast にした（`app/api/src/config.ts`）
- **生成物をコミットしない**。`src/generated/prisma` は `prisma generate` で再現できる。`.gitignore` に入れ、`postinstall` で生成する

## 演習
→ `exercises/track1-web/03-prisma-postgres/README.md`

Project / Task の schema とマイグレーション、live-only view、Repository、Testcontainers の統合テスト 10 ケース。

## 参考資料
- Prisma: Data model / Migrate / Views — https://www.prisma.io/docs
- PostgreSQL: Updatable Views — https://www.postgresql.org/docs/current/sql-createview.html#SQL-CREATEVIEW-UPDATABLE-VIEWS
- Testcontainers for Node — https://node.testcontainers.org/
- Vitest: globalSetup / provide-inject — https://vitest.dev/config/#globalsetup

## 確認問題
1. `@map` と `@@map` の違いは何か。マイグレーション SQL にはどちらの名前が出るか
2. 論理削除を view で扱う利点と、代わりに増える運用コストを 1 つずつ挙げよ
3. PostgreSQL の view が「自動更新可能」になる条件は何か。それに対して演習ではどこで書き込みを防いでいるか
4. `migrate dev` と `migrate deploy` をどの環境で使い分けるか
5. 統合テストで「DB を毎回作り直す」のではなく「TRUNCATE する」理由と、その代償は何か
