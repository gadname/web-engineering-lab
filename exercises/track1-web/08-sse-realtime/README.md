# 1-08 SSE とリアルタイム更新

ノート: `docs/track1-web/08-sse-realtime.md` / 仕様書: `specs/0002-sse-streaming.md`

3 つのサブパッケージに分かれている。順に進める。

| パッケージ | 内容 | 状態 |
|---|---|---|
| [`server/`](./server/README.md) | Hono の最小 SSE サーバ。HTTP/1.1 の生バイト → ヘッダとライフサイクル → ハートビートと中断、の順で育てる | Todo 1 |
| `parser/` | WHATWG 準拠の SSE パーサ（依存ゼロ）+ 分割耐性テスト | Todo 4〜5 |
| `proxy-lab/` | nginx でバッファリング・idle timeout・HTTP/2 を観察する実験 | Todo 17〜18 |
