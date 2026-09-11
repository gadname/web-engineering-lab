import type { DomainValidationErrorCode } from "../codes/domains/validationErrors";
import type { DatabaseErrorCode } from "../codes/system/databaseErrors";
import type { InfrastructureErrorCode } from "../codes/system/infrastructureErrors";
import type { MiddlewareErrorCode } from "../codes/system/middlewareErrors";
import type { RequestValidationErrorCode } from "../codes/validation/requestValidationErrors";
import { MESSAGE_KEYS } from "../messages/messageKeys";
import type { ErrorDefinition } from "../types";

export const SYSTEM_ERROR_DEFINITIONS: Record<
	| DomainValidationErrorCode
	| DatabaseErrorCode
	| InfrastructureErrorCode
	| MiddlewareErrorCode
	| RequestValidationErrorCode,
	ErrorDefinition
> = {
	"VALIDATION.UUID.INVALID_FORMAT": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.VALIDATION.INVALID_UUID,
		retryable: false,
		logLevel: "warn",
	},
	"VALIDATION.REQUEST.UNPROCESSABLE_ENTITY": {
		statusCode: 422,
		messageKey: MESSAGE_KEYS.VALIDATION.INVALID_REQUEST,
		retryable: false,
		logLevel: "warn",
	},
	"SYSTEM.DATABASE.TRANSACTION_FAILED": {
		statusCode: 500,
		messageKey: MESSAGE_KEYS.SYSTEM.TRANSACTION_FAILED,
		retryable: true,
		logLevel: "error",
	},
	"SYSTEM.CONFIG.VALIDATION_FAILED": {
		statusCode: 500,
		messageKey: MESSAGE_KEYS.SYSTEM.CONFIG_INVALID,
		retryable: false,
		logLevel: "error",
	},
	"SYSTEM.CONFIG.NOT_INITIALIZED": {
		statusCode: 500,
		messageKey: MESSAGE_KEYS.SYSTEM.CONFIG_NOT_INITIALIZED,
		retryable: false,
		logLevel: "error",
	},
	"SYSTEM.AUTH.STRATEGY_NOT_IMPLEMENTED": {
		statusCode: 500,
		messageKey: MESSAGE_KEYS.SYSTEM.AUTH_STRATEGY_NOT_IMPLEMENTED,
		retryable: false,
		logLevel: "error",
	},
	"SYSTEM.MIDDLEWARE.UNEXPECTED": {
		statusCode: 500,
		messageKey: MESSAGE_KEYS.SYSTEM.UNEXPECTED,
		retryable: true,
		logLevel: "error",
	},
	"SYSTEM.UNKNOWN_ERROR": {
		statusCode: 500,
		messageKey: MESSAGE_KEYS.SYSTEM.UNEXPECTED,
		retryable: true,
		logLevel: "error",
	},
	"SYSTEM.MIDDLEWARE.TENANT_HEADER_MISSING": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.AUTH.TENANT_HEADER_MISSING,
		retryable: false,
		logLevel: "warn",
	},
	"SYSTEM.MIDDLEWARE.JWT_AUTHENTICATION_FAILED": {
		statusCode: 401,
		messageKey: MESSAGE_KEYS.AUTH.AUTHENTICATION_FAILED,
		retryable: false,
		logLevel: "warn",
	},
};
