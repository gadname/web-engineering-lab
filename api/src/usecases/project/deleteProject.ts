import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { IProjectTenantContextAuthorizer } from "@/domains/project/authorizers/project";
import type { IProjectRepository } from "@/domains/project/repositories/project";
import { ProjectId } from "@/domains/project/valueObjects/projectId";
import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import { databaseTx } from "@/shared/decorators/transaction";
import { PROJECT_ERROR_CODES } from "@/shared/errors/codes/domains/projectErrors";
import { UsecaseException } from "@/shared/exceptions/usecaseException";

export type DeleteProjectCommand = {
	actorId: string;
	projectId: string;
};

export class DeleteProjectUsecase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly projectAuthorizer: IProjectTenantContextAuthorizer,
		readonly databaseTxManager: IDatabaseTxManager,
	) {}

	@databaseTx
	async execute(command: DeleteProjectCommand): Promise<void> {
		const actorId = new MembershipId(command.actorId);
		const projectId = new ProjectId(command.projectId);

		const project = await this.projectRepository.find(projectId);
		if (!project) {
			throw new UsecaseException(PROJECT_ERROR_CODES.ACCESS.NOT_FOUND);
		}

		const authResult = await this.projectAuthorizer.canDelete(actorId, project);
		if (!authResult.isAllowed()) {
			throw new UsecaseException(PROJECT_ERROR_CODES.ACCESS.NOT_AUTHORIZED);
		}

		// 集約に削除の可否（既に削除済みか）を判定させてから、論理削除を永続化する
		project.delete();
		await this.projectRepository.delete(authResult);
	}
}
