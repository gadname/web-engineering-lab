import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "@/app";

describe("projects API (zod-openapi)", () => {
	let app: ReturnType<typeof createApp>;

	beforeEach(() => {
		app = createApp();
	});

	const jsonInit = (method: string, body: unknown): RequestInit => ({
		method,
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});

	const createProject = async (body: unknown) => app.request("/api/projects", jsonInit("POST", body));

	it("POST は 201 + Location、レスポンスはスキーマ通り", async () => {
		const res = await createProject({ name: "alpha" });
		expect(res.status).toBe(201);
		const created = await res.json();
		expect(created).toMatchObject({ name: "alpha", description: null });
		expect(res.headers.get("location")).toBe(`/api/projects/${created.id}`);
	});

	it("バリデーション失敗は 422 + ErrorResponse 形（path と message 付き）", async () => {
		const res = await createProject({ name: "", description: 123 });
		expect(res.status).toBe(422);
		const body = await res.json();
		expect(body.error.code).toBe("VALIDATION_ERROR");
		expect(body.error.details.map((d: { path: string }) => d.path).sort()).toEqual(["description", "name"]);
	});

	it("壊れた JSON は 400（422 と区別する）", async () => {
		const res = await app.request("/api/projects", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{oops",
		});
		expect(res.status).toBe(400);
	});

	it("path パラメータも検証される（uuid でなければ 422）", async () => {
		const res = await app.request("/api/projects/not-a-uuid");
		expect(res.status).toBe(422);
		expect((await res.json()).error.details[0].path).toBe("id");
	});

	it("PATCH で全フィールド省略は refine で 422", async () => {
		const { id } = await (await createProject({ name: "a" })).json();
		const res = await app.request(`/api/projects/${id}`, jsonInit("PATCH", {}));
		expect(res.status).toBe(422);
		expect((await res.json()).error.details[0].message).toBe("at least one field is required");
	});

	it("存在しない uuid は 404 + ErrorResponse", async () => {
		const res = await app.request("/api/projects/6f1c5c2e-7d1a-4b3e-9c1d-2a4f0b9e8d10");
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: { code: "NOT_FOUND", message: "project not found" } });
	});

	it("DELETE は 204、2 回目は 404", async () => {
		const { id } = await (await createProject({ name: "a" })).json();
		expect((await app.request(`/api/projects/${id}`, { method: "DELETE" })).status).toBe(204);
		expect((await app.request(`/api/projects/${id}`, { method: "DELETE" })).status).toBe(404);
	});

	it("/api/doc が OpenAPI 3.0 の spec を返し、名前付きスキーマが components に載る", async () => {
		const res = await app.request("/api/doc");
		expect(res.status).toBe(200);
		const spec = await res.json();
		expect(spec.openapi).toBe("3.0.0");
		expect(Object.keys(spec.paths).sort()).toEqual(["/api/projects", "/api/projects/{id}"]);
		expect(spec.paths["/api/projects"].post.requestBody.content["application/json"].schema).toEqual({
			$ref: "#/components/schemas/CreateProjectBody",
		});
		expect(Object.keys(spec.components.schemas)).toEqual(
			expect.arrayContaining([
				"Project",
				"ProjectList",
				"CreateProjectBody",
				"UpdateProjectBody",
				"ErrorResponse",
			]),
		);
		// path パラメータが in: path として出ている
		expect(spec.paths["/api/projects/{id}"].get.parameters[0]).toMatchObject({
			name: "id",
			in: "path",
			required: true,
		});
	});

	it("/api/swagger が HTML を返す", async () => {
		const res = await app.request("/api/swagger");
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/html");
	});
});
