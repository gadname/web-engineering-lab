import { z } from "@hono/zod-openapi";
import type { ZodTypeAny } from "zod";

type CreateSchemaOptions = {
	description?: string;
	fieldDescriptions?: Record<string, string>;
};

/**
 * スキーマ名を prefix にして各フィールドに openapi メタデータを付ける。
 * OpenAPI の components/schemas に一意な名前で登録され、クライアント側の型生成で使える名前になる。
 */
export const createSchema = <T extends Record<string, ZodTypeAny>>(
	shape: T,
	name: string,
	options?: CreateSchemaOptions,
): z.ZodObject<{ [K in keyof T]: T[K] }> => {
	const withMetadata = Object.fromEntries(
		Object.entries(shape).map(([key, value]) => [
			key,
			value.openapi(`${name}.${key}`, { description: options?.fieldDescriptions?.[key] }),
		]),
	) as { [K in keyof T]: T[K] };

	return z.object(withMetadata).openapi(name, { description: options?.description });
};
