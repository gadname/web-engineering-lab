import { createMiddleware } from "hono/factory";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import { UserId } from "@/domains/user/valueObjects/userId";
import { RequestContext } from "@/shared/context/requestContext";
import { MIDDLEWARE_ERROR_CODES } from "@/shared/errors/codes/system/middlewareErrors";
import { ApplicationException } from "@/shared/exceptions/applicationException";
import { MiddlewareException } from "@/shared/exceptions/middlewareException";
import { TenantContextValidator } from "@/shared/middlewares/auth/tenant/strategies/tenantContextValidator";
import type { TenantApplicationEntry } from "@/shared/types/app";

/**
 * テナント認可ミドルウェア（「どのテナントの誰として操作するか」を確定する）。
 * JWT 認証の後段に置く。テナントは URL ではなく `X-Tenant-ID` ヘッダで受ける。
 * テナントはリソースのパスではなく操作のスコープ（認可の文脈）であり、全ルートに同じ形で付くため。
 */
export const tenantAuthMiddleware = createMiddleware<TenantApplicationEntry>(async (c, next) => {
	try {
		const tenantIdHeader = c.req.header("X-Tenant-ID");
		if (!tenantIdHeader) {
			throw new MiddlewareException(MIDDLEWARE_ERROR_CODES.TENANT_AUTH.HEADER_MISSING);
		}
		const authPayload = c.get("authJWTPayload");
		if (!authPayload?.userId) {
			throw new MiddlewareException(MIDDLEWARE_ERROR_CODES.JWT_AUTH.AUTHENTICATION_FAILED);
		}

		const payload = await new TenantContextValidator().validate(
			new UserId(authPayload.userId),
			new TenantId(tenantIdHeader),
		);
		c.set("tenantContextPayload", payload);
		RequestContext.setTenantContext(payload);

		await next();
	} catch (error) {
		if (error instanceof ApplicationException) throw error;
		throw new MiddlewareException(MIDDLEWARE_ERROR_CODES.COMMON.UNEXPECTED, { cause: error });
	}
});
