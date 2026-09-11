import { Hono } from "hono";
import { z } from "zod";
import { createSSEWriter } from "@/shared/sse/createSSEWriter";
import { sseErrorEventSchema, streamSSEWithLifecycle } from "@/shared/sse/streamSSEWithLifecycle";

/**
 * GET /clock?ticks=5&intervalMs=1000&heartbeatMs=15000
 * 1 tick ごとに時刻を流す。curl で生バイトを観察する用途と、ハートビートの動作確認用。
 */
const tickEventSchema = z.object({ type: z.literal("tick"), tick: z.number(), time: z.string() });
export const clockEventSchema = z.discriminatedUnion("type", [tickEventSchema, sseErrorEventSchema]);
type ClockEvent = z.infer<typeof clockEventSchema>;

const writeClockEvent = createSSEWriter<ClockEvent>();

export const clock = new Hono();

clock.get("/", (c) => {
	const ticks = Number(c.req.query("ticks") ?? 5);
	const intervalMs = Number(c.req.query("intervalMs") ?? 1000);
	const heartbeatMs = c.req.query("heartbeatMs") === undefined ? undefined : Number(c.req.query("heartbeatMs"));

	return streamSSEWithLifecycle(c, {
		streamName: "clock",
		metadata: { ticks, intervalMs },
		heartbeatMs,
		run: async (stream) => {
			for (let i = 1; i <= ticks; i++) {
				await writeClockEvent(stream, { type: "tick", tick: i, time: new Date().toISOString() });
				await stream.sleep(intervalMs);
			}
		},
	});
});
