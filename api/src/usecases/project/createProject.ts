import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { IProjectTenantContextAuthorizer } from "@/domains/project/authorizers/project";
import { Project } from "@/domains/project/project";
import type { IProjectRepository } from "@/domains/project/repositories/project";
import { ProjectDescription } from "@/domains/project/valueObjects/projectDescription";
import { ProjectName } from "@/domains/project/valueObjects/projectName";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import { ProjectGuard } from "@/guards/projectGuard";
import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import { databaseTx } from "@/shared/decorators/transaction";
import { PROJECT_ERROR_CODES } from "@/shared/errors/codes/domains/projectErrors";
import { UsecaseException } from "@/shared/exceptions/usecaseException";
import { Logger } from "@/shared/logger/logger";
import { type ProjectOutput, toProjectOutput } from "@/usecases/project/shared";

export type CreateProjectCommand = {
	actorId: string;
	tenantId: string;
	name: string;
	description?: string | null;
};

/**
 * ユースケースの標準的な流れ:
 *   1. コマンド（プリミティブ）を値オブジェクトに変換する（ここで形式エラーは DomainException）
 *   2. 集約を組み立てる
 *   3. 認可（Authorizer）
 *   4. 集約単体では判定できない業務ルール（Guard）
 *   5. 保存（認可済みの集約しか渡せない）
 * 全体は @databaseTx で 1 トランザクション。
 */
export class CreateProjectUsecase {
	private readonly projectGuard: ProjectGuard;

	constructor(
		private readonly projectRepository: IProjectRepository,
		private readonly projectAuthorizer: IProjectTenantContextAuthorizer,
		readonly databaseTxManager: IDatabaseTxManager,
	) {
		this.projectGuard = new ProjectGuard(projectRepository);
	}

	@databaseTx
	async execute(command: CreateProjectCommand): Promise<ProjectOutput> {
		const actorId = new MembershipId(command.actorId);
		const tenantId = new TenantId(command.tenantId);

		const project = Project.create({
			tenantId,
			name: new ProjectName(command.name),
			description: new ProjectDescription(command.description ?? null),
		});

		Logger.info("Authorize project creation");
		const authResult = await this.projectAuthorizer.canSave(actorId, project);
		if (!authResult.isAllowed()) {
			throw new UsecaseException(PROJECT_ERROR_CODES.ACCESS.NOT_AUTHORIZED);
		}

		Logger.info("Validate business rules");
		await this.projectGuard.ensureProjectCountLimit(tenantId);
		await this.projectGuard.ensureNameIsUnique(tenantId, project.name);

		Logger.info("Save project");
		await this.projectRepository.save(authResult);

		return toProjectOutput(project);
	}
}
