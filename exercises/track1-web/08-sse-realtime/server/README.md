# 08 server: 参考実装の設計を踏襲した SSE サーバ

ノート: `docs/track1-web/08-sse-realtime.md` / 仕様書: `specs/0002-sse-streaming.md`（Todo 1〜3）

## ゴール
SSE を「終わらない 200 レスポンス」として生バイトで理解したうえで、実務で必要になる 5 つの部品を最小構成で持つ。

| 部品 | ファイル | 何を解決するか |
|---|---|---|
| アプリ分離 | `src/app.ts` | compress とリクエストログを SSE に掛けない。`/api/sse/v1` 接頭辞で経路上から識別できる |
| lifecycle ラッパ | `src/shared/sse/streamSSEWithLifecycle.ts` | `no-transform` / `X-Accel-Buffering` ヘッダ、START / COMPLETE / ABORT / FAIL ログ、例外を `{type:"error"}` に変換 |
| 型付き writer | `src/shared/sse/createSSEWriter.ts` | `data:` の JSON を discriminatedUnion で縛る。`event:` は使わない |
| ハートビート | `src/shared/sse/heartbeat.ts` | `: ping` コメント行で沈黙を作らない（参考実装は LB の timeout 延長で対処。Todo 18 で比較） |
| 中断の合成 | `src/shared/abort.ts` + `streamSessionRegistry.ts` + `routes/stopStream.ts` | クライアント切断（親 signal）と stop API（cancel）を 1 つの子 signal に合流。`finally` で解放 |

## 手順
```bash
npm ci
npm test
npm run dev          # :8788
```

### 1. 生バイトを見る（HTTP/1.1 の chunked）
```bash
curl -N -v --raw 'localhost:8788/api/sse/v1/clock?ticks=3' | cat -ve
```
- `Content-Length` が無く `transfer-encoding: chunked`。本文は `<16 進サイズ>\r\n<本体>\r\n` の繰り返し、終端は `0\r\n\r\n`
- `cache-control: no-cache, no-transform` と `x-accel-buffering: no` が付いている
- `--raw` を外すと curl が chunk を解く。`-N` を外すと curl 側でバッファされ、まとめて出る

### 2. ハートビート
```bash
curl -N 'localhost:8788/api/sse/v1/clock?ticks=3&intervalMs=5000&heartbeatMs=1000'
```
5 秒沈黙する間に `: ping` が 1 秒ごとに出る。クライアントはこれを無視するが、途中のプロキシは「生きている」と判断する。

### 3. ジョブと明示停止
```bash
curl -N -X POST localhost:8788/api/sse/v1/jobs/count -H 'content-type: application/json' -d '{"total":20,"stepDelayMs":500}'
# 別ターミナルで、started イベントの streamId を使って
curl -i -X POST localhost:8788/api/streams/<streamId>/stop
```
`{"type":"failed","reason":"stopped"}` が届いてストリームが閉じる。2 回目の stop は 404。

### 4. クライアント切断
上のジョブを Ctrl-C で切る。サーバログに `[SSE_ABORT] jobs.count` が出て、ループが止まる。
`src/routes/countJob.ts` の `if (c.req.raw.signal.aborted) throw` を消すと、切断してもループが最後まで走ることを確認する。

## 受け入れ条件
- [ ] chunked の 16 進サイズ行が「そのイベントのバイト数」であることを 1 つ検算した
- [ ] `no-transform` と `X-Accel-Buffering: no` が誰に向けたヘッダかを説明できる
- [ ] 例外を throw せず `{type:"error"}` で送る理由（`streamSSE` が `event: error` を自動送出する）を説明できる
- [ ] 「クライアント切断」と「明示停止」が同じ子 signal に合流し、`finally` で親の listener が外れることを追えた
- [ ] `npm run check && npm test` が通る（14 件）

## app への反映
`app/api` には Todo 6〜10 で同じ構成を移植する。`/jobs/count` が「タスク一括インポート」になり、OpenAPI（`sse200`）と Prisma が加わる。
