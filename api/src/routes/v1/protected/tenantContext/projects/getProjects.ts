import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GetProjectsQueryServiceAuthorizer } from "@/authorizers/getProjectsQueryServiceAuthorizer";
import { ActorResolverFactory } from "@/authorizers/shared/resolvers/factory";
import { GetProjectsQueryService } from "@/infrastructures/queries/getProjectsQueryService";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import { createSchema } from "@/routes/shared/helpers/createSchema";
import { handleValidationError } from "@/routes/shared/helpers/handleExceptions";
import { openAPISchema } from "@/routes/shared/helpers/openAPISchema";
import type { TenantApplicationEntry } from "@/shared/types/app";
import { type GetProjectsCommand, GetProjectsUsecase } from "@/usecases/project/getProjects";

export const getProjects = new OpenAPIHono<TenantApplicationEntry>({ defaultHook: handleValidationError });

const querySchema = createSchema(
	{
		search: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
		limit: z.coerce.number().int().positive().max(100).optional(),
	},
	"v1GetProjectsQuerySchema",
);

const responseSchema = createSchema(
	{
		projects: z.array(
			z.object({
				id: z.string(),
				name: z.string(),
				description: z.string().nullable(),
				createdAt: z.string(),
				updatedAt: z.string(),
			}),
		),
		pagination: z.object({
			currentPage: z.number(),
			totalPages: z.number(),
			totalCount: z.number(),
			hasNext: z.boolean(),
			hasPrevious: z.boolean(),
		}),
	},
	"v1GetProjectsResponseSchema",
);

const route = createRoute({
	tags: ["projects"],
	description: "テナントのプロジェクト一覧を取得する（検索・ページネーション）",
	method: "get",
	path: "/",
	request: openAPISchema.requestQuery(querySchema),
	responses: openAPISchema.response200(responseSchema),
});

getProjects.openapi(route, async (c) => {
	const payload = c.get("tenantContextPayload");
	const query = c.req.valid("query");

	const { dbClient, txManager } = DatabaseClientFactory.create({});
	const actorResolver = ActorResolverFactory.create({ dbClient });
	const usecase = new GetProjectsUsecase(
		new GetProjectsQueryServiceAuthorizer(actorResolver),
		new GetProjectsQueryService(dbClient),
		txManager,
	);

	const command: GetProjectsCommand = {
		actorId: payload.membershipId,
		tenantId: payload.tenantId,
		search: query.search,
		page: query.page,
		limit: query.limit,
	};
	return c.json(await usecase.execute(command), 200);
});
