import fs from "node:fs/promises";
import path from "node:path";
import { createApp } from "@/app";
import { InMemoryProjectRepository } from "@/repositories/inMemoryProjectRepository";

/**
 * OpenAPI spec を `app/api/openapi.json` に書き出す。
 * spec の生成にはハンドラの実行が要らないので、Repository はインメモリで十分（DB 不要）。
 * `app/web`（Track 1-06）はこのファイルから openapi-typescript で型を生成する。
 */
const OUTPUT = path.resolve(import.meta.dirname, "../openapi.json");

const main = async () => {
	const app = createApp({ projectRepository: new InMemoryProjectRepository() });
	const res = await app.request("/api/doc");
	if (!res.ok) throw new Error(`failed to fetch spec: ${res.status}`);
	const spec: unknown = await res.json();
	await fs.writeFile(OUTPUT, `${JSON.stringify(spec, null, 2)}\n`, "utf-8");
	console.log(`OpenAPI spec written to ${OUTPUT}`);
};

main().catch((e: unknown) => {
	console.error(e);
	process.exit(1);
});
