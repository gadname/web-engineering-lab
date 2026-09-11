/**
 * AbortSignal を「親から派生させる」ためのヘルパ。
 *
 * なぜ必要か:
 * リクエストの signal（`c.req.raw.signal`）はリクエストが生きている間ずっと存在する長寿命の signal。
 * これに処理ごとの listener を直接足すと、処理が正常完了しても listener が残り続ける（リーク）。
 * そこで処理ごとに使い捨ての子 signal を作り、親が abort されたら子も abort し、
 * 処理が終わったら `cancel()` で親側の listener を外す。
 *
 * 「親 = クライアント切断」「cancel = 明示停止 API」の 2 系統を 1 つの子 signal に合成できる。
 */
export type AbortContext = {
	signal: AbortSignal;
	/** 処理が終わったら必ず呼ぶ（finally 推奨）。親の listener を解放する */
	cancel: (reason?: unknown) => void;
};

export const abortContext = {
	/** 親を持たない。`cancel()` を呼ぶまで abort されない */
	background(): AbortContext {
		const controller = new AbortController();
		return {
			signal: controller.signal,
			cancel: (reason?: unknown) => {
				if (!controller.signal.aborted) controller.abort(reason ?? new Error("Canceled"));
			},
		};
	},

	/** 親 signal を引き継ぎ、明示的にも cancel できる子 signal を作る */
	withCancel(parent?: AbortSignal | AbortContext | null): AbortContext {
		const child = new AbortController();
		const parentSignal = parent instanceof AbortSignal ? parent : parent?.signal;
		const onParentAbort = () => child.abort(parentSignal?.reason ?? new Error("Parent aborted"));

		// 親 listener の解除は「子が abort されたとき」に集約する。
		// 親が既に abort 済みでも cleanup が走るよう、先に登録しておく
		child.signal.addEventListener("abort", () => parentSignal?.removeEventListener("abort", onParentAbort), {
			once: true,
		});

		if (parentSignal?.aborted) {
			onParentAbort();
		} else {
			parentSignal?.addEventListener("abort", onParentAbort, { once: true });
		}

		return {
			signal: child.signal,
			cancel: (reason?: unknown) => {
				if (!child.signal.aborted) child.abort(reason ?? new Error("Canceled"));
			},
		};
	},

	/** 親 signal + タイムアウト。処理が先に終わったら `cancel()` でタイマーも解放する */
	withTimeout(parent: AbortSignal | AbortContext | null | undefined, timeoutMs: number): AbortContext {
		const base = abortContext.withCancel(parent);
		const timer = setTimeout(() => base.cancel(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
		base.signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
		return base;
	},
};

/** abort 起因の例外か（AbortController.abort() 既定の DOMException や timeout 由来） */
export const isAbortLikeError = (error: unknown): error is Error =>
	error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
