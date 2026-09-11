import { ValueObject } from "@/domains/shared/dddObjectBases/valueObject";
import { USER_ERROR_CODES } from "@/shared/errors/codes/domains/userErrors";
import { DomainException } from "@/shared/exceptions/domainException";

// 厳密な RFC 検証はしない（実在確認はメール送信でしかできない）。明らかな誤りだけ弾く
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailAddress extends ValueObject<string, "EmailAddress"> {
	protected validate(value: string): string {
		const normalized = value.trim().toLowerCase();
		if (!EMAIL_PATTERN.test(normalized)) {
			throw new DomainException(USER_ERROR_CODES.VALIDATION.INVALID_EMAIL);
		}
		return normalized;
	}
}
