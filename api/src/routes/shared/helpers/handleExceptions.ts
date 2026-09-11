import { REQUEST_VALIDATION_ERROR_CODES } from "@/shared/errors/codes/validation/requestValidationErrors";
import { RouteException } from "@/shared/exceptions/routeException";
import type { Result } from "@/shared/types/utility";

/**
 * zod 検証失敗を RouteException（422）に変換する defaultHook。
 * @hono/zod-openapi はデフォルトで 400 + ZodError をそのまま返すので、他のエラーと同じ形に揃える。
 */
export const handleValidationError = (result: Result) => {
	if (!result.success) {
		throw new RouteException(REQUEST_VALIDATION_ERROR_CODES.UNPROCESSABLE_ENTITY, {
			cause: result.error,
			data: { issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
		});
	}
};
