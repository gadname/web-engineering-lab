import type { Middleware } from "openapi-fetch";
import { getCookie } from "@/shared/lib/cookie";

// テナント認可が掛かるパス。バックエンド側の tenantContext ルートと対応する
const TENANT_CONTEXT_PATH_PREFIXES = ["/api/v1/tenants", "/api/ai/v1/protected"];

/**
 * テナント文脈のリクエストに X-Tenant-ID を付ける。
 * テナント ID は URL の一部ではなくヘッダで送る（バックエンドにとってはリソースのパスではなく認可の文脈のため）。
 */
export const tenantContextRequestMiddleware: Middleware = {
	onRequest: ({ request }) => {
		const { pathname } = new URL(request.url);
		if (TENANT_CONTEXT_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
			const tenantId = getCookie("tenantId");
			if (tenantId) request.headers.set("X-Tenant-ID", tenantId);
		}
		return request;
	},
};
