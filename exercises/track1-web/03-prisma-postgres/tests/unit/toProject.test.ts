import { describe, expect, it } from "vitest";
import { toProject } from "@/repositories/projectRepository";

/**
 * DB を使わない純関数のテスト。unit 用 config（vitest.config.ts）で走る。
 * 「DB が要る部分」と「要らない部分」を分けておくと、Docker が無い環境でも最低限の検証ができる。
 */
describe("toProject", () => {
	it("deletedAt を落として view と同じ形にする", () => {
		const now = new Date();
		const result = toProject({
			id: "id",
			name: "n",
			description: null,
			createdAt: now,
			updatedAt: now,
			deletedAt: now,
		});
		expect(result).toEqual({ id: "id", name: "n", description: null, createdAt: now, updatedAt: now });
		expect(result).not.toHaveProperty("deletedAt");
	});
});
