import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ProjectAuthorizer } from "@/authorizers/project";
import { ActorResolverFactory } from "@/authorizers/shared/resolvers/factory";
import { PROJECT_DESCRIPTION_MAX_LENGTH } from "@/domains/project/valueObjects/projectDescription";
import { PROJECT_NAME_MAX_LENGTH } from "@/domains/project/valueObjects/projectName";
import { ProjectRepository } from "@/infrastructures/repositories/project";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import { createSchema } from "@/routes/shared/helpers/createSchema";
import { handleValidationError } from "@/routes/shared/helpers/handleExceptions";
import { openAPISchema } from "@/routes/shared/helpers/openAPISchema";
import { projectIdParamsSchema, projectResponseSchema } from "@/routes/v1/protected/tenantContext/projects/schemas";
import type { TenantApplicationEntry } from "@/shared/types/app";
import { type UpdateProjectCommand, UpdateProjectUsecase } from "@/usecases/project/updateProject";

export const updateProject = new OpenAPIHono<TenantApplicationEntry>({ defaultHook: handleValidationError });

const bodySchema = createSchema(
	{
		name: z.string().min(1).max(PROJECT_NAME_MAX_LENGTH).optional(),
		// null は「説明を消す」、undefined（省略）は「変更しない」
		description: z.string().max(PROJECT_DESCRIPTION_MAX_LENGTH).nullable().optional(),
	},
	"v1UpdateProjectBodySchema",
);

const route = createRoute({
	tags: ["projects"],
	description: "プロジェクトを部分更新する",
	method: "patch",
	path: "/{projectId}",
	request: { ...openAPISchema.requestParams(projectIdParamsSchema), ...openAPISchema.requestBody(bodySchema) },
	responses: openAPISchema.response200(projectResponseSchema),
});

updateProject.openapi(route, async (c) => {
	const payload = c.get("tenantContextPayload");
	const { projectId } = c.req.valid("param");
	const body = c.req.valid("json");

	const { dbClient, txManager } = DatabaseClientFactory.create({});
	const actorResolver = ActorResolverFactory.create({ dbClient });
	const usecase = new UpdateProjectUsecase(
		new ProjectRepository(dbClient),
		new ProjectAuthorizer(actorResolver),
		txManager,
	);

	const command: UpdateProjectCommand = {
		actorId: payload.membershipId,
		projectId,
		name: body.name,
		description: body.description,
	};
	return c.json(await usecase.execute(command), 200);
});
