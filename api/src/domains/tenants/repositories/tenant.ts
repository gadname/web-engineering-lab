import type { Tenant } from "@/domains/tenants/tenant";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";

export interface ITenantRepository {
	find(id: TenantId): Promise<Tenant | null>;
	unsafeSave(tenant: Tenant): Promise<void>;
}
