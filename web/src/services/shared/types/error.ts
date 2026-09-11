/**
 * バックエンド（api / ai）が返すエラーレスポンスの形。
 * 両バックエンドが同じ形を返すので、フロントは 1 つの型で扱える。
 */
export type BackendErrorResponse = {
	statusCode: number;
	errorCode: string; // 例: "PROJECT.ACCESS.NOT_FOUND"
	message: string; // ユーザー向け文言
	details?: Record<string, unknown>;
};

export const isBackendErrorResponse = (obj: unknown): obj is BackendErrorResponse =>
	typeof obj === "object" &&
	obj !== null &&
	"statusCode" in obj &&
	typeof (obj as BackendErrorResponse).statusCode === "number" &&
	"errorCode" in obj &&
	typeof (obj as BackendErrorResponse).errorCode === "string" &&
	"message" in obj &&
	typeof (obj as BackendErrorResponse).message === "string";
