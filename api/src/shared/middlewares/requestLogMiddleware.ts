import { createMiddleware } from "hono/factory";
import { Logger } from "@/shared/logger/logger";
import type { ApplicationEntry } from "@/shared/types/app";

/** リクエストの開始・終了を 1 行ずつ出す。onion の「前」で開始、「後」で終了とステータス・所要時間 */
export const requestLogMiddleware = createMiddleware<ApplicationEntry>(async (c, next) => {
	const startedAt = performance.now();
	Logger.info("Request started", { userAgent: c.req.header("user-agent") });
	await next();
	Logger.info("Request finished", {
		status: c.res.status,
		durationMs: Math.round(performance.now() - startedAt),
	});
});
