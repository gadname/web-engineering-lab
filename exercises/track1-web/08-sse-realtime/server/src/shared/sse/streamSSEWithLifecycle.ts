import type { Context } from "hono";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import { z } from "zod";
import { isAbortLikeError } from "@/shared/abort";
import { Logger } from "@/shared/logger";
import { startHeartbeat } from "@/shared/sse/heartbeat";

/**
 * 汎用エラーイベント。ルート側の discriminatedUnion に append して使う。
 * FE は `switch (data.type)` で他のイベントと同じ経路で扱える。
 */
export const sseErrorEventSchema = z.object({
	type: z.literal("error"),
	message: z.string(),
});
export type SSEErrorEvent = z.infer<typeof sseErrorEventSchema>;

type StreamSSEWithLifecycleProps = {
	/** ログに出す名前。例: "jobs.count" */
	streamName: string;
	metadata?: Record<string, unknown>;
	/** ストリーム本体。例外を投げてもよい（ここで捕まえる） */
	run: (stream: SSEStreamingApi) => Promise<void>;
	/** 失敗時に FE へ送るイベント。省略時は SSEErrorEvent */
	onError?: (error: unknown, stream: SSEStreamingApi) => Promise<void>;
	/** `: ping` コメント行の間隔。0 で無効。既定 15 秒 */
	heartbeatMs?: number;
};

const defaultOnError = async (_error: unknown, stream: SSEStreamingApi) => {
	const data: SSEErrorEvent = { type: "error", message: "An unexpected error occurred" };
	await stream.writeSSE({ data: JSON.stringify(data) });
};

/**
 * SSE レスポンスの共通ヘッダとライフサイクルログを担うラッパ。
 *
 * ヘッダ:
 *   Cache-Control: no-cache, no-transform  … 中継者（プロキシ / CDN）に「変換するな」（RFC 9111 §5.2.2）。
 *                                            gzip や再エンコードで chunk の即時 flush が壊れるのを防ぐ
 *   X-Accel-Buffering: no                  … nginx 固有。proxy_buffering を無効化する
 *   （Content-Type / Transfer-Encoding / Connection は streamSSE が付ける）
 *
 * ログ: 通常のリクエストログは `await next()` の後にレスポンスが確定する前提なので、
 *       終わらないストリームでは完了時刻も所要時間も取れない。ストリーム単位で START / COMPLETE / ABORT / FAIL を記録する。
 *
 * エラー: `streamSSE` に onError を渡すと `event: error` が自動送出され、data の JSON 契約と食い違う。
 *         ここで catch し、`{type:"error"}` を data として送る。throw しない。
 */
export const streamSSEWithLifecycle = (c: Context, props: StreamSSEWithLifecycleProps): Response => {
	const startedAt = Date.now();
	const heartbeatMs = props.heartbeatMs ?? 15_000;
	Logger.info(`[SSE_START] ${props.streamName}`, props.metadata);

	const response = streamSSE(c, async (stream) => {
		const stopHeartbeat = heartbeatMs > 0 ? startHeartbeat(stream, heartbeatMs) : () => {};
		try {
			await props.run(stream);
			Logger.info(`[SSE_COMPLETE] ${props.streamName}`, {
				...props.metadata,
				durationMs: Date.now() - startedAt,
			});
		} catch (error: unknown) {
			if (isAbortLikeError(error)) {
				Logger.warn(`[SSE_ABORT] ${props.streamName}`, {
					...props.metadata,
					durationMs: Date.now() - startedAt,
					errorName: error.name,
				});
			} else {
				Logger.error(`[SSE_FAIL] ${props.streamName}`, {
					...props.metadata,
					error: error instanceof Error ? error.message : String(error),
				});
				await (props.onError ?? defaultOnError)(error, stream);
			}
		} finally {
			stopHeartbeat();
		}
	});

	// 落とし穴: Hono 4.13 の streamSSE は内部で `Cache-Control: no-cache` を c.header() で設定するため、
	// 呼び出し前に付けた値は上書きされる。Response を受け取ってから headers を直す
	response.headers.set("Cache-Control", "no-cache, no-transform");
	response.headers.set("X-Accel-Buffering", "no");
	return response;
};
