import type { ProjectErrorCode } from "../codes/domains/projectErrors";
import { MESSAGE_KEYS } from "../messages/messageKeys";
import type { ErrorDefinition } from "../types";

export const PROJECT_ERROR_DEFINITIONS: Record<ProjectErrorCode, ErrorDefinition> = {
	"PROJECT.ACCESS.NOT_FOUND": {
		statusCode: 404,
		messageKey: MESSAGE_KEYS.BUSINESS.PROJECT_NOT_FOUND,
		retryable: false,
		logLevel: "warn",
	},
	"PROJECT.ACCESS.NOT_AUTHORIZED": {
		statusCode: 403,
		messageKey: MESSAGE_KEYS.AUTH.PERMISSION_DENIED,
		retryable: false,
		logLevel: "warn",
	},
	"PROJECT.VALIDATION.NAME_EMPTY": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.PROJECT_NAME_EMPTY,
		retryable: false,
		logLevel: "warn",
	},
	"PROJECT.VALIDATION.NAME_TOO_LONG": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.PROJECT_NAME_TOO_LONG,
		retryable: false,
		logLevel: "warn",
	},
	"PROJECT.VALIDATION.DESCRIPTION_TOO_LONG": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.PROJECT_DESCRIPTION_TOO_LONG,
		retryable: false,
		logLevel: "warn",
	},
	"PROJECT.VALIDATION.DUPLICATE_NAME": {
		statusCode: 409,
		messageKey: MESSAGE_KEYS.BUSINESS.PROJECT_DUPLICATE_NAME,
		retryable: false,
		logLevel: "warn",
	},
	"PROJECT.VALIDATION.COUNT_LIMIT_EXCEEDED": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.PROJECT_COUNT_LIMIT_EXCEEDED,
		retryable: false,
		logLevel: "info",
	},
	"PROJECT.VALIDATION.ALREADY_DELETED": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.PROJECT_ALREADY_DELETED,
		retryable: false,
		logLevel: "warn",
	},
};
