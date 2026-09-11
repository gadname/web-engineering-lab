import type { UserErrorCode } from "../codes/domains/userErrors";
import { MESSAGE_KEYS } from "../messages/messageKeys";
import type { ErrorDefinition } from "../types";

export const USER_ERROR_DEFINITIONS: Record<UserErrorCode, ErrorDefinition> = {
	"USER.COMMON.NOT_FOUND": {
		statusCode: 404,
		messageKey: MESSAGE_KEYS.BUSINESS.USER_NOT_FOUND,
		retryable: false,
		logLevel: "warn",
	},
	"USER.VALIDATION.ID_EMPTY": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.USER_ID_EMPTY,
		retryable: false,
		logLevel: "warn",
	},
	"USER.VALIDATION.INVALID_EMAIL": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.USER_INVALID_EMAIL,
		retryable: false,
		logLevel: "warn",
	},
};
