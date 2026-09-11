import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { IProjectTenantContextAuthorizer } from "@/domains/project/authorizers/project";
import type { IProjectRepository } from "@/domains/project/repositories/project";
import { ProjectId } from "@/domains/project/valueObjects/projectId";
import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import { databaseTx } from "@/shared/decorators/transaction";
import { PROJECT_ERROR_CODES } from "@/shared/errors/codes/domains/projectErrors";
import { UsecaseException } from "@/shared/exceptions/usecaseException";
import { type ProjectOutput, toProjectOutput } from "@/usecases/project/shared";

export type GetProjectCommand = {
	actorId: string;
	projectId: string;
};

export class GetProjectUsecase {
	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly projectAuthorizer: IProjectTenantContextAuthorizer,
		readonly databaseTxManager: IDatabaseTxManager,
	) {}

	@databaseTx
	async execute(command: GetProjectCommand): Promise<ProjectOutput> {
		const actorId = new MembershipId(command.actorId);
		const projectId = new ProjectId(command.projectId);

		const project = await this.projectRepository.find(projectId);
		if (!project) {
			throw new UsecaseException(PROJECT_ERROR_CODES.ACCESS.NOT_FOUND);
		}

		// 別テナントのリソースは「存在しない」と同じ扱いに縮退させる（存在の推測を許さない）
		const authResult = await this.projectAuthorizer.canFind(actorId, project);
		if (!authResult.isAllowed()) {
			throw new UsecaseException(PROJECT_ERROR_CODES.ACCESS.NOT_FOUND);
		}

		return toProjectOutput(authResult.entity);
	}
}
