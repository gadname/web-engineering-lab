# taskboard 開発ガイドライン

マルチテナントのタスク管理。実務プロダクト（参考実装: core-backend / core-frontend / ai-backend）の設計を最小構成で踏襲する。
参考実装はローカルに読み取り専用でクローンされている。参考にはするが、コード・スキーマ・設定値を転載しない。

## 全体
- 3 サービス: `api/`（Hono）/ `web/`（Next.js）/ `ai/`（FastAPI + worker）。ルートの `Makefile` と `docker-compose.yml` で束ねる
- 依存の向きはどのサービスも `routes → usecases → domains ← infrastructures`。domains は他層を import しない
- エラーレスポンスは api / ai とも `{ statusCode, errorCode, message, details? }`。web は 1 つの型で扱う
- 認証は Bearer（ローカルは userId そのもの）、テナント文脈は `X-Tenant-ID` ヘッダ。3 サービスで同じ約束
- 完了条件: `make check` と `make test`。DB / キューを触った変更は `make test-integration` も通す（Docker 必須）
- API のスキーマを変えたら `make generate-client` で web の型を再生成し、web の型エラーを直す

## api（TypeScript / Hono / Prisma）
- 集約は ID で他の集約を参照。実体が要るときは `asReadOnly()` した read-only のみ
- 認可は 2 層: userContext（UserId）/ tenantContext（MembershipId）。IF は domains、実装は authorizers
- Repository の書き込みは `AllowedAggregation` / `AllowedId` しか受けない。`unsafe*` はシード・テスト専用
- 一覧は QueryService（Read Model）。ユースケースは `@databaseTx` で 1 トランザクション
- 置き場所: 集約 `src/domains/<name>/`、Prisma 実装 `src/infrastructures/`、認可 `src/authorizers/`、業務ルール `src/guards/`、エンドポイント `src/routes/v1/protected/{userContext,tenantContext}/<name>/`（1 エンドポイント 1 ファイル）
- エラーは `throw new <層>Exception(CODE, { data, cause })`。コード → `shared/errors/codes` → `definitions` → `messages` の順に足す
- TypeScript strict、`any` 禁止（`unknown`）、欠損は `null`。import は `@/`。ファイル名 camelCase

## web（TypeScript / Next.js）
- `app/` はルーティング専用。page.tsx は `page-components` を返すだけ
- `components/<feature>/<name>/index.tsx`（Container: フック・状態）と `presentation.tsx`（見た目: props だけ）に分ける
- API 呼び出しは `services/http/<resource>/` の functions / hooks / keys / types。コンポーネントは生成型を直接 import しない
- データ取得は TanStack Query、フォームは react-hook-form + zod、スタイルは Tailwind
- ミューテーションの失敗は `useErrorHandler`（422 はフィールドへ、他は toast）
- ファイル・ディレクトリ名は kebab-case。import は `@/`

## ai（Python 3.12 / FastAPI / asyncpg）
- 集約・値オブジェクトは pydantic の frozen モデル。状態変更は `model_copy` で新しいインスタンスを返す
- 契約は `Protocol`（`XxxRepositoryProtocol`, `SummarizerProtocol`, `JobQueueProtocol`）。実装は infrastructures、生成は Factory
- Repository の更新は楽観ロック（`version`）。競合は `OptimisticLockException`
- キューは PostgreSQL（`FOR UPDATE SKIP LOCKED` + visibility timeout）。worker は at-least-once 前提でべき等に書く
- ログは `logger.info("msg", **logger.with_context(k=v))`。ドメイン層ではログを出さない。エラーログは例外ハンドラでのみ
- 型ヒント必須（ruff ANN）。`Optional[T]` ではなく `T | None`。同じ集約内は相対 import、他の集約は `src.` から絶対 import
- 完了後は `uv run ruff check --fix . && uv run ruff format .`

## 禁止事項
- 参考実装のコード・スキーマ・SSM パス・アカウント ID・認証設定値の転載
- 参考実装リポジトリへの変更
- Terraform の AWS 実 apply
