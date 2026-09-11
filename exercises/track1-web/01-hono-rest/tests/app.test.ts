import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "@/app";

/**
 * Hono の `app.request()` はサーバを起動せずにハンドラを直接呼べる。
 * 高速で、ポート衝突も無く、HTTP の意味（ステータス・ヘッダ）をそのまま検証できる。
 */
describe("projects API", () => {
	let app: ReturnType<typeof createApp>;
	const logs: string[] = [];

	beforeEach(() => {
		logs.length = 0;
		app = createApp({ logSink: (line) => logs.push(line) });
	});

	const jsonInit = (method: string, body: unknown): RequestInit => ({
		method,
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});

	const createProject = async (body: unknown) => app.request("/api/projects", jsonInit("POST", body));

	it("GET /health はミドルウェアを通らず 200", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok" });
		expect(logs).toHaveLength(0);
	});

	it("POST は 201 と Location を返し、GET で取得できる", async () => {
		const res = await createProject({ name: "alpha", description: "first" });
		expect(res.status).toBe(201);
		const created = await res.json();
		expect(created).toMatchObject({ name: "alpha", description: "first" });
		expect(res.headers.get("location")).toBe(`/api/projects/${created.id}`);

		const got = await app.request(`/api/projects/${created.id}`);
		expect(got.status).toBe(200);
		expect(await got.json()).toEqual(created);
	});

	it("description 省略時は null になる（undefined ではなく）", async () => {
		const res = await createProject({ name: "beta" });
		expect((await res.json()).description).toBeNull();
	});

	it("バリデーション失敗は 400 と詳細", async () => {
		const res = await createProject({ name: "" });
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({
			error: { code: "VALIDATION_ERROR", details: ["name is required"] },
		});
	});

	it("壊れた JSON も 400", async () => {
		const res = await app.request("/api/projects", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{not json",
		});
		expect(res.status).toBe(400);
	});

	it("GET 一覧は作成順で返る", async () => {
		await createProject({ name: "a" });
		await createProject({ name: "b" });
		const res = await app.request("/api/projects");
		const body = await res.json();
		expect(body.projects.map((p: { name: string }) => p.name)).toEqual(["a", "b"]);
	});

	it("PATCH は部分更新。未指定フィールドは維持される", async () => {
		const { id } = await (await createProject({ name: "a", description: "d" })).json();
		const res = await app.request(`/api/projects/${id}`, jsonInit("PATCH", { name: "renamed" }));
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ name: "renamed", description: "d" });
	});

	it("PATCH で description を null にできる", async () => {
		const { id } = await (await createProject({ name: "a", description: "d" })).json();
		const res = await app.request(`/api/projects/${id}`, jsonInit("PATCH", { description: null }));
		expect((await res.json()).description).toBeNull();
	});

	it("PATCH で何も指定しないと 400", async () => {
		const { id } = await (await createProject({ name: "a" })).json();
		const res = await app.request(`/api/projects/${id}`, jsonInit("PATCH", {}));
		expect(res.status).toBe(400);
	});

	it("DELETE は 204、2 回目は 404", async () => {
		const { id } = await (await createProject({ name: "a" })).json();
		const first = await app.request(`/api/projects/${id}`, { method: "DELETE" });
		expect(first.status).toBe(204);
		expect(await first.text()).toBe("");
		const second = await app.request(`/api/projects/${id}`, { method: "DELETE" });
		expect(second.status).toBe(404);
	});

	it("存在しない id は 404", async () => {
		const res = await app.request("/api/projects/nope");
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: { code: "NOT_FOUND" } });
	});

	it("未定義のパスは 404 の JSON", async () => {
		const res = await app.request("/api/unknown");
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: { code: "NOT_FOUND" } });
	});

	it("リクエストログに requestId とステータスが乗る", async () => {
		await app.request("/api/projects");
		expect(logs).toHaveLength(1);
		expect(logs[0]).toMatch(/^GET \/api\/projects 200 [\d.]+ms requestId=[0-9a-f-]{36}$/);
	});

	it("テスト間でストアが共有されない", async () => {
		const res = await app.request("/api/projects");
		expect((await res.json()).projects).toEqual([]);
	});
});
