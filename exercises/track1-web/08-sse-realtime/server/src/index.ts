import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { createApp } from "@/app";

const port = Number(process.env.PORT ?? 8788);

const server = serve({ fetch: createApp().fetch, port }, (info) => {
	console.log(`sse server listening on http://localhost:${info.port}`);
	console.log(`  GET  /api/sse/v1/clock?ticks=5`);
	console.log(`  POST /api/sse/v1/jobs/count  {"total":10,"stepDelayMs":500}`);
	console.log(`  POST /api/streams/{streamId}/stop`);
});

// keep-alive の不等式（Track 3-03 の先取り）:
//   前段（プロキシ / LB）の idle timeout  <  keepAliveTimeout  <  headersTimeout
// バックエンドが先に idle 接続を閉じると、前段が再利用しようとした接続で 502 になる。
// Node 既定は keepAliveTimeout 5 秒。nginx の keepalive_timeout 既定 75 秒 より長くしておく。
const httpServer = server as HttpServer;
httpServer.keepAliveTimeout = 80_000;
httpServer.headersTimeout = 85_000;
