import { describe, expect, it } from "vitest";
import { StructuredApiError } from "@/services/shared/exceptions/structuredApiError";

const build = (errorCode: string, statusCode = 400, details?: Record<string, unknown>) =>
	new StructuredApiError({ statusCode, errorCode, message: "msg", details }, new Response());

describe("StructuredApiError", () => {
	it("領域で分類する", () => {
		expect(build("SYSTEM.UNKNOWN_ERROR", 500).isSystemError()).toBe(true);
		expect(build("PROJECT.ACCESS.NOT_AUTHORIZED", 403).isSystemError()).toBe(false);
		expect(build("SYSTEM.MIDDLEWARE.JWT_AUTHENTICATION_FAILED", 401).isAuthenticationError()).toBe(true);
	});

	it("422 の issues をフィールドエラーに変換する", () => {
		const error = build("VALIDATION.REQUEST.UNPROCESSABLE_ENTITY", 422, {
			issues: [{ path: "name", message: "必須です" }],
		});
		expect(error.isValidationError()).toBe(true);
		expect(error.getFieldErrors()).toEqual([{ field: "name", message: "必須です" }]);
	});
});
