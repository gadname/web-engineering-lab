import type { z } from "@hono/zod-openapi";

/**
 * `createRoute()` に渡す request / responses のボイラープレートを畳むヘルパー。
 *
 * OpenAPI は `content["application/json"].schema` のような深いネストを要求するので、
 * 素で書くとルート定義の大半がこの定型文になる。ヘルパーで隠すと「このルートは何を受けて何を返すか」だけが残る。
 */
export const openapi = {
	jsonBody: <T extends z.ZodTypeAny>(schema: T) => ({
		body: { content: { "application/json": { schema } }, required: true },
	}),
	params: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => ({ params: schema }),
	query: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => ({ query: schema }),

	json200: <T extends z.ZodTypeAny>(schema: T, description = "OK") => ({
		200: { content: { "application/json": { schema } }, description },
	}),
	json201: <T extends z.ZodTypeAny>(schema: T, description = "Created") => ({
		201: { content: { "application/json": { schema } }, description },
	}),
	noContent204: (description = "No Content") => ({ 204: { description } }),
	// 落とし穴: `[status]: {...}` のような computed key にすると TS がキーを string に広げ、
	// ハンドラの戻り値型から 404 が消えて「200 しか返せない」型エラーになる。ステータスごとに関数を分ける
	json404: <T extends z.ZodTypeAny>(schema: T, description = "Not Found") => ({
		404: { content: { "application/json": { schema } }, description },
	}),
	json422: <T extends z.ZodTypeAny>(schema: T, description = "Validation Error") => ({
		422: { content: { "application/json": { schema } }, description },
	}),
};
