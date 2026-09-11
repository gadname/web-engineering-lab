"use client";

import { useCallback } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { StructuredApiError } from "@/services/shared/exceptions/structuredApiError";
import { useToast } from "@/shared/hooks/use-toast";

const DOMAIN_ERROR_TITLE = "リクエストエラー";
const UNEXPECTED_ERROR_TITLE = "エラーが発生しました";
const UNEXPECTED_ERROR_DESCRIPTION = "時間をおいて再度お試しください";

export type HandleErrorOptions<T extends FieldValues> = {
	/** サーバー側のバリデーションエラーを入力欄に反映させたいときに渡す */
	form?: UseFormReturn<T>;
	/** 失敗した操作を表す文言。toast の title に使う */
	fallbackTitle?: string;
};

/**
 * mutation の失敗を「どこに出すか」に振り分ける共通処理。
 *   - バリデーション（422）+ form あり → 該当フィールドにエラー表示
 *   - 認証（401）→ 認証エラーの toast
 *   - システム（5xx）→ システムエラーの toast
 *   - それ以外のドメインエラー → サーバーの文言をそのまま toast
 *   - 解釈不能 → 固定文言の toast（黙って失敗させない）
 */
export function useErrorHandler() {
	const { showErrorToast } = useToast();

	const handleError = useCallback(
		<T extends FieldValues>(error: unknown, options?: HandleErrorOptions<T>) => {
			const { form, fallbackTitle } = options ?? {};

			if (error instanceof StructuredApiError) {
				if (error.isValidationError() && form) {
					const fieldErrors = error.getFieldErrors();
					if (fieldErrors.length > 0) {
						for (const fieldError of fieldErrors) {
							form.setError(fieldError.field as Path<T>, { message: fieldError.message });
						}
						return;
					}
				}
				if (error.isAuthenticationError()) {
					showErrorToast({ title: "認証エラー", description: error.message });
					return;
				}
				if (error.isSystemError()) {
					showErrorToast({ title: "システムエラー", description: error.message });
					return;
				}
				showErrorToast({ title: fallbackTitle ?? DOMAIN_ERROR_TITLE, description: error.message });
				return;
			}

			console.error("An unexpected error occurred:", error);
			showErrorToast({
				title: fallbackTitle ?? UNEXPECTED_ERROR_TITLE,
				description: UNEXPECTED_ERROR_DESCRIPTION,
			});
		},
		[showErrorToast]
	);

	return { handleError };
}
