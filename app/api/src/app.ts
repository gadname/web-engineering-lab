import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import type { IProjectRepository } from "@/repositories/projectRepository";
import { createProjectRoutes } from "@/routes/projects";
import { type ErrorResponse, errorResponseSchema } from "@/shared/errors";

export type AppDependencies = {
	projectRepository: IProjectRepository;
};

/**
 * taskboard API の組み立て。
 *
 * 依存（Repository）は引数で受け取る。本番は src/index.ts が Prisma 実装を、テストはインメモリ実装を渡す。
 * Track 2 でこの「依存の組み立て」を Factory に切り出し、層を分ける。
 */
export const createApp = (deps: AppDependencies) => {
	const root = new OpenAPIHono();
	root.get("/health", (c) => c.json({ status: "ok" }));

	const api = new OpenAPIHono().basePath("/api");
	api.use(requestId());
	api.route("/projects", createProjectRoutes(deps.projectRepository));

	api.doc("/doc", {
		openapi: "3.0.0",
		info: { title: "taskboard API", version: "0.1.0" },
	});
	api.openAPIRegistry.register("ErrorResponse", errorResponseSchema);
	api.get("/swagger", swaggerUI({ url: "/api/doc" }));

	root.route("/", api);

	root.notFound((c) => {
		const body: ErrorResponse = { error: { code: "NOT_FOUND", message: "route not found" } };
		return c.json(body, 404);
	});
	root.onError((err, c) => {
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
