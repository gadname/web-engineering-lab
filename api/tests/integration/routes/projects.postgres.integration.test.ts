import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "@/app";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";
import { OTHER_TENANT_ID, seedTenantsAndUsers, TEST_TENANT_ID, truncateAll } from "@/tests/integration/helpers/seed";

/**
 * HTTP → ミドルウェア（認証・テナント認可） → ユースケース → Repository → 実 DB を通す。
 * app.request() はポートを開かず、同じプロセス内でハンドラを呼ぶ。
 */
describe("projects routes (postgres)", () => {
	let dbClient: IDatabaseClient<PrismaDatabaseClientType>;

	beforeAll(() => {
		dbClient = DatabaseClientFactory.create({}).dbClient;
	});

	afterAll(async () => {
		await dbClient.disconnect();
	});

	beforeEach(async () => {
		await truncateAll(dbClient);
		await seedTenantsAndUsers(dbClient);
	});

	const as = (userId: string, tenantId = TEST_TENANT_ID) => ({
		authorization: `Bearer ${userId}`,
		"x-tenant-id": tenantId,
		"content-type": "application/json",
	});

	it("作成 → 取得 → 一覧 → 更新 → 削除 が通る", async () => {
		const created = await app.request("/api/v1/tenants/projects", {
			method: "POST",
			headers: as("admin"),
			body: JSON.stringify({ name: "Alpha", description: "first" }),
		});
		expect(created.status).toBe(201);
		const project = (await created.json()) as { id: string; name: string };
		expect(project).toMatchObject({ name: "Alpha", tenantId: TEST_TENANT_ID });

		const got = await app.request(`/api/v1/tenants/projects/${project.id}`, { headers: as("admin") });
		expect(got.status).toBe(200);

		const list = await app.request("/api/v1/tenants/projects?search=alp", { headers: as("admin") });
		expect(((await list.json()) as { projects: unknown[] }).projects).toHaveLength(1);

		const patched = await app.request(`/api/v1/tenants/projects/${project.id}`, {
			method: "PATCH",
			headers: as("admin"),
			body: JSON.stringify({ description: null }),
		});
		expect(await patched.json()).toMatchObject({ name: "Alpha", description: null });

		const deleted = await app.request(`/api/v1/tenants/projects/${project.id}`, {
			method: "DELETE",
			headers: as("admin"),
		});
		expect(deleted.status).toBe(204);
		expect((await app.request(`/api/v1/tenants/projects/${project.id}`, { headers: as("admin") })).status).toBe(
			404,
		);
	});

	it("GUEST は読めるが作れない（403）", async () => {
		const res = await app.request("/api/v1/tenants/projects", {
			method: "POST",
			headers: as("guest"),
			body: JSON.stringify({ name: "Alpha" }),
		});
		expect(res.status).toBe(403);
		expect(await res.json()).toMatchObject({ errorCode: "PROJECT.ACCESS.NOT_AUTHORIZED" });
		expect((await app.request("/api/v1/tenants/projects", { headers: as("guest") })).status).toBe(200);
	});

	it("別テナントのプロジェクトは 404 に縮退する（存在を推測させない）", async () => {
		const created = await app.request("/api/v1/tenants/projects", {
			method: "POST",
			headers: as("admin"),
			body: JSON.stringify({ name: "Alpha" }),
		});
		const { id } = (await created.json()) as { id: string };

		const res = await app.request(`/api/v1/tenants/projects/${id}`, {
			headers: as("other-admin", OTHER_TENANT_ID),
		});
		expect(res.status).toBe(404);
	});

	it("所属していないテナントを指定すると 403", async () => {
		const res = await app.request("/api/v1/tenants/projects", { headers: as("admin", OTHER_TENANT_ID) });
		expect(res.status).toBe(403);
		expect(await res.json()).toMatchObject({ errorCode: "MEMBERSHIP.COMMON.FORBIDDEN" });
	});

	it("同名の作成は 409、形式エラーは 422", async () => {
		const headers = as("admin");
		await app.request("/api/v1/tenants/projects", {
			method: "POST",
			headers,
			body: JSON.stringify({ name: "Alpha" }),
		});
		const dup = await app.request("/api/v1/tenants/projects", {
			method: "POST",
			headers,
			body: JSON.stringify({ name: "Alpha" }),
		});
		expect(dup.status).toBe(409);

		const invalid = await app.request("/api/v1/tenants/projects", {
			method: "POST",
			headers,
			body: JSON.stringify({ name: "" }),
		});
		expect(invalid.status).toBe(422);
		expect(await invalid.json()).toMatchObject({ errorCode: "VALIDATION.REQUEST.UNPROCESSABLE_ENTITY" });
	});

	it("GET /api/v1/users/me は所属一覧を返す", async () => {
		const res = await app.request("/api/v1/users/me", { headers: { authorization: "Bearer admin" } });
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({
			id: "admin",
			memberships: [{ tenantId: TEST_TENANT_ID, role: "ADMIN" }],
		});
	});
});
