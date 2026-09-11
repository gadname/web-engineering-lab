// ルート層（リクエストの形）のバリデーション
export const REQUEST_VALIDATION_ERROR_CODES = {
	UNPROCESSABLE_ENTITY: "VALIDATION.REQUEST.UNPROCESSABLE_ENTITY",
} as const;

export type RequestValidationErrorCode =
	(typeof REQUEST_VALIDATION_ERROR_CODES)[keyof typeof REQUEST_VALIDATION_ERROR_CODES];
