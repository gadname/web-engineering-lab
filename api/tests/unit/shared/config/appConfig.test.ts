import { afterEach, describe, expect, it } from "vitest";
import { AppConfig } from "@/shared/config/appConfig";
import { InfrastructureException } from "@/shared/exceptions/infrastructureException";

describe("AppConfig", () => {
	afterEach(() => AppConfig.reset());

	it("必須項目が無ければ起動時に落ちる（どの項目かが details に載る）", () => {
		try {
			AppConfig.initialize({});
			expect.unreachable();
		} catch (e) {
			expect(e).toBeInstanceOf(InfrastructureException);
			expect((e as InfrastructureException).errorCode).toBe("SYSTEM.CONFIG.VALIDATION_FAILED");
			expect(JSON.stringify((e as InfrastructureException).meta.data)).toContain("DATABASE_URL");
		}
	});

	it("既定値が入り、数値は変換される", () => {
		const config = AppConfig.initialize({ DATABASE_URL: "postgresql://u:p@localhost:5432/db", PORT: "9000" });
		expect(config.get("ENV")).toBe("local");
		expect(config.get("PORT")).toBe(9000);
	});

	it("initialize 前の getInstance は NOT_INITIALIZED", () => {
		expect(() => AppConfig.getInstance()).toThrow(InfrastructureException);
	});
});
