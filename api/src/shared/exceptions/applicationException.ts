import { ERROR_DEFINITIONS } from "@/shared/errors/definitions";
import { getMessage } from "@/shared/errors/messages";
import type { ErrorCode, ErrorContext } from "@/shared/errors/types";
import type { ErrorStatusCode } from "@/shared/types/http";

export type ExceptionCategory = "domains" | "system" | "validation";

/**
 * アプリケーション例外の基底。
 *
 * throw 側はエラーコードだけを渡し、HTTP ステータス・ユーザー向け文言・ログレベルは
 * `ERROR_DEFINITIONS` から引く。層ごとのサブクラス（Domain / Usecase / Infrastructure / Middleware / Route）は
 * 「どの層で発生したか」をログとテストで区別するためのもので、振る舞いは同じ。
 */
export abstract class ApplicationException extends Error {
	public readonly errorCode: ErrorCode;
	public readonly statusCode: ErrorStatusCode;
	public readonly userMessage: string;
	public readonly meta: ErrorContext;
	private readonly logLevel: "error" | "warn" | "info";

	public constructor(errorCode: ErrorCode, context?: ErrorContext) {
		const definition = ERROR_DEFINITIONS[errorCode];
		const userMessage = getMessage(definition.messageKey, context?.data);
		super(definition.technicalMessage ?? userMessage, { cause: context?.cause });
		this.name = this.constructor.name;
		this.errorCode = errorCode;
		this.statusCode = definition.statusCode;
		this.userMessage = userMessage;
		this.meta = context ?? {};
		this.logLevel = definition.logLevel;
	}

	public abstract getCategory(): ExceptionCategory;

	public getLogLevel(): "error" | "warn" | "info" {
		return this.logLevel;
	}

	/** cause を辿ってスタックを連結する（ログ用） */
	public get chainedStack(): string {
		let stack = this.stack ?? "no stack";
		let current: unknown = this.meta.cause;
		while (current instanceof Error) {
			stack += `\nCaused by: ${current.stack ?? current.message}`;
			current = current.cause;
		}
		return stack;
	}
}
