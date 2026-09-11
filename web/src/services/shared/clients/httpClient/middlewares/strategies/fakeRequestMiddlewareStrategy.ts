import type { IRequestMiddlewareStrategy } from "@/services/shared/clients/httpClient/middlewares/strategies/interfaces";
import { getCookie } from "@/shared/lib/cookie";

/**
 * ローカル: Cookie の userId をそのままトークンとして送る。
 * バックエンドの DevelopmentAuthenticator が Bearer の中身を userId として扱う約束に合わせている。
 */
export class FakeRequestMiddlewareStrategy implements IRequestMiddlewareStrategy {
	applyHeaders(request: Request): void {
		const userId = getCookie("userId");
		if (userId) {
			request.headers.set("Authorization", `Bearer ${userId}`);
		}
		if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
			request.headers.set("Content-Type", "application/json");
		}
	}
}
