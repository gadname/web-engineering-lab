import { z } from "zod";
import { INFRASTRUCTURE_ERROR_CODES } from "@/shared/errors/codes/system/infrastructureErrors";
import { InfrastructureException } from "@/shared/exceptions/infrastructureException";
import { Env, LogLevel } from "@/shared/types/app";

const toEnum = <T extends Record<string, string>>(obj: T) => Object.values(obj) as [T[keyof T], ...T[keyof T][]];

export const configSchema = z.object({
	ENV: z.enum(toEnum(Env)).default("local"),
	LOG_LEVEL: z.enum(toEnum(LogLevel)).default("info"),
	PORT: z.coerce.number().int().positive().default(8787),
	DATABASE_URL: z.string().url(),
});

export type AppConfigType = z.infer<typeof configSchema>;

/**
 * 起動時に一度だけ検証する設定。
 *
 * 環境変数は「外から来る信用できない入力」なので、リクエストボディと同じく zod で検証する。
 * ここで落とせば「最初のリクエストで DATABASE_URL 未設定に気づく」ではなく、起動直後に明確なメッセージで止まる。
 * 参考実装では SSM Parameter Store などの driver を差し替えられる構造だが、ここでは環境変数のみ。
 */
export class AppConfig {
	private static instance: AppConfig | null = null;

	private constructor(private readonly config: AppConfigType) {}

	static initialize(source: NodeJS.ProcessEnv = process.env): AppConfig {
		if (AppConfig.instance) return AppConfig.instance;

		const result = configSchema.safeParse(source);
		if (!result.success) {
			throw new InfrastructureException(INFRASTRUCTURE_ERROR_CODES.CONFIG.VALIDATION_FAILED, {
				cause: result.error,
				data: { issues: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
			});
		}
		AppConfig.instance = new AppConfig(result.data);
		return AppConfig.instance;
	}

	static getInstance(): AppConfig {
		if (!AppConfig.instance) {
			throw new InfrastructureException(INFRASTRUCTURE_ERROR_CODES.CONFIG.NOT_INITIALIZED);
		}
		return AppConfig.instance;
	}

	/** テスト用。プロセス内シングルトンを捨てて initialize をやり直せるようにする */
	static reset(): void {
		AppConfig.instance = null;
	}

	get<K extends keyof AppConfigType>(key: K): AppConfigType[K] {
		return this.config[key];
	}
}
