import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { createSchema } from "@/routes/shared/helpers/createSchema";
import type { ApplicationEntry } from "@/shared/types/app";

export const health = new OpenAPIHono<ApplicationEntry>();

const responseSchema = createSchema({ status: z.string() }, "HealthResponseSchema");

/** ロードバランサのヘルスチェック用。ミドルウェア無しの rootApp に置き、常に 200 を返す */
health.openapi(
	createRoute({
		tags: ["health"],
		method: "get",
		path: "/",
		responses: { 200: { content: { "application/json": { schema: responseSchema } }, description: "OK" } },
	}),
	(c) => c.json({ status: "ok" }, 200),
);
