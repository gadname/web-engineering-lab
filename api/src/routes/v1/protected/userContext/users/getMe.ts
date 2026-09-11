import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { MEMBERSHIP_ROLE_VALUES } from "@/domains/membership/valueObjects/membershipRole";
import { MembershipRepository } from "@/infrastructures/repositories/membership";
import { UserRepository } from "@/infrastructures/repositories/user";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import { createSchema } from "@/routes/shared/helpers/createSchema";
import { handleValidationError } from "@/routes/shared/helpers/handleExceptions";
import { openAPISchema } from "@/routes/shared/helpers/openAPISchema";
import type { ApplicationEntry } from "@/shared/types/app";
import { type GetMeCommand, GetMeUsecase } from "@/usecases/user/getMe";

export const getMe = new OpenAPIHono<ApplicationEntry>({ defaultHook: handleValidationError });

const responseSchema = createSchema(
	{
		id: z.string(),
		emailAddress: z.string(),
		name: z.string(),
		memberships: z.array(
			z.object({
				membershipId: z.string(),
				tenantId: z.string(),
				role: z.enum(MEMBERSHIP_ROLE_VALUES),
			}),
		),
	},
	"v1GetMeResponseSchema",
);

const route = createRoute({
	tags: ["users"],
	description: "認証中のユーザー自身と所属テナントの一覧を取得する",
	method: "get",
	path: "/me",
	responses: openAPISchema.response200(responseSchema),
});

getMe.openapi(route, async (c) => {
	const auth = c.get("authJWTPayload");
	const { dbClient, txManager } = DatabaseClientFactory.create({});
	const usecase = new GetMeUsecase(new UserRepository(dbClient), new MembershipRepository(dbClient), txManager);
	const command: GetMeCommand = { actorId: auth.userId };
	return c.json(await usecase.execute(command), 200);
});
