import { Hono } from "hono";
import { z } from "zod";
import { abortContext, isAbortLikeError } from "@/shared/abort";
import { createSSEWriter } from "@/shared/sse/createSSEWriter";
import { streamSessionRegistry } from "@/shared/sse/streamSessionRegistry";
import { sseErrorEventSchema, streamSSEWithLifecycle } from "@/shared/sse/streamSSEWithLifecycle";

/**
 * POST /jobs/count  { total: number, stepDelayMs?: number, failAt?: number }
 *
 * 「長い処理を 1 ステップずつ進めて進捗を流す」最小のジョブ。
 * app/api ではこれが「タスク一括インポート」になる（Todo 9〜10）。
 *
 * 中断は 2 系統を 1 つの signal に合成する:
 *   親 = クライアント切断（c.req.raw.signal。@hono/node-server が切断時に abort する）
 *   cancel = 明示停止（POST /streams/{streamId}/stop → registry → controller.abort）
 */
export const countJobBodySchema = z.object({
	total: z.number().int().min(1).max(1000),
	stepDelayMs: z.number().int().min(0).max(10_000).default(200),
	/** テスト用: このステップで例外を投げる */
	failAt: z.number().int().min(1).optional(),
});

export const countJobEventSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("started"), streamId: z.string(), total: z.number() }),
	z.object({ type: z.literal("progress"), done: z.number(), total: z.number() }),
	z.object({ type: z.literal("completed"), total: z.number() }),
	z.object({ type: z.literal("failed"), reason: z.string() }),
	sseErrorEventSchema,
]);
export type CountJobEvent = z.infer<typeof countJobEventSchema>;

const writeCountJobEvent = createSSEWriter<CountJobEvent>();

export const countJob = new Hono();

countJob.post("/", async (c) => {
	const parsed = countJobBodySchema.safeParse(await c.req.json().catch(() => undefined));
	if (!parsed.success) {
		return c.json({ error: { code: "VALIDATION_ERROR", message: parsed.error.message } }, 422);
	}
	const { total, stepDelayMs, failAt } = parsed.data;
	const streamId = crypto.randomUUID();

	// クライアント切断を親にした子コンテキスト。明示停止はこの子を cancel する
	const runAbort = abortContext.withCancel(c.req.raw.signal);

	return streamSSEWithLifecycle(c, {
		streamName: "jobs.count",
		metadata: { streamId, total },
		run: async (stream) => {
			// stop API からの abort を runAbort に合流させる
			const stopController = new AbortController();
			stopController.signal.addEventListener("abort", () => runAbort.cancel(stopController.signal.reason), {
				once: true,
			});
			streamSessionRegistry.register(streamId, stopController);

			try {
				await writeCountJobEvent(stream, { type: "started", streamId, total });
				for (let done = 1; done <= total; done++) {
					if (failAt === done) throw new Error(`step ${done} failed`);
					const slept = await sleep(stepDelayMs, runAbort.signal).then(
						() => true,
						(e: unknown) => {
							if (isAbortLikeError(e)) return false;
							throw e;
						},
					);
					if (!slept) {
						// 中断の出どころで扱いを変える:
						//   クライアント切断 → もう誰も読んでいない。AbortError を投げて [SSE_ABORT] として記録
						//   明示停止（stop API）→ 読んでいる相手に「止めた」と伝えて正常終了
						if (c.req.raw.signal.aborted) throw abortError(runAbort.signal);
						await writeCountJobEvent(stream, { type: "failed", reason: "stopped" });
						return;
					}
					await writeCountJobEvent(stream, { type: "progress", done, total });
				}
				await writeCountJobEvent(stream, { type: "completed", total });
			} finally {
				// 完了 / 失敗 / 切断のどれでも、登録簿と親 listener を必ず解放する
				streamSessionRegistry.remove(streamId);
				runAbort.cancel();
			}
		},
	});
});

/** signal で中断できる sleep。abort されたら AbortError で reject する */
const sleep = (ms: number, signal: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		if (signal.aborted) return reject(abortError(signal));
		const timer = setTimeout(() => {
			signal.removeEventListener("abort", onAbort);
			resolve();
		}, ms);
		const onAbort = () => {
			clearTimeout(timer);
			reject(abortError(signal));
		};
		signal.addEventListener("abort", onAbort, { once: true });
	});

const abortError = (signal: AbortSignal) => {
	const err = new Error(signal.reason instanceof Error ? signal.reason.message : "Aborted");
	err.name = "AbortError";
	return err;
};
