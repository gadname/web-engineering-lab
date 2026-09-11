import { Hono } from "hono";
import { streamSessionRegistry } from "@/shared/sse/streamSessionRegistry";

/**
 * POST /streams/{streamId}/stop → 204 / 404
 *
 * SSE アプリではなく通常 API アプリ側に置く。停止は「短い通常のリクエスト」であり、
 * SSE 用の設定（compress 無し、ログ無し）を受ける理由がないため。
 * 動作は registry 経由で対象ストリームの AbortController を abort するだけ。
 */
export const stopStream = new Hono();

stopStream.post("/:streamId/stop", (c) => {
	const stopped = streamSessionRegistry.abort(c.req.param("streamId"));
	if (!stopped) return c.json({ error: { code: "NOT_FOUND", message: "stream not found" } }, 404);
	return c.body(null, 204);
});
