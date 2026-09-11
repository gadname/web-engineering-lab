import type { Context } from "hono";
import type { AuthJWTPayload } from "@/shared/types/app";

/** 認証方式の契約。本番は IdP のトークン検証、ローカルはヘッダ直読み、といった差し替えをここで吸収する */
export interface IAuthenticator {
	authenticate(c: Context): Promise<AuthJWTPayload>;
}
