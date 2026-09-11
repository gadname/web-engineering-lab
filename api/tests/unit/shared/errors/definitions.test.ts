import { describe, expect, it } from "vitest";
import { MEMBERSHIP_ERROR_CODES } from "@/shared/errors/codes/domains/membershipErrors";
import { PROJECT_ERROR_CODES } from "@/shared/errors/codes/domains/projectErrors";
import { TENANT_ERROR_CODES } from "@/shared/errors/codes/domains/tenantErrors";
import { USER_ERROR_CODES } from "@/shared/errors/codes/domains/userErrors";
import { VALIDATION_ERROR_CODES } from "@/shared/errors/codes/domains/validationErrors";
import { DATABASE_ERROR_CODES } from "@/shared/errors/codes/system/databaseErrors";
import { INFRASTRUCTURE_ERROR_CODES } from "@/shared/errors/codes/system/infrastructureErrors";
import { MIDDLEWARE_ERROR_CODES } from "@/shared/errors/codes/system/middlewareErrors";
import { REQUEST_VALIDATION_ERROR_CODES } from "@/shared/errors/codes/validation/requestValidationErrors";
import { ERROR_DEFINITIONS } from "@/shared/errors/definitions";
import { getMessage } from "@/shared/errors/messages";

const flatten = (obj: Record<string, unknown>): string[] =>
	Object.values(obj).flatMap((v) => (typeof v === "string" ? [v] : flatten(v as Record<string, unknown>)));

const ALL_CODES = [
	PROJECT_ERROR_CODES,
	MEMBERSHIP_ERROR_CODES,
	TENANT_ERROR_CODES,
	USER_ERROR_CODES,
	VALIDATION_ERROR_CODES,
	DATABASE_ERROR_CODES,
	INFRASTRUCTURE_ERROR_CODES,
	MIDDLEWARE_ERROR_CODES,
	REQUEST_VALIDATION_ERROR_CODES,
].flatMap((codes) => flatten(codes));

/** 規約テスト: エラーコードを足したら定義と文言も足す、を機械的に検査する */
describe("error definitions", () => {
	it("全てのエラーコードに定義がある", () => {
		const missing = ALL_CODES.filter((code) => !(code in ERROR_DEFINITIONS));
		expect(missing).toEqual([]);
	});

	it("全ての定義のメッセージが文言に解決できる", () => {
		for (const [code, definition] of Object.entries(ERROR_DEFINITIONS)) {
			expect(getMessage(definition.messageKey), code).not.toBe("");
		}
	});

	it("エラーコードは <領域>.<分類>.<内容> の 3 階層", () => {
		for (const code of ALL_CODES) {
			expect(code.split(".").length, code).toBeGreaterThanOrEqual(2);
		}
	});
});
