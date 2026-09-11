import { serve } from "@hono/node-server";
import { createApp } from "@/app";

const port = Number(process.env.PORT ?? 8787);
const app = createApp();

serve({ fetch: app.fetch, port }, (info) => {
	console.log(`listening on http://localhost:${info.port}`);
	console.log(`  spec:    http://localhost:${info.port}/api/doc`);
	console.log(`  swagger: http://localhost:${info.port}/api/swagger`);
});
