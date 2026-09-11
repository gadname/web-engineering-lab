import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { IProjectTenantContextAuthorizer } from "@/domains/project/authorizers/project";
import type { IProjectRepository } from "@/domains/project/repositories/project";
import { ProjectDescription } from "@/domains/project/valueObjects/projectDescription";
import { ProjectId } from "@/domains/project/valueObjects/projectId";
import { ProjectName } from "@/domains/project/valueObjects/projectName";
import { ProjectGuard } from "@/guards/projectGuard";
import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import { databaseTx } from "@/shared/decorators/transaction";
import { PROJECT_ERROR_CODES } from "@/shared/errors/codes/domains/projectErrors";
import { UsecaseException } from "@/shared/exceptions/usecaseException";
import { type ProjectOutput, toProjectOutput } from "@/usecases/project/shared";

export type UpdateProjectCommand = {
	actorId: string;
	projectId: string;
	name?: string;
	description?: string | null;
};

export class UpdateProjectUsecase {
	private readonly projectGuard: ProjectGuard;

	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly projectAuthorizer: IProjectTenantContextAuthorizer,
		readonly databaseTxManager: IDatabaseTxManager,
	) {
		this.projectGuard = new ProjectGuard(projectRepository);
	}

	@databaseTx
	async execute(command: UpdateProjectCommand): Promise<ProjectOutput> {
		const actorId = new MembershipId(command.actorId);
		const projectId = new ProjectId(command.projectId);

		const current = await this.projectRepository.find(projectId);
		if (!current) {
			throw new UsecaseException(PROJECT_ERROR_CODES.ACCESS.NOT_FOUND);
		}

		const authResult = await this.projectAuthorizer.canUpdate(actorId, current);
		if (!authResult.isAllowed()) {
			throw new UsecaseException(PROJECT_ERROR_CODES.ACCESS.NOT_AUTHORIZED);
		}

		const newName = command.name !== undefined ? new ProjectName(command.name) : undefined;
		const newDescription =
			command.description !== undefined ? new ProjectDescription(command.description) : undefined;

		await this.projectGuard.ensureNameIsUniqueForUpdate(current.tenantId, newName, current.name);

		const updated = current.update({ name: newName, description: newDescription });

		// 変更後の集約に対して改めて認可を取り、その結果だけを Repository に渡す
		const updateAuth = await this.projectAuthorizer.canUpdate(actorId, updated);
		if (!updateAuth.isAllowed()) {
			throw new UsecaseException(PROJECT_ERROR_CODES.ACCESS.NOT_AUTHORIZED);
		}
		await this.projectRepository.update(updateAuth);

		return toProjectOutput(updated);
	}
}
