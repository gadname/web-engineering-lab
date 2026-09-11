import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { requestLog } from "@/middlewares/requestLog";
import { createProjectRoutes } from "@/routes/projects";
import { InMemoryProjectStore, type IProjectStore } from "@/store";

export type AppOptions = {
	store?: IProjectStore;
	logSink?: (line: string) => void;
};

/**
 * アプリ本体もファクトリ関数にする。
 * テストごとに独立したストアを持てるので、テスト間で状態が漏れない。
 */
export const createApp = (options: AppOptions = {}) => {
	const store = options.store ?? new InMemoryProjectStore();

	// ルートアプリ: ヘルスチェックはミドルウェアを通さず常に 200
	const root = new Hono();
	root.get("/health", (c) => c.json({ status: "ok" }));

	// API アプリ: 共通ミドルウェアはここに集約する
	const api = new Hono().basePath("/api");
	// 順序に意味がある: requestId を先に採番しないと、後段のログに ID が乗らない
	api.use(requestId());
	api.use(requestLog(options.logSink));

	api.route("/projects", createProjectRoutes(store));
	root.route("/", api);

	// 404 と 500 の表現も統一しておく（02 以降でエラー形式を Zod スキーマ化する）
	// 落とし穴: notFound / onError は「最上位のアプリ」にしか効かない。
	// sub-app（api）に設定しても route() でマウントした時点で無視されるので root に置く。
	root.notFound((c) => c.json({ error: { code: "NOT_FOUND" } }, 404));
	root.onError((err, c) => {
		console.error(err);
		return c.json({ error: { code: "INTERNAL_SERVER_ERROR" } }, 500);
	});

	return root;
};
