import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Project } from "@/domains/project/project";
import { ProjectDescription } from "@/domains/project/valueObjects/projectDescription";
import { ProjectName } from "@/domains/project/valueObjects/projectName";
import { AllowedAggregation, AllowedId } from "@/domains/shared/authorizers/authorizerResult";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import { ProjectRepository } from "@/infrastructures/repositories/project";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";
import { seedTenantsAndUsers, TEST_TENANT_ID, truncateAll } from "@/tests/integration/helpers/seed";

describe("ProjectRepository (postgres)", () => {
	let dbClient: IDatabaseClient<PrismaDatabaseClientType>;
	let repository: ProjectRepository;
	const tenantId = new TenantId(TEST_TENANT_ID);

	beforeAll(() => {
		dbClient = DatabaseClientFactory.create({}).dbClient;
		repository = new ProjectRepository(dbClient);
	});

	afterAll(async () => {
		await dbClient.disconnect();
	});

	beforeEach(async () => {
		await truncateAll(dbClient);
		await seedTenantsAndUsers(dbClient);
	});

	const build = (name: string) =>
		Project.create({ tenantId, name: new ProjectName(name), description: new ProjectDescription(null) });

	it("save → find → update → delete（論理削除後は find で見えない）", async () => {
		const project = build("Alpha");
		await repository.save(new AllowedAggregation(project));

		const found = await repository.find(project.id);
		expect(found?.name.value).toBe("Alpha");

		await repository.update(new AllowedAggregation(project.update({ name: new ProjectName("Beta") })));
		expect((await repository.find(project.id))?.name.value).toBe("Beta");

		await repository.delete(new AllowedId(project.id));
		expect(await repository.find(project.id)).toBeNull();
		// 行自体は残っている
		const row = await dbClient.client.project.findUnique({ where: { id: project.id.value } });
		expect(row?.deletedAt).not.toBeNull();
	});

	it("countByTenantId / existsByTenantIdAndName は論理削除済みを数えない", async () => {
		const alive = build("Alpha");
		const deleted = build("Gone");
		await repository.unsafeSave(alive);
		await repository.unsafeSave(deleted);
		await repository.unsafeDelete(deleted.id);

		expect(await repository.countByTenantId(tenantId)).toBe(1);
		expect(await repository.existsByTenantIdAndName(tenantId, new ProjectName("Alpha"))).toBe(true);
		expect(await repository.existsByTenantIdAndName(tenantId, new ProjectName("Gone"))).toBe(false);
	});

	it("transaction: 途中で失敗するとロールバックされる", async () => {
		const project = build("Rollback");
		await expect(
			dbClient.transaction(async () => {
				await repository.unsafeSave(project);
				throw new Error("boom");
			}),
		).rejects.toMatchObject({ errorCode: "SYSTEM.DATABASE.TRANSACTION_FAILED" });
		expect(await repository.find(project.id)).toBeNull();
	});
});
