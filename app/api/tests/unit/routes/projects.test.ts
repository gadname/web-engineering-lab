import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "@/app";
import { InMemoryProjectRepository } from "@/repositories/inMemoryProjectRepository";

/** ルート層のテスト。Repository はインメモリ実装を差し込み、HTTP の契約だけを検証する */
describe("projects routes", () => {
	let app: ReturnType<typeof createApp>;

	beforeEach(() => {
		app = createApp({ projectRepository: new InMemoryProjectRepository() });
	});

	const jsonInit = (method: string, body: unknown): RequestInit => ({
		method,
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	const createProject = (body: unknown) => app.request("/api/projects", jsonInit("POST", body));

	it("作成 → 一覧 → 取得。日時は ISO 文字列で返る", async () => {
		const res = await createProject({ name: "alpha" });
		expect(res.status).toBe(201);
		const created = await res.json();
		expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

		const list = await (await app.request("/api/projects")).json();
		expect(list.projects).toEqual([created]);
		expect(await (await app.request(`/api/projects/${created.id}`)).json()).toEqual(created);
	});

	it("バリデーション失敗は 422、壊れた JSON は 400", async () => {
		expect((await createProject({ name: "" })).status).toBe(422);
		const broken = await app.request("/api/projects", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{",
		});
		expect(broken.status).toBe(400);
	});

	it("PATCH で部分更新、DELETE は 204 → 2 回目 404", async () => {
		const { id } = await (await createProject({ name: "a", description: "d" })).json();
		const patched = await app.request(`/api/projects/${id}`, jsonInit("PATCH", { name: "b" }));
		expect(await patched.json()).toMatchObject({ name: "b", description: "d" });

		expect((await app.request(`/api/projects/${id}`, { method: "DELETE" })).status).toBe(204);
		expect((await app.request(`/api/projects/${id}`, { method: "DELETE" })).status).toBe(404);
		expect((await app.request(`/api/projects/${id}`)).status).toBe(404);
	});

	it("/api/doc に 5 オペレーションが載る", async () => {
		const spec = await (await app.request("/api/doc")).json();
		const ops = Object.values(spec.paths as Record<string, Record<string, unknown>>).flatMap((p) => Object.keys(p));
		expect(ops.sort()).toEqual(["delete", "get", "get", "patch", "post"]);
	});
});
