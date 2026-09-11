import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IProjectTenantContextAuthorizer } from "@/domains/project/authorizers/project";
import type { IProjectRepository } from "@/domains/project/repositories/project";
import { AllowedAggregation, DeniedAggregation } from "@/domains/shared/authorizers/authorizerResult";
import { PROJECT_COUNT_LIMIT } from "@/guards/projectGuard";
import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import { DomainException } from "@/shared/exceptions/domainException";
import { UsecaseException } from "@/shared/exceptions/usecaseException";
import { MEMBERSHIP_ID, TENANT_ID } from "@/tests/helpers/fixtures";
import { createMockProjectAuthorizer } from "@/tests/helpers/mocks/authorizers";
import { createMockDatabaseTxManager } from "@/tests/helpers/mocks/databaseTxManager";
import { createMockProjectRepository } from "@/tests/helpers/mocks/repositories";
import { setupTestEnvironment } from "@/tests/unit/helpers/setup";
import { CreateProjectUsecase } from "@/usecases/project/createProject";

describe("CreateProjectUsecase", () => {
	setupTestEnvironment();

	let repository: IProjectRepository;
	let authorizer: IProjectTenantContextAuthorizer;
	let txManager: IDatabaseTxManager;
	let usecase: CreateProjectUsecase;

	const command = { actorId: MEMBERSHIP_ID, tenantId: TENANT_ID, name: "Alpha", description: "desc" };

	beforeEach(() => {
		repository = createMockProjectRepository();
		authorizer = createMockProjectAuthorizer();
		txManager = createMockDatabaseTxManager();
		usecase = new CreateProjectUsecase(repository, authorizer, txManager);
		vi.mocked(authorizer.canSave).mockImplementation(async (_actor, resource) => new AllowedAggregation(resource));
	});

	it("認可 → Guard → 保存 の順で通り、トランザクション内で実行される", async () => {
		const result = await usecase.execute(command);

		expect(txManager.do).toHaveBeenCalledTimes(1);
		expect(authorizer.canSave).toHaveBeenCalledTimes(1);
		expect(repository.existsByTenantIdAndName).toHaveBeenCalledTimes(1);
		expect(repository.save).toHaveBeenCalledTimes(1);
		expect(result).toMatchObject({ tenantId: TENANT_ID, name: "Alpha", description: "desc" });
	});

	it("認可されなければ NOT_AUTHORIZED で、保存されない", async () => {
		vi.mocked(authorizer.canSave).mockImplementation(async (_actor, resource) => new DeniedAggregation(resource));
		await expect(usecase.execute(command)).rejects.toMatchObject({
			errorCode: "PROJECT.ACCESS.NOT_AUTHORIZED",
		});
		expect(repository.save).not.toHaveBeenCalled();
	});

	it("同名が存在すれば DUPLICATE_NAME（UsecaseException）", async () => {
		vi.mocked(repository.existsByTenantIdAndName).mockResolvedValue(true);
		const error = await usecase.execute(command).catch((e: unknown) => e);
		expect(error).toBeInstanceOf(UsecaseException);
		expect((error as UsecaseException).errorCode).toBe("PROJECT.VALIDATION.DUPLICATE_NAME");
	});

	it("件数上限に達していれば COUNT_LIMIT_EXCEEDED", async () => {
		vi.mocked(repository.countByTenantId).mockResolvedValue(PROJECT_COUNT_LIMIT);
		await expect(usecase.execute(command)).rejects.toMatchObject({
			errorCode: "PROJECT.VALIDATION.COUNT_LIMIT_EXCEEDED",
		});
	});

	it("名前が空なら値オブジェクトの検証で落ちる（DomainException、認可より前）", async () => {
		const error = await usecase.execute({ ...command, name: " " }).catch((e: unknown) => e);
		expect(error).toBeInstanceOf(DomainException);
		expect(authorizer.canSave).not.toHaveBeenCalled();
	});
});
