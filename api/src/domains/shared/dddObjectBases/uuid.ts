import { randomUUID } from "node:crypto";
import { ValueObject } from "@/domains/shared/dddObjectBases/valueObject";
import { VALIDATION_ERROR_CODES } from "@/shared/errors/codes/domains/validationErrors";
import { DomainException } from "@/shared/exceptions/domainException";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * UUID 型の識別子。null を渡すと新しく採番する（新規作成）。文字列を渡すと形式を検証する（復元・リクエスト）。
 * 識別子はドメイン側で採番する。DB の自動採番に頼らないことで、保存前の集約にも ID があり、
 * 関連（projectId など）を保存前に組み立てられる。
 */
export abstract class UUID<Key> extends ValueObject<string | null, Key, string> {
	protected constructor(value: string | null = null) {
		super(value);
	}

	protected validate(value: string | null): string {
		if (value === null) return randomUUID();
		if (!UUID_PATTERN.test(value)) {
			throw new DomainException(VALIDATION_ERROR_CODES.UUID.INVALID_FORMAT, { data: { value } });
		}
		return value;
	}
}
