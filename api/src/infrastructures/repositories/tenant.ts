import type { ITenantRepository } from "@/domains/tenants/repositories/tenant";
import { Tenant } from "@/domains/tenants/tenant";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import { TenantName } from "@/domains/tenants/valueObjects/tenantName";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";

export class TenantRepository implements ITenantRepository {
	constructor(private readonly prisma: IDatabaseClient<PrismaDatabaseClientType>) {}

	async find(id: TenantId): Promise<Tenant | null> {
		const row = await this.prisma.client.tenant.findUnique({ where: { id: id.value } });
		if (!row) return null;
		return Tenant.reconstruct({ id: new TenantId(row.id), name: new TenantName(row.name) });
	}

	async unsafeSave(tenant: Tenant): Promise<void> {
		await this.prisma.client.tenant.create({ data: { id: tenant.id.value, name: tenant.name.value } });
	}
}
