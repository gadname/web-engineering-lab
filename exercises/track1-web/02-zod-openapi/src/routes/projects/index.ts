import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
	createProjectBodySchema,
	projectIdParamsSchema,
	projectListSchema,
	projectSchema,
	updateProjectBodySchema,
} from "@/routes/projects/schemas";
import { errorResponseSchema, handleValidationError, notFoundResponse } from "@/shared/errors";
import { openapi } from "@/shared/openapi";
import type { IProjectStore } from "@/store";

/**
 * /projects のルート。
 *
 * `createRoute()` でメソッド・パス・入出力スキーマを「宣言」し、`.openapi(route, handler)` で実装を結びつける。
 * 宣言が OpenAPI になり、同時にハンドラの `c.req.valid()` と `c.json()` の型にもなる。
 * つまり「ドキュメント」「実行時検証」「静的型」が 1 つの定義から出る。これがコードファーストの利点。
 */
export const createProjectRoutes = (store: IProjectStore) => {
	const app = new OpenAPIHono({ defaultHook: handleValidationError });

	app.openapi(
		createRoute({
			method: "get",
			path: "/",
			tags: ["projects"],
			summary: "プロジェクト一覧",
			responses: { ...openapi.json200(projectListSchema) },
		}),
		(c) => c.json({ projects: store.list() }, 200),
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/",
			tags: ["projects"],
			summary: "プロジェクト作成",
			request: { ...openapi.jsonBody(createProjectBodySchema) },
			responses: {
				...openapi.json201(projectSchema),
				...openapi.json422(errorResponseSchema),
			},
		}),
		(c) => {
			// valid("json") は createProjectBodySchema で検証済み・型付きの値を返す
			const body = c.req.valid("json");
			const project = store.create({ name: body.name, description: body.description ?? null });
			c.header("Location", `${new URL(c.req.url).pathname}/${project.id}`);
			return c.json(project, 201);
		},
	);

	app.openapi(
		createRoute({
			method: "get",
			path: "/{id}",
			tags: ["projects"],
			summary: "プロジェクト取得",
			request: { ...openapi.params(projectIdParamsSchema) },
			responses: {
				...openapi.json200(projectSchema),
				...openapi.json404(errorResponseSchema),
				...openapi.json422(errorResponseSchema),
			},
		}),
		(c) => {
			const { id } = c.req.valid("param");
			const project = store.get(id);
			if (!project) return c.json(notFoundResponse("project"), 404);
			return c.json(project, 200);
		},
	);

	app.openapi(
		createRoute({
			method: "patch",
			path: "/{id}",
			tags: ["projects"],
			summary: "プロジェクト部分更新",
			request: { ...openapi.params(projectIdParamsSchema), ...openapi.jsonBody(updateProjectBodySchema) },
			responses: {
				...openapi.json200(projectSchema),
				...openapi.json404(errorResponseSchema),
				...openapi.json422(errorResponseSchema),
			},
		}),
		(c) => {
			const { id } = c.req.valid("param");
			const body = c.req.valid("json");
			const project = store.update(id, body);
			if (!project) return c.json(notFoundResponse("project"), 404);
			return c.json(project, 200);
		},
	);

	app.openapi(
		createRoute({
			method: "delete",
			path: "/{id}",
			tags: ["projects"],
			summary: "プロジェクト削除",
			request: { ...openapi.params(projectIdParamsSchema) },
			responses: {
				...openapi.noContent204(),
				...openapi.json404(errorResponseSchema),
				...openapi.json422(errorResponseSchema),
			},
		}),
		(c) => {
			const { id } = c.req.valid("param");
			if (!store.delete(id)) return c.json(notFoundResponse("project"), 404);
			return c.body(null, 204);
		},
	);

	return app;
};
