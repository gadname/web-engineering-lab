import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { IAuthenticator } from "@/shared/middlewares/auth/jwt/strategies/interfaces";
import type { AuthJWTPayload } from "@/shared/types/app";

/**
 * ローカル・テスト専用。`Authorization: Bearer <userId>` の token 部分をそのまま userId として扱う。
 * `x-user-id` ヘッダがあればそちらを優先する（同じ Bearer のまま操作者を切り替えたいとき用）。
 * Authorization ヘッダ自体は bearerAuth が先に要求するため、x-user-id だけでは通らない。
 */
export class DevelopmentAuthenticator implements IAuthenticator {
	async authenticate(c: Context): Promise<AuthJWTPayload> {
		const fromHeader = c.req.header("x-user-id");
		if (fromHeader) return { userId: fromHeader };

		const bearer = c.req
			.header("Authorization")
			?.match(/^Bearer\s+(.+)$/i)?.[1]
			?.trim();
		if (bearer) return { userId: bearer };

		throw new HTTPException(401, { message: "x-user-id header or Bearer token is required" });
	}
}
