import { AppConfig } from "@/shared/config/appConfig";
import { INFRASTRUCTURE_ERROR_CODES } from "@/shared/errors/codes/system/infrastructureErrors";
import { InfrastructureException } from "@/shared/exceptions/infrastructureException";
import { DevelopmentAuthenticator } from "@/shared/middlewares/auth/jwt/strategies/developmentAuthenticator";
import type { IAuthenticator } from "@/shared/middlewares/auth/jwt/strategies/interfaces";

/**
 * 環境に応じて認証方式を選ぶ Factory。
 * dev / stg / prod 向けの IdP（Cognito 等の JWKS 検証）実装は未実装で、起動後の最初の認証で明示的に失敗する。
 */
// biome-ignore lint/complexity/noStaticOnlyClass: 静的メソッドのみの Factory
export class AuthenticatorFactory {
	static createStrategy(): IAuthenticator {
		const env = AppConfig.getInstance().get("ENV");
		switch (env) {
			case "local":
			case "test":
				return new DevelopmentAuthenticator();
			default:
				throw new InfrastructureException(INFRASTRUCTURE_ERROR_CODES.AUTH.STRATEGY_NOT_IMPLEMENTED, {
					data: { env },
				});
		}
	}
}
