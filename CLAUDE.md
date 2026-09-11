# taskboard 開発ガイドライン

マルチテナントのタスク管理 API。実務プロダクト（参考実装）の設計を最小構成で踏襲している。
参考実装はローカルに読み取り専用でクローンされている。参考にはするが、コード・スキーマ・設定値を転載しない。

## アーキテクチャ
- 4 層: routes（プレゼンテーション）/ usecases（アプリケーション）/ domains（ドメイン）/ infrastructures（インフラ）
- 依存の向き: `routes → usecases → domains ← infrastructures, authorizers, guards`。domains は他層を import しない
- 集約は ID で他の集約を参照する。実体が要るときは `asReadOnly()` した read-only のみ
- 認可は 2 層: userContext（操作者 = UserId）/ tenantContext（操作者 = MembershipId）。IF は domains、実装は authorizers
- Repository の書き込みは `AllowedAggregation` / `AllowedId` しか受けない。`unsafe*` はシード・テスト専用
- 一覧は QueryService（Read Model / DTO）。集約を復元しない
- ユースケースは `@databaseTx` で 1 トランザクション。Repository はトランザクションの有無を知らない

## 新機能の置き場所
| 追加するもの | 場所 |
|---|---|
| 集約・値オブジェクト・Repository IF・Authorizer IF | `src/domains/<name>/` |
| Repository / QueryService の Prisma 実装 | `src/infrastructures/repositories/`, `src/infrastructures/queries/` |
| 認可の実装 | `src/authorizers/` |
| 業務ルール（重複・上限など集約単体で判定できないもの） | `src/guards/` |
| ユースケース | `src/usecases/<name>/` |
| エンドポイント（1 エンドポイント 1 ファイル） | `src/routes/v1/protected/{userContext,tenantContext}/<name>/` |
| エラーコード → 定義 → 文言 | `src/shared/errors/codes/` → `definitions/` → `messages/` |

新しいファイルは同階層の既存ファイルに倣う。

## コーディング規約
- TypeScript strict。`any` 禁止（`unknown` を使う）。欠損は `undefined` より `null`（JSON / DB 互換）
- import は `@/` の絶対パス。ファイル名は camelCase
- `interface`: ドメインの契約（`IProjectRepository`）/ `type`: データの形
- Prisma: TypeScript 側 camelCase、DB 側 snake_case（`@map`）
- エラーは `throw new <層>Exception(ERROR_CODE, { data, cause })`。HTTP ステータス・文言は definitions に置き、throw 箇所に書かない
- ログは `Logger`。requestId / userId / tenantId は自動付与されるので渡さない

## 完了条件
```bash
make check   # type-check + biome
make test    # unit
```
DB を触った変更は `make test-integration` も通す（Docker 必須）。

## 禁止事項
- 参考実装のコード・スキーマ・SSM パス・アカウント ID・認証設定値の転載
- 参考実装リポジトリへの変更
- Terraform の AWS 実 apply
