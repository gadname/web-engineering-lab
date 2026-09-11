import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ProjectAuthorizer } from "@/authorizers/project";
import { ActorResolverFactory } from "@/authorizers/shared/resolvers/factory";
import { ProjectRepository } from "@/infrastructures/repositories/project";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import { handleValidationError } from "@/routes/shared/helpers/handleExceptions";
import { openAPISchema } from "@/routes/shared/helpers/openAPISchema";
import { projectIdParamsSchema, projectResponseSchema } from "@/routes/v1/protected/tenantContext/projects/schemas";
import type { TenantApplicationEntry } from "@/shared/types/app";
import { type GetProjectCommand, GetProjectUsecase } from "@/usecases/project/getProject";

export const getProject = new OpenAPIHono<TenantApplicationEntry>({ defaultHook: handleValidationError });

const route = createRoute({
	tags: ["projects"],
	description: "プロジェクトを 1 件取得する",
	method: "get",
	path: "/{projectId}",
	request: openAPISchema.requestParams(projectIdParamsSchema),
	responses: openAPISchema.response200(projectResponseSchema),
});

getProject.openapi(route, async (c) => {
	const payload = c.get("tenantContextPayload");
	const { projectId } = c.req.valid("param");

	const { dbClient, txManager } = DatabaseClientFactory.create({});
	const actorResolver = ActorResolverFactory.create({ dbClient });
	const usecase = new GetProjectUsecase(
		new ProjectRepository(dbClient),
		new ProjectAuthorizer(actorResolver),
		txManager,
	);

	const command: GetProjectCommand = { actorId: payload.membershipId, projectId };
	return c.json(await usecase.execute(command), 200);
});
