import { z } from "@hono/zod-openapi";
import type { ZodTypeAny } from "zod";

/**
 * Zod オブジェクトに OpenAPI 用の名前を付けるヘルパー。
 *
 * `.openapi("Name")` を付けたスキーマは OpenAPI の `components/schemas/Name` として出力され、
 * `openapi-typescript` が `components["schemas"]["Name"]` という再利用できる型を生成する。
 * 名前を付けないと各エンドポイントにインライン展開され、フロント側で同じ型を何度も定義することになる。
 *
 * 各 field にも `Name.field` という名前を付けておくと、生成された spec で「どのスキーマの何番目の項目か」が追える。
 */
export const createSchema = <T extends Record<string, ZodTypeAny>>(
	shape: T,
	name: string,
	options?: { description?: string; fieldDescriptions?: Partial<Record<keyof T, string>> },
): z.ZodObject<{ [K in keyof T]: T[K] }> => {
	const shapeWithMeta = Object.fromEntries(
		Object.entries(shape).map(([key, schema]) => [
			key,
			schema.openapi(`${name}.${key}`, { description: options?.fieldDescriptions?.[key] }),
		]),
	) as { [K in keyof T]: T[K] };

	return z.object(shapeWithMeta).openapi(name, { description: options?.description });
};
