import type { MiddlewareHandler } from "hono";

/**
 * リクエスト / レスポンスのログ。
 *
 * `await next()` の前が「リクエスト受信時」、後が「レスポンス確定後」。
 * ミドルウェアはこの前後に処理を挟む玉ねぎ構造（onion）で、登録順 = 外側から内側の順になる。
 */
export const requestLog = (sink: (line: string) => void = console.log): MiddlewareHandler => {
	return async (c, next) => {
		const start = performance.now();
		await next();
		const ms = (performance.now() - start).toFixed(1);
		// hono/request-id が c.set("requestId", ...) した値。未登録なら "-"
		const requestId = c.get("requestId") ?? "-";
		sink(`${c.req.method} ${new URL(c.req.url).pathname} ${c.res.status} ${ms}ms requestId=${requestId}`);
	};
};
