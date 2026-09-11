import { describe, expect, it } from "vitest";
import { abortContext, isAbortLikeError } from "@/shared/abort";

describe("abortContext.withCancel", () => {
	it("親が abort されると子も同じ reason で abort される", () => {
		const parent = new AbortController();
		const child = abortContext.withCancel(parent.signal);
		const reason = new Error("client disconnected");
		parent.abort(reason);
		expect(child.signal.aborted).toBe(true);
		expect(child.signal.reason).toBe(reason);
	});

	it("子を cancel しても親は abort されない（明示停止はそのストリームだけに効く）", () => {
		const parent = new AbortController();
		const child = abortContext.withCancel(parent.signal);
		child.cancel();
		expect(child.signal.aborted).toBe(true);
		expect(parent.signal.aborted).toBe(false);
	});

	it("既に abort 済みの親から作ると即座に abort 済み", () => {
		const parent = new AbortController();
		parent.abort();
		const child = abortContext.withCancel(parent.signal);
		expect(child.signal.aborted).toBe(true);
	});

	it("cancel 後は親の listener が外れている（リークしない）", () => {
		const parent = new AbortController();
		let calls = 0;
		const original = parent.signal.addEventListener.bind(parent.signal);
		const removed: string[] = [];
		parent.signal.removeEventListener = ((type: string) => {
			removed.push(type);
		}) as typeof parent.signal.removeEventListener;
		parent.signal.addEventListener = ((type: string, l: EventListener, o?: unknown) => {
			calls++;
			original(type, l, o as AddEventListenerOptions);
		}) as typeof parent.signal.addEventListener;

		const child = abortContext.withCancel(parent.signal);
		expect(calls).toBe(1);
		child.cancel();
		expect(removed).toEqual(["abort"]);
	});

	it("withTimeout は時間切れで abort、先に cancel すればタイマーは無効", async () => {
		const ctx = abortContext.withTimeout(null, 20);
		await new Promise((r) => setTimeout(r, 40));
		expect(ctx.signal.aborted).toBe(true);
		expect(String(ctx.signal.reason)).toContain("Timed out");

		const ctx2 = abortContext.withTimeout(null, 20);
		ctx2.cancel();
		expect(String(ctx2.signal.reason)).toContain("Canceled");
	});

	it("isAbortLikeError は AbortError / TimeoutError だけを abort 扱いにする", () => {
		const abort = new Error("x");
		abort.name = "AbortError";
		expect(isAbortLikeError(abort)).toBe(true);
		expect(isAbortLikeError(new Error("boom"))).toBe(false);
	});
});
