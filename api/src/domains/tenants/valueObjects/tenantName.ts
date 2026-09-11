import { ValueObject } from "@/domains/shared/dddObjectBases/valueObject";
import { TENANT_ERROR_CODES } from "@/shared/errors/codes/domains/tenantErrors";
import { DomainException } from "@/shared/exceptions/domainException";

export const TENANT_NAME_MAX_LENGTH = 100;

export class TenantName extends ValueObject<string, "TenantName"> {
	protected validate(value: string): string {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			throw new DomainException(TENANT_ERROR_CODES.VALIDATION.NAME_EMPTY);
		}
		if (trimmed.length > TENANT_NAME_MAX_LENGTH) {
			throw new DomainException(TENANT_ERROR_CODES.VALIDATION.NAME_TOO_LONG, {
				data: { max: TENANT_NAME_MAX_LENGTH },
			});
		}
		return trimmed;
	}
}
