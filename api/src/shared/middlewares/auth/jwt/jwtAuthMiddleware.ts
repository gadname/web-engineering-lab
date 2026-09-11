import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";
import { RequestContext } from "@/shared/context/requestContext";
import { MIDDLEWARE_ERROR_CODES } from "@/shared/errors/codes/system/middlewareErrors";
import { ApplicationException } from "@/shared/exceptions/applicationException";
import { MiddlewareException } from "@/shared/exceptions/middlewareException";
import { Logger } from "@/shared/logger/logger";
import { AuthenticatorFactory } from "@/shared/middlewares/auth/jwt/strategies/authenticatorFactory";
import { handleOnErrorMiddleware } from "@/shared/middlewares/handleOnErrorMiddleware";

/**
 * 認証ミドルウェア（「誰か」を確定する）。
 *
 * 認証失敗（401）は throw せず、整形済みレスポンスとして return する。
 * throw すると計装（OTel 等）が例外としてエラー率に計上するため。クライアント都合の 4xx はエラーではない。
 * 一方、next() 以降（ハンドラ）で起きた ApplicationException は再スローして onError に任せる。
 */
// bearerAuth が Context<Env> を要求するため型引数は付けない（c.set は Variables 未指定なら任意キーを受ける）
export const jwtAuthMiddleware = createMiddleware(async (c, next) => {
	let verifyError: unknown = null;
	const bearer = bearerAuth({
		verifyToken: async () => {
			try {
				const payload = await AuthenticatorFactory.createStrategy().authenticate(c);
				c.set("authJWTPayload", payload);
				RequestContext.setAuthenticatedUser(payload.userId);
				Logger.info("Authenticated", { event: "jwt_authenticated" });
				return true;
			} catch (error) {
				verifyError = error;
				return false;
			}
		},
	});

	try {
		return await bearer(c, next);
	} catch (error) {
		if (error instanceof ApplicationException) throw error;
		const authError = new MiddlewareException(MIDDLEWARE_ERROR_CODES.JWT_AUTH.AUTHENTICATION_FAILED, {
			cause: verifyError ?? error,
		});
		return handleOnErrorMiddleware(authError, c);
	}
});
