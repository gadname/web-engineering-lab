import type { MembershipErrorCode } from "../codes/domains/membershipErrors";
import { MESSAGE_KEYS } from "../messages/messageKeys";
import type { ErrorDefinition } from "../types";

export const MEMBERSHIP_ERROR_DEFINITIONS: Record<MembershipErrorCode, ErrorDefinition> = {
	"MEMBERSHIP.COMMON.NOT_FOUND": {
		statusCode: 404,
		messageKey: MESSAGE_KEYS.BUSINESS.MEMBERSHIP_NOT_FOUND,
		retryable: false,
		logLevel: "warn",
	},
	// テナント不所属は「認証済みだが権限が無い」なので 403
	"MEMBERSHIP.COMMON.FORBIDDEN": {
		statusCode: 403,
		messageKey: MESSAGE_KEYS.AUTH.PERMISSION_DENIED,
		retryable: false,
		logLevel: "warn",
	},
	"MEMBERSHIP.VALIDATION.INVALID_ROLE": {
		statusCode: 400,
		messageKey: MESSAGE_KEYS.BUSINESS.MEMBERSHIP_INVALID_ROLE,
		retryable: false,
		logLevel: "warn",
	},
};
