export const MESSAGE_KEYS = {
	AUTH: {
		AUTHENTICATION_FAILED: "auth.authenticationFailed",
		PERMISSION_DENIED: "auth.permissionDenied",
		TENANT_HEADER_MISSING: "auth.tenantHeaderMissing",
	},
	BUSINESS: {
		PROJECT_NOT_FOUND: "business.project.notFound",
		PROJECT_NAME_EMPTY: "business.project.nameEmpty",
		PROJECT_NAME_TOO_LONG: "business.project.nameTooLong",
		PROJECT_DESCRIPTION_TOO_LONG: "business.project.descriptionTooLong",
		PROJECT_DUPLICATE_NAME: "business.project.duplicateName",
		PROJECT_COUNT_LIMIT_EXCEEDED: "business.project.countLimitExceeded",
		PROJECT_ALREADY_DELETED: "business.project.alreadyDeleted",
		MEMBERSHIP_NOT_FOUND: "business.membership.notFound",
		MEMBERSHIP_INVALID_ROLE: "business.membership.invalidRole",
		TENANT_NOT_FOUND: "business.tenant.notFound",
		TENANT_NAME_EMPTY: "business.tenant.nameEmpty",
		TENANT_NAME_TOO_LONG: "business.tenant.nameTooLong",
		USER_NOT_FOUND: "business.user.notFound",
		USER_ID_EMPTY: "business.user.idEmpty",
		USER_INVALID_EMAIL: "business.user.invalidEmail",
	},
	VALIDATION: {
		INVALID_REQUEST: "validation.invalidRequest",
		INVALID_UUID: "validation.invalidUuid",
	},
	SYSTEM: {
		UNEXPECTED: "system.unexpected",
		CONFIG_INVALID: "system.configInvalid",
		CONFIG_NOT_INITIALIZED: "system.configNotInitialized",
		AUTH_STRATEGY_NOT_IMPLEMENTED: "system.authStrategyNotImplemented",
		TRANSACTION_FAILED: "system.transactionFailed",
	},
} as const;

type Leaves<T> = T extends string ? T : { [K in keyof T]: Leaves<T[K]> }[keyof T];
export type MessageKey = Leaves<typeof MESSAGE_KEYS>;
