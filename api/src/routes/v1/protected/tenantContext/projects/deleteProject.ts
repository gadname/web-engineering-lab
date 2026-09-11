import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ProjectAuthorizer } from "@/authorizers/project";
import { ActorResolverFactory } from "@/authorizers/shared/resolvers/factory";
import { ProjectRepository } from "@/infrastructures/repositories/project";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import { handleValidationError } from "@/routes/shared/helpers/handleExceptions";
import { openAPISchema } from "@/routes/shared/helpers/openAPISchema";
import { projectIdParamsSchema } from "@/routes/v1/protected/tenantContext/projects/schemas";
import type { TenantApplicationEntry } from "@/shared/types/app";
import { type DeleteProjectCommand, DeleteProjectUsecase } from "@/usecases/project/deleteProject";

export const deleteProject = new OpenAPIHono<TenantApplicationEntry>({ defaultHook: handleValidationError });

const route = createRoute({
	tags: ["projects"],
	description: "プロジェクトを削除する（論理削除）",
	method: "delete",
	path: "/{projectId}",
	request: openAPISchema.requestParams(projectIdParamsSchema),
	responses: openAPISchema.response204(),
});

deleteProject.openapi(route, async (c) => {
	const payload = c.get("tenantContextPayload");
	const { projectId } = c.req.valid("param");

	const { dbClient, txManager } = DatabaseClientFactory.create({});
	const actorResolver = ActorResolverFactory.create({ dbClient });
	const usecase = new DeleteProjectUsecase(
		new ProjectRepository(dbClient),
		new ProjectAuthorizer(actorResolver),
		txManager,
	);

	const command: DeleteProjectCommand = { actorId: payload.membershipId, projectId };
	await usecase.execute(command);
	return c.body(null, 204);
});
