import { HTTPException } from "hono/http-exception";
import { formatApplicationException, formatUnknownError } from "@/shared/errors/errorResponseFormatter";
import { ApplicationException } from "@/shared/exceptions/applicationException";
import { Logger } from "@/shared/logger/logger";

/**
 * app.onError に渡す一括エラー処理。
 * ルートやユースケースは try/catch せず throw するだけでよい。ここで 3 経路に振り分ける:
 *   1. ApplicationException → 定義に従った 4xx/5xx（ログレベルも定義から）
 *   2. HTTPException（Hono や bearerAuth が投げる整形済みのもの）→ そのまま
 *   3. それ以外 → 500 固定文言（内部情報を漏らさない）
 */
// Hono の Context を型引数付きで受けると呼び出し側の Entry 型ごとに合わなくなるため、使う項目だけを構造的に受ける
export const handleOnErrorMiddleware = (error: Error, c?: { req: { path: string } }): Response => {
	if (error instanceof ApplicationException) {
		Logger[error.getLogLevel()](`[${error.getCategory()}] ${error.errorCode}`, error);
		return formatApplicationException(error).getResponse();
	}

	if (error instanceof HTTPException) {
		Logger.warn("[HTTP_EXCEPTION]", { status: error.status, message: error.message, path: c?.req.path });
		return error.getResponse();
	}

	Logger.error("[UNKNOWN_ERROR] Internal Server Error", error);
	return formatUnknownError(error).getResponse();
};
