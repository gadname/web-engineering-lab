import type { z } from "@hono/zod-openapi";

/** createRoute の request / responses のボイラープレートを畳む */
export const openAPISchema = {
	requestBody: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => ({
		body: { content: { "application/json": { schema } } },
	}),
	requestParams: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => ({ params: schema }),
	requestQuery: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => ({ query: schema }),
	response200: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => ({
		200: { content: { "application/json": { schema } }, description: "Success Response" },
	}),
	response201: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => ({
		201: { content: { "application/json": { schema } }, description: "Created Response" },
	}),
	response204: () => ({
		204: { description: "No Content" },
	}),
};
