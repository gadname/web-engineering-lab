import type { MembershipErrorCode } from "./domains/membershipErrors";
import type { ProjectErrorCode } from "./domains/projectErrors";
import type { TenantErrorCode } from "./domains/tenantErrors";
import type { UserErrorCode } from "./domains/userErrors";
import type { DomainValidationErrorCode } from "./domains/validationErrors";
import type { DatabaseErrorCode } from "./system/databaseErrors";
import type { InfrastructureErrorCode } from "./system/infrastructureErrors";
import type { MiddlewareErrorCode } from "./system/middlewareErrors";
import type { RequestValidationErrorCode } from "./validation/requestValidationErrors";

/**
 * 全エラーコードの合併型。
 *
 * エラーコードは `<領域>.<操作/分類>.<内容>` の 3 階層。領域を先頭に置くことで、
 * ログの grep とフロントエンドの分岐（領域単位）がしやすくなる。
 * 新しいコードを足したら `definitions/` に定義（HTTP ステータス・メッセージ・ログレベル）を必ず追加する。
 * 定義漏れは `tests/unit/shared/errors/definitions.test.ts` が検出する。
 */
export type AllErrorCode =
	| ProjectErrorCode
	| MembershipErrorCode
	| TenantErrorCode
	| UserErrorCode
	| DomainValidationErrorCode
	| DatabaseErrorCode
	| InfrastructureErrorCode
	| MiddlewareErrorCode
	| RequestValidationErrorCode;
