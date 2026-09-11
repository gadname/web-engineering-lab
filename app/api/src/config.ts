import { z } from "zod";

/**
 * 起動時の設定検証。
 *
 * 環境変数は「外から来る信用できない入力」なので、リクエストボディと同じく起動時に一度検証する。
 * ここで落とせば「最初のリクエストで DATABASE_URL 未設定に気づく」のではなく、起動直後に明確なメッセージで止まる。
 *
 * NOTE: Node は .env を自動で読まない（Prisma CLI は読むので migrate だけ動いて紛らわしい）。
 *       dev スクリプトで `--env-file-if-exists=.env` を渡している。本番はコンテナの環境変数で注入する。
 */
const configSchema = z.object({
	PORT: z.coerce.number().int().positive().default(8787),
	DATABASE_URL: z.string().url(),
});

export type AppConfig = z.infer<typeof configSchema>;

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): AppConfig => {
	const result = configSchema.safeParse(env);
	if (!result.success) {
		const issues = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
		throw new Error(`invalid environment variables:\n${issues}`);
	}
	return result.data;
};
