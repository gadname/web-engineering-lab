import { RequestContext } from "@/shared/context/requestContext";
import { ApplicationException } from "@/shared/exceptions/applicationException";
import { LogLevel, type LogLevelType } from "@/shared/types/app";

const LEVEL_ORDER: Record<LogLevelType, number> = { debug: 10, info: 20, warn: 30, error: 40 };

// 予約フィールド。data による上書きを防ぐ（ログ基盤側の検索キーが壊れないように）
const RESERVED_KEYS = new Set(["timestamp", "level", "message", "requestId", "path", "httpMethod", "error"]);

type LogData = Record<string, unknown>;

/**
 * 構造化（JSON Lines）ロガー。
 *
 * - 1 行 1 JSON。ログ基盤（CloudWatch / Loki / Datadog）で属性検索できる形にする
 * - RequestContext の requestId / userId / tenantId を自動付与する。呼び出し側は渡さない
 * - Error は message / stack / errorCode に展開する
 */
// biome-ignore lint/complexity/noStaticOnlyClass: 静的メソッドのみのユーティリティ
export class Logger {
	private static level: LogLevelType = LogLevel.info;
	private static sink: (line: string) => void = (line) => process.stdout.write(`${line}\n`);

	static initBase(options: { level: LogLevelType; sink?: (line: string) => void }): void {
		Logger.level = options.level;
		if (options.sink) Logger.sink = options.sink;
	}

	static isDebugEnabled(): boolean {
		return LEVEL_ORDER[Logger.level] <= LEVEL_ORDER.debug;
	}

	static debug(message: string, data?: LogData | Error): void {
		Logger.write("debug", message, data);
	}

	static info(message: string, data?: LogData | Error): void {
		Logger.write("info", message, data);
	}

	static warn(message: string, data?: LogData | Error): void {
		Logger.write("warn", message, data);
	}

	static error(message: string, data?: LogData | Error): void {
		Logger.write("error", message, data);
	}

	private static write(level: LogLevelType, message: string, data?: LogData | Error): void {
		if (LEVEL_ORDER[level] < LEVEL_ORDER[Logger.level]) return;

		const context = RequestContext.get();
		const record: Record<string, unknown> = {
			timestamp: new Date().toISOString(),
			level,
			message,
			...(context && {
				requestId: context.requestId,
				httpMethod: context.httpMethod,
				path: context.path,
				userId: context.userId,
				tenantId: context.tenantId,
				membershipId: context.membershipId,
			}),
		};

		if (data instanceof Error) {
			record.error = Logger.serializeError(data);
		} else if (data) {
			for (const [key, value] of Object.entries(data)) {
				if (RESERVED_KEYS.has(key)) continue;
				record[key] = value instanceof Error ? Logger.serializeError(value) : value;
			}
		}

		Logger.sink(JSON.stringify(record));
	}

	private static serializeError(error: Error): Record<string, unknown> {
		if (error instanceof ApplicationException) {
			return {
				name: error.name,
				errorCode: error.errorCode,
				message: error.message,
				category: error.getCategory(),
				stack: error.chainedStack,
			};
		}
		return { name: error.name, message: error.message, stack: error.stack };
	}
}
