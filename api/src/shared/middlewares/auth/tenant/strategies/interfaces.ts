import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { UserId } from "@/domains/user/valueObjects/userId";
import type { TenantContextPayload } from "@/shared/types/app";

export interface ITenantContextValidator {
	validate(userId: UserId, tenantId: TenantId): Promise<TenantContextPayload>;
}
