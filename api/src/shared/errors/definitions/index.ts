import type { ErrorCode, ErrorDefinition } from "../types";
import { MEMBERSHIP_ERROR_DEFINITIONS } from "./membershipDefinitions";
import { PROJECT_ERROR_DEFINITIONS } from "./projectDefinitions";
import { SYSTEM_ERROR_DEFINITIONS } from "./systemDefinitions";
import { TENANT_ERROR_DEFINITIONS } from "./tenantDefinitions";
import { USER_ERROR_DEFINITIONS } from "./userDefinitions";

// satisfies で「全コードに定義がある」ことをコンパイル時に検査する
const errorDefinitions = {
	...PROJECT_ERROR_DEFINITIONS,
	...MEMBERSHIP_ERROR_DEFINITIONS,
	...TENANT_ERROR_DEFINITIONS,
	...USER_ERROR_DEFINITIONS,
	...SYSTEM_ERROR_DEFINITIONS,
} satisfies Record<ErrorCode, ErrorDefinition>;

export const ERROR_DEFINITIONS: Record<ErrorCode, ErrorDefinition> = errorDefinitions;
