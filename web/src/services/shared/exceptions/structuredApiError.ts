import type { BackendErrorResponse } from "@/services/shared/types/error";

const SYSTEM_PREFIXES: ReadonlySet<string> = new Set(["SYSTEM", "DATABASE", "INFRASTRUCTURE"]);

/**
 * バックエンドの構造化エラー。errorCode の先頭（領域）で扱いを分ける。
 * HTTP ステータスではなく errorCode で分岐するのは、同じ 4xx でもユーザーへの見せ方が違うため。
 */
export class StructuredApiError extends Error {
	public readonly statusCode: number;
	public readonly errorCode: string;
	public readonly details?: Record<string, unknown>;
	public readonly response: Response;

	constructor(errorData: BackendErrorResponse, response: Response) {
		super(errorData.message);
		this.name = "StructuredApiError";
		this.statusCode = errorData.statusCode;
		this.errorCode = errorData.errorCode;
		this.details = errorData.details;
		this.response = response;
	}

	isAuthenticationError(): boolean {
		return this.statusCode === 401;
	}

	isSystemError(): boolean {
		return SYSTEM_PREFIXES.has(this.errorCode.split(".")[0] ?? "");
	}

	/** リクエストの形の誤り（422）。details.issues に項目ごとの内容が入る */
	isValidationError(): boolean {
		return this.errorCode.startsWith("VALIDATION.");
	}

	getFieldErrors(): { field: string; message: string }[] {
		const issues = this.details?.issues;
		if (!Array.isArray(issues)) return [];
		return issues
			.filter((i): i is { path: string; message: string } => typeof i === "object" && i !== null && "path" in i)
			.map((i) => ({ field: i.path, message: i.message }));
	}
}
