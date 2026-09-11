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
import { projectResponseSchema } from "@/routes/v1/protected/tenantContext/projects/schemas";
import type { TenantApplicationEntry } from "@/shared/types/app";
import { type CreateProjectCommand, CreateProjectUsecase } from "@/usecases/project/createProject";

/**
 * 1 エンドポイント 1 ファイル。ルートの責務は
 *   リクエストの形の検証 → 依存の組み立て → ユースケース実行 → レスポンスの形に整形
 * だけ。業務ルールはユースケースとドメインに置く。
 */
export const createProject = new OpenAPIHono<TenantApplicationEntry>({ defaultHook: handleValidationError });

const bodySchema = createSchema(
	{
		// 形式の上限は値オブジェクトと同じ値を使う（ルートで先に弾き、422 で返す）
		name: z.string().min(1).max(PROJECT_NAME_MAX_LENGTH),
		description: z.string().max(PROJECT_DESCRIPTION_MAX_LENGTH).nullable().optional(),
	},
	"v1CreateProjectBodySchema",
);

const route = createRoute({
	tags: ["projects"],
	description: "プロジェクトを作成する",
	method: "post",
	path: "/",
	request: openAPISchema.requestBody(bodySchema),
	responses: openAPISchema.response201(projectResponseSchema),
});

createProject.openapi(route, async (c) => {
	const payload = c.get("tenantContextPayload");
	const body = c.req.valid("json");

	const { dbClient, txManager } = DatabaseClientFactory.create({});
	const actorResolver = ActorResolverFactory.create({ dbClient });
	const usecase = new CreateProjectUsecase(
		new ProjectRepository(dbClient),
		new ProjectAuthorizer(actorResolver),
		txManager,
	);

	const command: CreateProjectCommand = {
		actorId: payload.membershipId,
		tenantId: payload.tenantId,
		name: body.name,
		description: body.description,
	};
	const result = await usecase.execute(command);
	return c.json(result, 201);
});
