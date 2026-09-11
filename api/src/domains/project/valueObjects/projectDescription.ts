import { ValueObject } from "@/domains/shared/dddObjectBases/valueObject";
import { PROJECT_ERROR_CODES } from "@/shared/errors/codes/domains/projectErrors";
import { DomainException } from "@/shared/exceptions/domainException";

export const PROJECT_DESCRIPTION_MAX_LENGTH = 1000;

/** 説明。空文字は「未設定」と区別しないため null に正規化する（DB / JSON で undefined を扱わない方針） */
export class ProjectDescription extends ValueObject<string | null, "ProjectDescription", string | null> {
	protected validate(value: string | null): string | null {
		if (value === null) return null;
		const trimmed = value.trim();
		if (trimmed.length === 0) return null;
		if (trimmed.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
			throw new DomainException(PROJECT_ERROR_CODES.VALIDATION.DESCRIPTION_TOO_LONG, {
				data: { max: PROJECT_DESCRIPTION_MAX_LENGTH },
			});
		}
		return trimmed;
	}
}
