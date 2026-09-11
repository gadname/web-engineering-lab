import { HTTPException } from "hono/http-exception";
import { MIDDLEWARE_ERROR_CODES } from "@/shared/errors/codes/system/middlewareErrors";
import type { ApplicationException } from "@/shared/exceptions/applicationException";

/**
 * エラーレスポンスの形。全経路（例外・未知のエラー・バリデーション）で同じ形にする。
 * クライアントは statusCode ではなく errorCode で分岐する（HTTP ステータスは複数のコードで共有されるため）。
 */
export type ErrorResponseBody = {
	statusCode: number;
	errorCode: string;
	message: string;
	details?: Record<string, unknown>;
};

export const formatApplicationException = (error: ApplicationException): HTTPException => {
	const body: ErrorResponseBody = {
		statusCode: error.statusCode,
		errorCode: error.errorCode,
		message: error.userMessage,
		details: error.meta.data,
	};
	return new HTTPException(error.statusCode, {
		res: Response.json(body, { status: error.statusCode }),
		cause: error.meta.cause,
	});
};

/** 想定外のエラー。内部情報を漏らさないよう固定文言にする */
export const formatUnknownError = (error: unknown): HTTPException => {
	const body: ErrorResponseBody = {
		statusCode: 500,
		errorCode: MIDDLEWARE_ERROR_CODES.COMMON.UNKNOWN_ERROR,
		message: "Internal Server Error",
	};
	return new HTTPException(500, { res: Response.json(body, { status: 500 }), cause: error });
};
