import fs from "node:fs/promises";
import path from "node:path";
import { createApp } from "@/app";

/**
 * OpenAPI spec をファイルに書き出す。
 *
 * サーバを起動せず `app.request("/api/doc")` でインプロセスに取得する。
 * 「起動中のサーバから fetch する」方式（参考実装はこちら）と比べ、CI で使いやすい代わりに
 * 「起動時初期化（DB 接続など）を経た実サーバの出力」ではない点に注意。
 * 出力先の `generated/openapi.json` を `openapi-typescript` に渡して型を生成する。
 */
const OUTPUT = path.resolve(import.meta.dirname, "../generated/openapi.json");

const main = async () => {
	const app = createApp();
	const res = await app.request("/api/doc");
	if (!res.ok) throw new Error(`failed to fetch spec: ${res.status}`);
	const spec: unknown = await res.json();
	await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
	await fs.writeFile(OUTPUT, `${JSON.stringify(spec, null, 2)}\n`, "utf-8");
	console.log(`OpenAPI spec written to ${OUTPUT}`);
};

main().catch((e: unknown) => {
	console.error(e);
	process.exit(1);
});
