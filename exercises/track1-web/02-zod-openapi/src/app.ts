import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { createProjectRoutes } from "@/routes/projects";
import { type ErrorResponse, errorResponseSchema } from "@/shared/errors";
import { InMemoryProjectStore, type IProjectStore } from "@/store";

export type AppOptions = {
	store?: IProjectStore;
};

export const createApp = (options: AppOptions = {}) => {
	const store = options.store ?? new InMemoryProjectStore();

	const root = new OpenAPIHono();
	root.get("/health", (c) => c.json({ status: "ok" }));

	const api = new OpenAPIHono().basePath("/api");
	api.use(requestId());
	api.route("/projects", createProjectRoutes(store));

	// spec の出力先。sub-app に登録したルートも basePath 込みで集約される
	api.doc("/doc", {
		openapi: "3.0.0",
		info: { title: "taskboard API (exercise 02)", version: "0.1.0" },
	});
	// ルートに紐づかないスキーマ（ErrorResponse）も components に載せておく
	api.openAPIRegistry.register("ErrorResponse", errorResponseSchema);
	// 人間向けの閲覧 UI。/api/doc を読み込む
	api.get("/swagger", swaggerUI({ url: "/api/doc" }));

	root.route("/", api);

	root.notFound((c) => {
		const body: ErrorResponse = { error: { code: "NOT_FOUND", message: "route not found" } };
		return c.json(body, 404);
	});
	root.onError((err, c) => {
		// Hono 自身が投げる HTTPException（壊れた JSON → 400 など）は、そのステータスを尊重する。
		// これを 500 に潰すと「クライアントの入力ミス」が「サーバ障害」としてエラーレートに乗ってしまう
		if (err instanceof HTTPException) {
			const body: ErrorResponse = { error: { code: "BAD_REQUEST", message: err.message } };
			return c.json(body, err.status);
		}
		console.error(err);
		const body: ErrorResponse = { error: { code: "INTERNAL_SERVER_ERROR", message: "unexpected error" } };
		return c.json(body, 500);
	});

	return root;
};
