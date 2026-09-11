import type { Hook } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import type { Env } from "hono";
import { createSchema } from "@/shared/createSchema";

/**
 * エラーレスポンスの形もスキーマとして公開する。
 * クライアントは `components["schemas"]["ErrorResponse"]` の型で error を扱えるようになる。
 */
export const errorResponseSchema = createSchema(
	{
		error: z.object({
			code: z.string(),
			message: z.string(),
			details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
		}),
	},
	"ErrorResponse",
);

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const notFoundResponse = (resource: string): ErrorResponse => ({
	error: { code: "NOT_FOUND", message: `${resource} not found` },
});

/**
 * バリデーション失敗時の共通フック。
 *
 * `@hono/zod-openapi` はデフォルトでは検証失敗を 400 + Zod のエラーオブジェクトそのままで返す。
 * それではレスポンス形が他のエラーと揃わないので、`defaultHook` で 422 + ErrorResponse 形に変換する。
 * 「入力の形は正しいが内容が不正」を 422 にし、「JSON として壊れている」400 と区別する流儀。
 */
export const handleValidationError: Hook<unknown, Env, string, unknown> = (result, c) => {
	if (!result.success) {
		const body: ErrorResponse = {
			error: {
				code: "VALIDATION_ERROR",
				message: "request validation failed",
				details: result.error.issues.map((issue) => ({
					path: issue.path.join("."),
					message: issue.message,
				})),
			},
		};
		return c.json(body, 422);
	}
};
