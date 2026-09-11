import type { ErrorStatusCode } from "@/shared/types/http";
import type { AllErrorCode } from "./codes";
import type { MessageKey as AllMessageKeys } from "./messages/messageKeys";

/** 階層型エラーコード。例: "PROJECT.ACCESS.NOT_FOUND" */
export type ErrorCode = AllErrorCode;

export type MessageKey = AllMessageKeys;

/**
 * エラーコード 1 つに対する「振る舞い」の定義。
 * コード（何が起きたか）と、HTTP ステータス・文言・ログレベル（どう扱うか）を分離しておくと、
 * 扱いを変えるときに throw 箇所を触らずに済む。
 */
export interface ErrorDefinition {
	statusCode: ErrorStatusCode;
	messageKey: MessageKey;
	/** ログ・スタックに残す開発者向けメッセージ（ユーザーには見せない） */
	technicalMessage?: string;
	retryable: boolean;
	logLevel: "error" | "warn" | "info";
}

export interface ErrorContext {
	/** メッセージの {placeholder} に埋め込む値。レスポンスの details にもそのまま載る */
	data?: Record<string, unknown>;
	cause?: unknown;
}
