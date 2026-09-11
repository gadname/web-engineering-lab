import type { TenantErrorCode } from "../codes/domains/tenantErrors";
import { MESSAGE_KEYS } from "../messages/messageKeys";
import type { ErrorDefinition } from "../types";

export const TENANT_ERROR_DEFINITIONS: Record<TenantErrorCode, ErrorDefinition> = {
	"TENANT.COMMON.NOT_FOUND": {
		statusCode: 404,
		messageKey: MESSAGE_KEYS.BUSINESS.TENANT_NOT_FOUND,
		retryable: false,
		logLevel: "warn",
	},
	"TENANT.VALIDATION.NAME_EMPTY": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.TENANT_NAME_EMPTY,
		retryable: false,
		logLevel: "warn",
	},
	"TENANT.VALIDATION.NAME_TOO_LONG": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.TENANT_NAME_TOO_LONG,
		retryable: false,
		logLevel: "warn",
	},
};
