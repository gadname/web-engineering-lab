import { Hono } from "hono";
import type { IProjectStore } from "@/store";
import { validateCreateProject, validateUpdateProject } from "@/validation";

/**
 * /projects 配下のルート。
 *
 * ストアを引数で受け取る「ファクトリ関数」にしているのは、テストで別のストアを差し込むため。
 * 依存を外から渡す（DI）最小形。Track 2 でこの考え方を Factory パターンに発展させる。
 *
 * REST の対応:
 *   GET    /projects       一覧            200
 *   POST   /projects       作成            201 + Location ヘッダ
 *   GET    /projects/:id   取得            200 / 404
 *   PATCH  /projects/:id   部分更新        200 / 404 / 400
 *   DELETE /projects/:id   削除            204 / 404
 */
export const createProjectRoutes = (store: IProjectStore) => {
	const app = new Hono();

	app.get("/", (c) => {
		return c.json({ projects: store.list() });
	});

	app.post("/", async (c) => {
		// JSON として壊れている場合は undefined にして、バリデーションで 400 に落とす
		const body: unknown = await c.req.json().catch(() => undefined);
		const result = validateCreateProject(body);
		if (!result.ok) {
			return c.json({ error: { code: "VALIDATION_ERROR", details: result.errors } }, 400);
		}
		const project = store.create(result.value);
		// 201 Created では作成されたリソースの URL を Location で返すのが慣習
		c.header("Location", `${new URL(c.req.url).pathname}/${project.id}`);
		return c.json(project, 201);
	});

	app.get("/:id", (c) => {
		const project = store.get(c.req.param("id"));
		if (!project) return c.json({ error: { code: "NOT_FOUND" } }, 404);
		return c.json(project);
	});

	app.patch("/:id", async (c) => {
		const body: unknown = await c.req.json().catch(() => undefined);
		const result = validateUpdateProject(body);
		if (!result.ok) {
			return c.json({ error: { code: "VALIDATION_ERROR", details: result.errors } }, 400);
		}
		const project = store.update(c.req.param("id"), result.value);
		if (!project) return c.json({ error: { code: "NOT_FOUND" } }, 404);
		return c.json(project);
	});

	app.delete("/:id", (c) => {
		const deleted = store.delete(c.req.param("id"));
		if (!deleted) return c.json({ error: { code: "NOT_FOUND" } }, 404);
		// 削除成功はボディ無しの 204。2 回目は 404
		// （冪等性は「サーバ側の結果状態が同じ」であって「応答が同じ」ではない）
		return c.body(null, 204);
	});

	return app;
};
