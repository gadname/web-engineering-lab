// ドメイン層の汎用バリデーション（特定の集約に属さないもの）
export const VALIDATION_ERROR_CODES = {
	UUID: {
		INVALID_FORMAT: "VALIDATION.UUID.INVALID_FORMAT",
	},
} as const;

export type DomainValidationErrorCode = (typeof VALIDATION_ERROR_CODES.UUID)[keyof typeof VALIDATION_ERROR_CODES.UUID];
