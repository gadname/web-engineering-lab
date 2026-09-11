import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IProjectTenantContextAuthorizer } from "@/domains/project/authorizers/project";
import type { IProjectRepository } from "@/domains/project/repositories/project";
import { AllowedAggregation } from "@/domains/shared/authorizers/authorizerResult";
import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import { buildProject, MEMBERSHIP_ID, PROJECT_ID } from "@/tests/helpers/fixtures";
import { createMockProjectAuthorizer } from "@/tests/helpers/mocks/authorizers";
import { createMockDatabaseTxManager } from "@/tests/helpers/mocks/databaseTxManager";
import { createMockProjectRepository } from "@/tests/helpers/mocks/repositories";
import { setupTestEnvironment } from "@/tests/unit/helpers/setup";
import { UpdateProjectUsecase } from "@/usecases/project/updateProject";

describe("UpdateProjectUsecase", () => {
	setupTestEnvironment();

	let repository: IProjectRepository;
	let authorizer: IProjectTenantContextAuthorizer;
	let txManager: IDatabaseTxManager;
	let usecase: UpdateProjectUsecase;

	beforeEach(() => {
		repository = createMockProjectRepository();
		authorizer = createMockProjectAuthorizer();
		txManager = createMockDatabaseTxManager();
		usecase = new UpdateProjectUsecase(repository, authorizer, txManager);
		vi.mocked(repository.find).mockResolvedValue(buildProject({ name: "Alpha", description: "before" }));
		vi.mocked(authorizer.canUpdate).mockImplementation(async (_a, resource) => new AllowedAggregation(resource));
	});

	it("存在しなければ NOT_FOUND", async () => {
		vi.mocked(repository.find).mockResolvedValue(null);
		await expect(
			usecase.execute({ actorId: MEMBERSHIP_ID, projectId: PROJECT_ID, name: "Beta" }),
		).rejects.toMatchObject({ errorCode: "PROJECT.ACCESS.NOT_FOUND" });
	});

	it("name だけ変更すると description は保たれ、更新後の集約が保存される", async () => {
		const result = await usecase.execute({ actorId: MEMBERSHIP_ID, projectId: PROJECT_ID, name: "Beta" });
		expect(result).toMatchObject({ name: "Beta", description: "before" });
		const saved = vi.mocked(repository.update).mock.calls[0]?.[0];
		expect(saved?.entity.name.value).toBe("Beta");
	});

	it("description: null は「説明を消す」", async () => {
		const result = await usecase.execute({ actorId: MEMBERSHIP_ID, projectId: PROJECT_ID, description: null });
		expect(result.description).toBeNull();
	});

	it("名前が変わらないときは重複チェックをしない", async () => {
		await usecase.execute({ actorId: MEMBERSHIP_ID, projectId: PROJECT_ID, name: "Alpha" });
		expect(repository.existsByTenantIdAndName).not.toHaveBeenCalled();
	});
});
