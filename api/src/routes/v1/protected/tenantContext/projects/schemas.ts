import { z } from "@hono/zod-openapi";
import { createSchema } from "@/routes/shared/helpers/createSchema";

/** 同じリソースの複数エンドポイントで共有する形はここに置く */
export const projectResponseSchema = createSchema(
	{
		id: z.string(),
		tenantId: z.string(),
		name: z.string(),
		description: z.string().nullable(),
	},
	"v1ProjectResponseSchema",
);

export const projectIdParamsSchema = createSchema({ projectId: z.string().uuid() }, "v1ProjectIdParamsSchema");
