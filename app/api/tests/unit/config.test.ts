import { describe, expect, it } from "vitest";
import { loadConfig } from "@/config";

describe("loadConfig", () => {
	it("DATABASE_URL が無ければ起動時に落ちる", () => {
		expect(() => loadConfig({})).toThrow(/DATABASE_URL/);
	});

	it("PORT は省略時 8787、文字列は数値に変換される", () => {
		const url = "postgresql://u:p@localhost:5432/db";
		expect(loadConfig({ DATABASE_URL: url }).PORT).toBe(8787);
		expect(loadConfig({ DATABASE_URL: url, PORT: "9000" }).PORT).toBe(9000);
	});
});
