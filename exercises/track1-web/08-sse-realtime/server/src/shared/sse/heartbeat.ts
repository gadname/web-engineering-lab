import type { SSEStreamingApi } from "hono/streaming";

/**
 * `: ping` というコメント行を一定間隔で書く。
 *
 * SSE の仕様（WHATWG HTML 9.2.5）で `:` 始まりの行はコメントで、クライアントは無視する。
 * つまり「アプリのイベント契約を汚さずに、経路上の全ホップへ『まだ生きている』と伝える」手段になる。
 *
 * 無通信が続くと、プロキシ（nginx の proxy_read_timeout）やロードバランサ（idle timeout）が
 * 接続を切る。対処は 2 つある:
 *   (a) このハートビートで沈黙を作らない
 *   (b) 経路側の idle timeout を伸ばす
 * 参考実装は (b) を採った（障害を起点に LB の idle_timeout を延長）。本教材は (a) も実装し、Todo 18 の nginx 実験で両方を比べる。
 *
 * @returns 停止関数。ストリーム終了時に必ず呼ぶ
 */
export const startHeartbeat = (stream: SSEStreamingApi, intervalMs: number): (() => void) => {
	const timer = setInterval(() => {
		// write は閉じたストリームに対して throw しない（Hono 側で握り潰す）ので、そのまま呼んでよい
		void stream.write(": ping\n\n");
	}, intervalMs);
	return () => clearInterval(timer);
};
