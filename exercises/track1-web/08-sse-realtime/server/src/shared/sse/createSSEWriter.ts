import type { SSEStreamingApi } from "hono/streaming";

/**
 * 型付きの SSE 書き込み関数を作る。
 *
 * `{ type: string }` を持つ discriminatedUnion を型パラメータにすると、
 * `type` ごとに data の形がコンパイル時に検査される。FE は `switch (data.type)` で narrowing できる。
 *
 * `event:` / `id:` / `retry:` は使わない。すべて `data: <JSON>` で送り、JSON 内の `type` で判別する。
 * 理由: OpenAPI に 1 つのスキーマ（union）として載せられ、FE の生成型と 1:1 になる。
 *       `event:` を使うと「イベント名 → 型」の対応をスキーマの外で持つことになる。
 * 代償: `id:` を使わないので EventSource の自動再接続 / Last-Event-ID は効かない（GET デモで別途扱う）。
 */
export const createSSEWriter = <T extends { type: string }>() => {
	return (stream: SSEStreamingApi, data: T): Promise<void> => stream.writeSSE({ data: JSON.stringify(data) });
};
