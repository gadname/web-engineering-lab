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
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import { AppConfig } from "@/shared/config/appConfig";
import { Logger } from "@/shared/logger/logger";

/**
 * ローカル用の初期データ。固定 ID にしているのは、curl / Swagger からそのまま使えるようにするため。
 *   ユーザー:  dev-user（ADMIN） / dev-guest（GUEST）
 *   テナント:  00000000-0000-4000-8000-000000000001
 * 認可を通さない unsafeSave を使う（シードは「システムによる投入」で操作者がいない）。
 */
const TENANT_ID = "00000000-0000-4000-8000-000000000001";

const main = async () => {
	AppConfig.initialize();
	Logger.initBase({ level: "info" });
	const { dbClient } = DatabaseClientFactory.create({});
	const users = new UserRepository(dbClient);
	const tenants = new TenantRepository(dbClient);
	const memberships = new MembershipRepository(dbClient);

	const tenantId = new TenantId(TENANT_ID);
	if (await tenants.find(tenantId)) {
		Logger.info("Seed already applied, skipping");
		await dbClient.disconnect();
		return;
	}

	await tenants.unsafeSave(Tenant.reconstruct({ id: tenantId, name: new TenantName("Dev Tenant") }));

	const admin = User.reconstruct({
		id: new UserId("dev-user"),
		emailAddress: new EmailAddress("dev-user@example.com"),
		name: "Dev User",
	});
	const guest = User.reconstruct({
		id: new UserId("dev-guest"),
		emailAddress: new EmailAddress("dev-guest@example.com"),
		name: "Dev Guest",
	});
	await users.unsafeSave(admin);
	await users.unsafeSave(guest);

	await memberships.unsafeSave(Membership.create({ userId: admin.id, tenantId, role: MembershipRole.ADMIN }));
	await memberships.unsafeSave(Membership.create({ userId: guest.id, tenantId, role: MembershipRole.GUEST }));

	Logger.info("Seed applied", { tenantId: TENANT_ID, users: ["dev-user", "dev-guest"] });
	await dbClient.disconnect();
};

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
