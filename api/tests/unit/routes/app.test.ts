import { describe, expect, it } from "vitest";
import { app } from "@/app";
import { AppConfig } from "@/shared/config/appConfig";
import { setupTestEnvironment } from "@/tests/unit/helpers/setup";

/** ルーティングとミドルウェアの配線だけを確認する（DB は使わない） */
describe("app", () => {
	setupTestEnvironment();

	it("GET /health はミドルウェア無しで 200", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok" });
	});

	it("GET /api/doc は OpenAPI JSON を返す", async () => {
		const res = await app.request("/api/doc");
		expect(res.status).toBe(200);
		const spec = (await res.json()) as { paths: Record<string, unknown> };
		expect(Object.keys(spec.paths)).toEqual(
			expect.arrayContaining([
				"/api/v1/users/me",
				"/api/v1/tenants/projects",
				"/api/v1/tenants/projects/{projectId}",
			]),
		);
	});

	it("認証ヘッダ無しで保護ルートを叩くと 401（エラーレスポンスの形が揃っている）", async () => {
		AppConfig.initialize({ DATABASE_URL: "postgresql://u:p@localhost:5432/db", ENV: "test" });
		const res = await app.request("/api/v1/users/me");
		expect(res.status).toBe(401);
		expect(await res.json()).toMatchObject({
			statusCode: 401,
			errorCode: "SYSTEM.MIDDLEWARE.JWT_AUTHENTICATION_FAILED",
		});
		AppConfig.reset();
	});

	it("保護ルートで X-Tenant-ID が無ければ 400", async () => {
		AppConfig.initialize({ DATABASE_URL: "postgresql://u:p@localhost:5432/db", ENV: "test" });
		const res = await app.request("/api/v1/tenants/projects", { headers: { authorization: "Bearer dev-user" } });
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({ errorCode: "SYSTEM.MIDDLEWARE.TENANT_HEADER_MISSING" });
		AppConfig.reset();
	});
});
