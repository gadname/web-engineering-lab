import fs from "node:fs/promises";
import path from "node:path";
import { app } from "@/app";

/**
 * OpenAPI spec を api/openapi.json に書き出す。
 * spec の生成にハンドラの実行は要らないので DB は不要。フロントエンドの型生成（openapi-typescript）の入力になる。
 */
const OUTPUT = path.resolve(import.meta.dirname, "../../openapi.json");

const main = async () => {
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
