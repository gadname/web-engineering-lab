import { afterAll, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { createPrismaClient, type Db } from "@/db";
import { PrismaProjectRepository } from "@/repositories/projectRepository";

/**
 * 実 DB（Testcontainers の PostgreSQL）に対する Repository のテスト。
 * モックではなく本物の PostgreSQL を使うので、view・index・制約の挙動をそのまま検証できる。
 */
describe("PrismaProjectRepository", () => {
	let db: Db;
	let repo: PrismaProjectRepository;

	beforeAll(async () => {
		db = createPrismaClient(inject("databaseUrl"));
		repo = new PrismaProjectRepository(db);
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	beforeEach(async () => {
		// テーブルを空にしてテスト間の独立性を保つ。CASCADE で tasks も消える
		await db.$executeRawUnsafe('TRUNCATE TABLE "projects" CASCADE');
	});

	it("create → findById で取得でき、deletedAt は外に出ない", async () => {
		const created = await repo.create({ name: "alpha", description: "first" });
		expect(created).toMatchObject({ name: "alpha", description: "first" });
		expect(created).not.toHaveProperty("deletedAt");

		const found = await repo.findById(created.id);
		expect(found).toEqual(created);
	});

	it("description 省略時は null で保存される", async () => {
		const created = await repo.create({ name: "beta" });
		expect(created.description).toBeNull();
	});

	it("list は作成順で、論理削除された行を含まない", async () => {
		const a = await repo.create({ name: "a" });
		await repo.create({ name: "b" });
		await repo.softDelete(a.id);

		const list = await repo.list();
		expect(list.map((p) => p.name)).toEqual(["b"]);
	});

	it("softDelete は実テーブルには残り、view からは消える", async () => {
		const p = await repo.create({ name: "to-delete" });
		expect(await repo.softDelete(p.id)).toBe(true);

		expect(await repo.findById(p.id)).toBeNull();
		const raw = await db.projectRecord.findUnique({ where: { id: p.id } });
		expect(raw?.deletedAt).toBeInstanceOf(Date);
	});

	it("softDelete の 2 回目は false（冪等だが結果は伝える）", async () => {
		const p = await repo.create({ name: "x" });
		await repo.softDelete(p.id);
		expect(await repo.softDelete(p.id)).toBe(false);
	});

	it("削除済みの行は update できない", async () => {
		const p = await repo.create({ name: "x" });
		await repo.softDelete(p.id);
		expect(await repo.update(p.id, { name: "y" })).toBeNull();
	});

	it("update は部分更新で updatedAt が進む", async () => {
		const p = await repo.create({ name: "a", description: "d" });
		await new Promise((r) => setTimeout(r, 5));
		const updated = await repo.update(p.id, { name: "renamed" });
		expect(updated).toMatchObject({ name: "renamed", description: "d" });
		expect(updated?.updatedAt.getTime()).toBeGreaterThan(p.updatedAt.getTime());
	});

	it("DB 側の命名は snake_case になっている（@map の確認）", async () => {
		const columns = await db.$queryRaw<{ column_name: string }[]>`
			SELECT column_name FROM information_schema.columns
			WHERE table_name = 'projects' ORDER BY ordinal_position
		`;
		expect(columns.map((c) => c.column_name)).toEqual([
			"id",
			"name",
			"description",
			"created_at",
			"updated_at",
			"deleted_at",
		]);
	});

	it("落とし穴: PostgreSQL の単純 view は自動更新可能。read-only なのは Prisma 側の扱いだけ", async () => {
		// 単一テーブルの単純な SELECT で作った view は、PostgreSQL が自動で INSERT/UPDATE/DELETE を基底テーブルに転送する。
		// つまり SQL レベルでは view に書ける。「view だから安全」ではなく、書き込み経路をコードで統一して守る必要がある
		await db.$executeRawUnsafe(
			`INSERT INTO "projects_live" ("id","name","created_at","updated_at") VALUES ('via-view','y',now(),now())`,
		);
		const raw = await db.projectRecord.findUnique({ where: { id: "via-view" } });
		expect(raw).toMatchObject({ name: "y", deletedAt: null });

		// Prisma の view モデルには create/update/delete が「型として」生成されない。
		// クライアントは Proxy なので実行時にはプロパティ自体は取れるが、呼ぶと失敗する
		// @ts-expect-error: view モデルに create は無い
		const createOnView = db.project.create as (args: unknown) => Promise<unknown>;
		await expect(createOnView({ data: { id: "z", name: "z" } })).rejects.toThrow();
	});

	it("tasks は project の物理削除で CASCADE される", async () => {
		const p = await repo.create({ name: "with-tasks" });
		await db.task.create({ data: { projectId: p.id, title: "t1" } });
		await db.projectRecord.delete({ where: { id: p.id } });
		expect(await db.task.count()).toBe(0);
	});
});
