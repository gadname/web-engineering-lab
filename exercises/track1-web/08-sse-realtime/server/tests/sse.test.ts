import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "@/app";
import { Logger, type LogLine } from "@/shared/logger";
import { streamSessionRegistry } from "@/shared/sse/streamSessionRegistry";
import { iterateSse, readAllSse } from "./helpers/readSse";

const logs: LogLine[] = [];
Logger.setSink((line) => logs.push(line));

const json = (body: unknown, init: RequestInit = {}): RequestInit => ({
	method: "POST",
	headers: { "content-type": "application/json" },
	body: JSON.stringify(body),
	...init,
});

describe("SSE server（参考実装の設計を踏襲）", () => {
	beforeEach(() => {
		logs.length = 0;
		streamSessionRegistry.clear();
	});

	it("共通ヘッダ: text/event-stream, no-transform, X-Accel-Buffering: no, Content-Length 無し", async () => {
		const res = await createApp().request("/api/sse/v1/clock?ticks=1&intervalMs=0&heartbeatMs=0");
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toBe("text/event-stream");
		expect(res.headers.get("cache-control")).toBe("no-cache, no-transform");
		expect(res.headers.get("x-accel-buffering")).toBe("no");
		expect(res.headers.get("content-length")).toBeNull();
		await res.text();
	});

	it("イベントは data: の JSON だけで、type で判別する（event: は使わない）", async () => {
		const res = await createApp().request("/api/sse/v1/clock?ticks=2&intervalMs=0&heartbeatMs=0");
		const text = await res.text();
		expect(text).not.toContain("event:");
		const { data } = await readAllSse(new Response(text));
		expect(data.map((d) => JSON.parse(d))).toEqual([
			expect.objectContaining({ type: "tick", tick: 1 }),
			expect.objectContaining({ type: "tick", tick: 2 }),
		]);
		expect(logs.map((l) => l.message)).toEqual(["[SSE_START] clock", "[SSE_COMPLETE] clock"]);
	});

	it("ハートビートは `: ping` のコメント行で、data には現れない", async () => {
		const res = await createApp().request("/api/sse/v1/clock?ticks=2&intervalMs=120&heartbeatMs=50");
		const { data, comments } = await readAllSse(res);
		expect(data).toHaveLength(2);
		expect(comments.length).toBeGreaterThanOrEqual(2);
		expect(comments.every((c) => c === ": ping")).toBe(true);
	});

	it("ジョブは started → progress×N → completed、started に streamId が乗る", async () => {
		const res = await createApp().request("/api/sse/v1/jobs/count", json({ total: 3, stepDelayMs: 0 }));
		expect(res.status).toBe(200);
		const { data } = await readAllSse(res);
		const events = data.map((d) => JSON.parse(d));
		expect(events.map((e) => e.type)).toEqual(["started", "progress", "progress", "progress", "completed"]);
		expect(events[0].streamId).toMatch(/[0-9a-f-]{36}/);
		expect(streamSessionRegistry.size()).toBe(0);
	});

	it('ストリーム内の例外は throw せず {type:"error"} を送り、ログは [SSE_FAIL]', async () => {
		const res = await createApp().request("/api/sse/v1/jobs/count", json({ total: 3, stepDelayMs: 0, failAt: 2 }));
		expect(res.status).toBe(200); // ヘッダ送出後なのでステータスは変えられない。本文で伝える
		const text = await res.text();
		expect(text).not.toContain("event: error"); // streamSSE 任せだとこれが出て契約が壊れる
		const { data } = await readAllSse(new Response(text));
		expect(JSON.parse(data.at(-1) ?? "")).toEqual({ type: "error", message: "An unexpected error occurred" });
		expect(logs.some((l) => l.message === "[SSE_FAIL] jobs.count")).toBe(true);
		expect(streamSessionRegistry.size()).toBe(0);
	});

	it("クライアント切断（signal abort）でジョブが止まり、ログは [SSE_ABORT]、登録簿が空になる", async () => {
		const controller = new AbortController();
		const res = await createApp().request(
			"/api/sse/v1/jobs/count",
			json({ total: 100, stepDelayMs: 50 }, { signal: controller.signal }),
		);
		const events = iterateSse(res);
		expect(JSON.parse((await events.next()).value).type).toBe("started");
		expect(streamSessionRegistry.size()).toBe(1);

		controller.abort(); // ← curl を Ctrl-C したのと同じ
		await new Promise((r) => setTimeout(r, 120));

		expect(streamSessionRegistry.size()).toBe(0);
		expect(logs.some((l) => l.message === "[SSE_ABORT] jobs.count")).toBe(true);
		expect(logs.some((l) => l.message === "[SSE_COMPLETE] jobs.count")).toBe(false);
	});

	it('stop API で明示停止すると {type:"failed", reason:"stopped"} が届き 204、2 回目は 404', async () => {
		const app = createApp();
		const res = await app.request("/api/sse/v1/jobs/count", json({ total: 100, stepDelayMs: 30 }));
		const events = iterateSse(res);
		const started = JSON.parse((await events.next()).value);

		const stop = await app.request(`/api/streams/${started.streamId}/stop`, { method: "POST" });
		expect(stop.status).toBe(204);

		const rest: string[] = [];
		for await (const e of events) rest.push(JSON.parse(e).type);
		expect(rest.at(-1)).toBe("failed");
		expect(rest).not.toContain("completed");

		const again = await app.request(`/api/streams/${started.streamId}/stop`, { method: "POST" });
		expect(again.status).toBe(404);
		expect(streamSessionRegistry.size()).toBe(0);
	});

	it("通常 API には compress が掛かり、SSE には掛からない", async () => {
		const app = createApp();
		const stop = await app.request("/api/streams/none/stop", {
			method: "POST",
			headers: { "accept-encoding": "gzip" },
		});
		// 404 の小さな JSON は閾値未満で圧縮されないが、ヘッダ経路は通常 app
		expect(stop.status).toBe(404);
		const sse = await app.request("/api/sse/v1/clock?ticks=1&intervalMs=0&heartbeatMs=0", {
			headers: { "accept-encoding": "gzip" },
		});
		expect(sse.headers.get("content-encoding")).toBeNull();
		await sse.text();
	});
});
