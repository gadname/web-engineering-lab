import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import type { IProjectRepository } from "@/repositories/projectRepository";
import {
	createProjectBodySchema,
	projectIdParamsSchema,
	projectListSchema,
	projectSchema,
	updateProjectBodySchema,
} from "@/routes/projects/schemas";
import { errorResponseSchema, handleValidationError, notFoundResponse } from "@/shared/errors";
import { openapi } from "@/shared/openapi";

/**
 * /projects のルート（演習 02 の構成 + 演習 03 の Repository）。
 * Repository は非同期なのでハンドラも async になる。Date は c.json() が ISO 文字列に変換する。
 */
export const createProjectRoutes = (repository: IProjectRepository) => {
	const app = new OpenAPIHono({ defaultHook: handleValidationError });

	app.openapi(
		createRoute({
			method: "get",
			path: "/",
			tags: ["projects"],
			summary: "プロジェクト一覧",
			responses: { ...openapi.json200(projectListSchema) },
		}),
		async (c) => c.json({ projects: (await repository.list()).map(serialize) }, 200),
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/",
			tags: ["projects"],
			summary: "プロジェクト作成",
			request: { ...openapi.jsonBody(createProjectBodySchema) },
			responses: { ...openapi.json201(projectSchema), ...openapi.json422(errorResponseSchema) },
		}),
		async (c) => {
			const body = c.req.valid("json");
			const project = await repository.create({ name: body.name, description: body.description ?? null });
			c.header("Location", `${new URL(c.req.url).pathname}/${project.id}`);
			return c.json(serialize(project), 201);
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
		async (c) => {
			const project = await repository.findById(c.req.valid("param").id);
			if (!project) return c.json(notFoundResponse("project"), 404);
			return c.json(serialize(project), 200);
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
		async (c) => {
			const project = await repository.update(c.req.valid("param").id, c.req.valid("json"));
			if (!project) return c.json(notFoundResponse("project"), 404);
			return c.json(serialize(project), 200);
		},
	);

	app.openapi(
		createRoute({
			method: "delete",
			path: "/{id}",
			tags: ["projects"],
			summary: "プロジェクト削除（論理削除）",
			request: { ...openapi.params(projectIdParamsSchema) },
			responses: {
				...openapi.noContent204(),
				...openapi.json404(errorResponseSchema),
				...openapi.json422(errorResponseSchema),
			},
		}),
		async (c) => {
			if (!(await repository.softDelete(c.req.valid("param").id)))
				return c.json(notFoundResponse("project"), 404);
			return c.body(null, 204);
		},
	);

	return app;
};

/** DB の Date を API の ISO 文字列に。レスポンススキーマ（projectSchema）の型に合わせる */
const serialize = (p: { id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date }) => ({
	id: p.id,
	name: p.name,
	description: p.description,
	createdAt: p.createdAt.toISOString(),
	updatedAt: p.updatedAt.toISOString(),
});
