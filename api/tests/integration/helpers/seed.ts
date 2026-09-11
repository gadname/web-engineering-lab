import { Membership } from "@/domains/membership/membership";
import { MembershipRole } from "@/domains/membership/valueObjects/membershipRole";
import { EmailAddress } from "@/domains/shared/valueObjects/emailAddress";
import { Tenant } from "@/domains/tenants/tenant";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import { TenantName } from "@/domains/tenants/valueObjects/tenantName";
import { User } from "@/domains/user/user";
import { UserId } from "@/domains/user/valueObjects/userId";
import { MembershipRepository } from "@/infrastructures/repositories/membership";
import { TenantRepository } from "@/infrastructures/repositories/tenant";
import { UserRepository } from "@/infrastructures/repositories/user";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";

export const TEST_TENANT_ID = "00000000-0000-4000-8000-0000000000a1";
export const OTHER_TENANT_ID = "00000000-0000-4000-8000-0000000000a2";

/** テナント 2 つ、ユーザー 3 人（admin / guest / 別テナントの admin）を作る */
export const seedTenantsAndUsers = async (dbClient: IDatabaseClient<PrismaDatabaseClientType>) => {
	const users = new UserRepository(dbClient);
	const tenants = new TenantRepository(dbClient);
	const memberships = new MembershipRepository(dbClient);

	const tenantId = new TenantId(TEST_TENANT_ID);
	const otherTenantId = new TenantId(OTHER_TENANT_ID);
	await tenants.unsafeSave(Tenant.reconstruct({ id: tenantId, name: new TenantName("Tenant A") }));
	await tenants.unsafeSave(Tenant.reconstruct({ id: otherTenantId, name: new TenantName("Tenant B") }));

	const define = async (id: string, tenant: TenantId, role: MembershipRole) => {
		const user = User.reconstruct({
			id: new UserId(id),
			emailAddress: new EmailAddress(`${id}@example.com`),
			name: id,
		});
		await users.unsafeSave(user);
		const membership = Membership.create({ userId: user.id, tenantId: tenant, role });
		await memberships.unsafeSave(membership);
		return { userId: id, membershipId: membership.id.value };
	};

	return {
		admin: await define("admin", tenantId, MembershipRole.ADMIN),
		guest: await define("guest", tenantId, MembershipRole.GUEST),
		otherAdmin: await define("other-admin", otherTenantId, MembershipRole.ADMIN),
	};
};

export const truncateAll = async (dbClient: IDatabaseClient<PrismaDatabaseClientType>) => {
	await dbClient.client.$executeRawUnsafe('TRUNCATE TABLE "projects", "memberships", "users", "tenants" CASCADE');
};
