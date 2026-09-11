import { ValueObject } from "@/domains/shared/dddObjectBases/valueObject";
import { PROJECT_ERROR_CODES } from "@/shared/errors/codes/domains/projectErrors";
import { DomainException } from "@/shared/exceptions/domainException";

/**
 * 画面の入力欄と DB 列幅から決めた上限。業務上の根拠はない（変えてよい）。
 */
export const PROJECT_NAME_MAX_LENGTH = 100;

export class ProjectName extends ValueObject<string, "ProjectName"> {
	protected validate(value: string): string {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			throw new DomainException(PROJECT_ERROR_CODES.VALIDATION.NAME_EMPTY);
		}
		if (trimmed.length > PROJECT_NAME_MAX_LENGTH) {
			throw new DomainException(PROJECT_ERROR_CODES.VALIDATION.NAME_TOO_LONG, {
				data: { max: PROJECT_NAME_MAX_LENGTH },
			});
		}
		return trimmed;
	}
}
