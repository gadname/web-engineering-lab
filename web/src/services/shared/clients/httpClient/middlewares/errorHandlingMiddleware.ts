import type { Middleware } from "openapi-fetch";
import { FetchError } from "@/services/shared/exceptions/fetchError";
import { StructuredApiError } from "@/services/shared/exceptions/structuredApiError";
import { isBackendErrorResponse } from "@/services/shared/types/error";

/**
 * 非 2xx を例外に変換する。
 * openapi-fetch は既定で { data, error } を返し throw しないが、TanStack Query の error / onError に
 * 乗せるには throw のほうが扱いやすい。構造化エラーは StructuredApiError、それ以外は FetchError。
 */
export const errorHandlingMiddleware: Middleware = {
	async onResponse({ response }) {
		if (response.ok) return response;

		let body: unknown;
		try {
			body = await response.clone().json();
		} catch {
			throw new FetchError(`HTTP error ${response.status}`, response);
		}
		if (isBackendErrorResponse(body)) {
			throw new StructuredApiError(body, response);
		}
		throw new FetchError(`HTTP error ${response.status}`, response);
	},
};
