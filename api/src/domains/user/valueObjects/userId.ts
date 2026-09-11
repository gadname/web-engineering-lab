import { ValueObject } from "@/domains/shared/dddObjectBases/valueObject";
import { USER_ERROR_CODES } from "@/shared/errors/codes/domains/userErrors";
import { DomainException } from "@/shared/exceptions/domainException";

/**
 * ユーザー ID。
 * 認証基盤（Cognito 等）が発行する subject をそのまま使う想定なので UUID 形式を強制しない。
 * ID を自前で採番しないのは、認証基盤側の識別子と 1:1 で対応させるため。
 */
export class UserId extends ValueObject<string, "UserId"> {
	protected validate(value: string): string {
		if (value.trim().length === 0) {
			throw new DomainException(USER_ERROR_CODES.VALIDATION.ID_EMPTY);
		}
		return value;
	}
}
