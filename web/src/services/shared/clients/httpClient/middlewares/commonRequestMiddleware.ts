import type { Middleware } from "openapi-fetch";
import { RequestMiddlewareFactory } from "@/services/shared/clients/httpClient/middlewares/strategies/requestMiddlewareFactory";

export const commonRequestMiddleware: Middleware = {
	onRequest: ({ request }) => {
		RequestMiddlewareFactory.getStrategy().applyHeaders(request);
		return request;
	},
};
