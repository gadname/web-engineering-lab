import { z } from "@hono/zod-openapi";
import { createSchema } from "@/shared/createSchema";

/**
 * /projects で使うスキーマ群。
 * 「レスポンスの Project」「作成ボディ」「更新ボディ」「パスパラメータ」を別々に定義する。
 * 同じ形に見えても、必須/任意・検証ルールが違うので流用しない。
 */
export const projectSchema = createSchema(
	{
		id: z.string().uuid(),
		name: z.string(),
		description: z.string().nullable(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	},
	"Project",
);

export const projectListSchema = createSchema({ projects: z.array(projectSchema) }, "ProjectList");

export const createProjectBodySchema = createSchema(
	{
		name: z.string().min(1).max(100),
		description: z.string().max(1000).nullable().optional(),
	},
	"CreateProjectBody",
	{ fieldDescriptions: { name: "プロジェクト名（1〜100 文字）", description: "省略時は null" } },
);

export const updateProjectBodySchema = createSchema(
	{
		name: z.string().min(1).max(100).optional(),
		description: z.string().max(1000).nullable().optional(),
	},
	"UpdateProjectBody",
).refine((v) => v.name !== undefined || v.description !== undefined, {
	message: "at least one field is required",
});

export const projectIdParamsSchema = z.object({
	// path パラメータは `param` メタデータが必要。無いと OpenAPI 上で in: path にならない
	id: z
		.string()
		.uuid()
		.openapi({ param: { name: "id", in: "path" }, example: "6f1c5c2e-7d1a-4b3e-9c1d-2a4f0b9e8d10" }),
});
