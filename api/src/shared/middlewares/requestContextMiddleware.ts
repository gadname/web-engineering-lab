import { createMiddleware } from "hono/factory";
import { RequestContext } from "@/shared/context/requestContext";
import type { ApplicationEntry } from "@/shared/types/app";

/**
 * リクエストコンテキストの開始点。hono/request-id の後に置く。
 * 以降の非同期処理（usecase / repository / logger）はすべてこの store の中で動く。
 */
export const requestContextMiddleware = createMiddleware<ApplicationEntry>(async (c, next) => {
	return RequestContext.run(
		{
			requestId: c.get("requestId"),
			httpMethod: c.req.method,
			path: c.req.path,
		},
		() => next(),
	);
});
