import { Hono } from "hono";
import { compress } from "hono/compress";
import { requestId } from "hono/request-id";
import { clock } from "@/routes/clock";
import { countJob } from "@/routes/countJob";
import { stopStream } from "@/routes/stopStream";

/**
 * アプリの組み立て。通常 API と SSE を **別の Hono app** に分ける。
 *
 *   root
 *    ├─ GET /health                       ミドルウェア無し
 *    ├─ standardApp  /api                 requestId + compress。短いリクエスト用
 *    │    └─ POST /streams/:id/stop
 *    └─ sseApp       /api/sse/v1          requestId のみ。compress とリクエストログを掛けない
 *         ├─ GET  /clock
 *         └─ POST /jobs/count
 *
 * 分ける理由:
 * - compress はレスポンス全体を圧縮窓に溜めるため、chunk の即時 flush と相性が悪い
 *   （Hono の compress は Transfer-Encoding / no-transform を見て素通しするが、それはライブラリの善意であって契約ではない）
 * - リクエストログ middleware は `await next()` の後にレスポンスを見る前提で、終わらないストリームでは所要時間が取れない
 * - `/api/sse/v1` という接頭辞にしておくと、プロキシや LB のルール、ログのフィルタで SSE を識別できる
 */
export const createApp = () => {
	const root = new Hono();
	root.get("/health", (c) => c.json({ status: "ok" }));

	const standardApp = new Hono().basePath("/api");
	standardApp.use(requestId());
	standardApp.use(compress());
	standardApp.route("/streams", stopStream);

	const sseApp = new Hono().basePath("/api/sse/v1");
	sseApp.use(requestId());
	sseApp.route("/clock", clock);
	sseApp.route("/jobs/count", countJob);

	root.route("/", sseApp); // より具体的なパスを先に
	root.route("/", standardApp);

	root.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "route not found" } }, 404));
	return root;
};
