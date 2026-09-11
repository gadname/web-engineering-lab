import { afterAll, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { createApp } from "@/app";
import { createPrismaClient, type Db } from "@/db";
import { PrismaProjectRepository } from "@/repositories/projectRepository";

/**
 * ルート → Repository → 実 DB を通す統合テスト。
 * unit（インメモリ）と同じシナリオを実 DB で流し、「インメモリ実装と Prisma 実装の契約が一致している」ことを確認する。
 */
describe("taskboard api (integration)", () => {
	let db: Db;
	let app: ReturnType<typeof createApp>;

	beforeAll(() => {
		db = createPrismaClient(inject("databaseUrl"));
		app = createApp({ projectRepository: new PrismaProjectRepository(db) });
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	beforeEach(async () => {
		await db.$executeRawUnsafe('TRUNCATE TABLE "projects" CASCADE');
	});

	const jsonInit = (method: string, body: unknown): RequestInit => ({
		method,
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});

	it("作成 → 取得 → 更新 → 論理削除 が実 DB で通る", async () => {
		const created = await (await app.request("/api/projects", jsonInit("POST", { name: "alpha" }))).json();
		expect((await app.request(`/api/projects/${created.id}`)).status).toBe(200);

		const patched = await app.request(`/api/projects/${created.id}`, jsonInit("PATCH", { description: "d" }));
		expect(await patched.json()).toMatchObject({ name: "alpha", description: "d" });

		expect((await app.request(`/api/projects/${created.id}`, { method: "DELETE" })).status).toBe(204);
		expect((await app.request(`/api/projects/${created.id}`)).status).toBe(404);

		// 論理削除なので実テーブルには残っている
		const raw = await db.projectRecord.findUnique({ where: { id: created.id } });
		expect(raw?.deletedAt).toBeInstanceOf(Date);
	});

	it("一覧は削除済みを含まない", async () => {
		const a = await (await app.request("/api/projects", jsonInit("POST", { name: "a" }))).json();
		await app.request("/api/projects", jsonInit("POST", { name: "b" }));
		await app.request(`/api/projects/${a.id}`, { method: "DELETE" });
		const list = await (await app.request("/api/projects")).json();
		expect(list.projects.map((p: { name: string }) => p.name)).toEqual(["b"]);
	});
});
