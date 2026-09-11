import { describe, expect, it } from "vitest";
import { PROJECT_NAME_MAX_LENGTH, ProjectName } from "@/domains/project/valueObjects/projectName";
import { DomainException } from "@/shared/exceptions/domainException";

describe("ProjectName", () => {
	it("前後の空白を取り除いて保持する", () => {
		expect(new ProjectName("  Alpha  ").value).toBe("Alpha");
	});

	it("空文字・空白のみは NAME_EMPTY", () => {
		expect(() => new ProjectName("   ")).toThrow(DomainException);
		try {
			new ProjectName("");
		} catch (e) {
			expect(e).toBeInstanceOf(DomainException);
			expect((e as DomainException).errorCode).toBe("PROJECT.VALIDATION.NAME_EMPTY");
		}
	});

	it("上限を超えると NAME_TOO_LONG（メッセージに上限値が埋まる）", () => {
		try {
			new ProjectName("a".repeat(PROJECT_NAME_MAX_LENGTH + 1));
			expect.unreachable();
		} catch (e) {
			expect((e as DomainException).errorCode).toBe("PROJECT.VALIDATION.NAME_TOO_LONG");
			expect((e as DomainException).userMessage).toContain(String(PROJECT_NAME_MAX_LENGTH));
		}
	});

	it("equals は値で比較する（別インスタンスでも同値なら true）", () => {
		expect(new ProjectName("Alpha").equals(new ProjectName("Alpha"))).toBe(true);
		expect(new ProjectName("Alpha").equals(new ProjectName("Beta"))).toBe(false);
	});
});
