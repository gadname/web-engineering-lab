import { z } from "zod";

// ブラウザに公開してよい変数だけを定義する（NEXT_PUBLIC_ 接頭辞のものがビルド時に埋め込まれる）
const clientEnvSchema = z.object({
	NEXT_PUBLIC_ENV: z.enum(["prod", "stg", "dev", "local"]),
	NEXT_PUBLIC_CORE_BACKEND_REST_ENDPOINT: z.string().url(),
	NEXT_PUBLIC_AI_BACKEND_REST_ENDPOINT: z.string().url(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * クライアント環境変数を取得する。
 *
 * ブラウザでは process.env オブジェクト自体は空で、`process.env.NEXT_PUBLIC_X` という
 * 静的なアクセスだけがビルド時に文字列へ置換される。そのため zod に渡すオブジェクトは
 * キーを 1 つずつ明示して組み立てる（`z.parse(process.env)` はブラウザでは動かない）。
 */
export const getClientEnv = (): ClientEnv =>
	clientEnvSchema.parse({
		NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
		NEXT_PUBLIC_CORE_BACKEND_REST_ENDPOINT: process.env.NEXT_PUBLIC_CORE_BACKEND_REST_ENDPOINT,
		NEXT_PUBLIC_AI_BACKEND_REST_ENDPOINT: process.env.NEXT_PUBLIC_AI_BACKEND_REST_ENDPOINT,
	});
