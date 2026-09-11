import type { IRequestMiddlewareStrategy } from "@/services/shared/clients/httpClient/middlewares/strategies/interfaces";
import { AccessToken } from "@/services/shared/configs/accessToken";

/** 本番: IdP のアクセストークンを Bearer で付ける */
export class DefaultRequestMiddlewareStrategy implements IRequestMiddlewareStrategy {
	applyHeaders(request: Request): void {
		if (AccessToken.exists()) {
			request.headers.set("Authorization", `Bearer ${AccessToken.get()}`);
		}
		if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
			request.headers.set("Content-Type", "application/json");
		}
	}
}
