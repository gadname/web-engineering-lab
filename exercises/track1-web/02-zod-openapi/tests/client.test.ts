import createClient from "openapi-fetch";
import { describe, expect, expectTypeOf, it } from "vitest";
import { createApp } from "@/app";
import type { components, paths } from "../generated/api";

/**
 * 生成された型（generated/api.d.ts）でクライアントを作り、サーバと「同じ契約」で会話できることを確認する。
 *
 * `fetch` を差し替えて `app.request()` に流しているので、ネットワークもサーバ起動も要らない。
 * 実際のフロントエンドでは `fetch` をそのまま使い、`baseUrl` を環境変数から与える。
 */
describe("typed client (openapi-fetch)", () => {
	const app = createApp();
	const client = createClient<paths>({
		baseUrl: "http://localhost",
		fetch: async (request) => app.request(request),
	});

	it("一覧・作成・取得が型付きで呼べる", async () => {
		const created = await client.POST("/api/projects", { body: { name: "typed", description: "via client" } });
		expect(created.response.status).toBe(201);
		expect(created.data).toMatchObject({ name: "typed", description: "via client" });
		// data の型は components["schemas"]["Project"] に解決される
		expectTypeOf(created.data).toEqualTypeOf<components["schemas"]["Project"] | undefined>();

		const list = await client.GET("/api/projects");
		expect(list.data?.projects).toHaveLength(1);
		expectTypeOf(list.data).toEqualTypeOf<components["schemas"]["ProjectList"] | undefined>();

		const id = created.data?.id ?? "";
		const got = await client.GET("/api/projects/{id}", { params: { path: { id } } });
		expect(got.data?.id).toBe(id);
	});

	it("エラーも ErrorResponse の型で受け取れる", async () => {
		const res = await client.GET("/api/projects/{id}", {
			params: { path: { id: "6f1c5c2e-7d1a-4b3e-9c1d-2a4f0b9e8d10" } },
		});
		expect(res.response.status).toBe(404);
		expect(res.data).toBeUndefined();
		expect(res.error?.error.code).toBe("NOT_FOUND");
		expectTypeOf(res.error).toEqualTypeOf<components["schemas"]["ErrorResponse"] | undefined>();
	});

	it("契約と違う型はコンパイル時に弾かれ、実行時も 422 になる", async () => {
		// @ts-expect-error: CreateProjectBody.name は string
		const res = await client.POST("/api/projects", { body: { name: 123 } });
		expect(res.response.status).toBe(422);
		expect(res.error?.error.details?.[0]?.path).toBe("name");
	});
});
