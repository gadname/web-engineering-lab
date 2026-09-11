import type { IProjectRepository } from "@/domains/project/repositories/project";
import type { ProjectName } from "@/domains/project/valueObjects/projectName";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import { PROJECT_ERROR_CODES } from "@/shared/errors/codes/domains/projectErrors";
import { UsecaseException } from "@/shared/exceptions/usecaseException";

/**
 * テナント内のプロジェクト数の技術的上限。
 * 業務上の上限ではなく、無制限に増えたときの一覧・認可コストを抑えるための安全弁。
 */
export const PROJECT_COUNT_LIMIT = 100;

/**
 * 保存前のビジネスルール検証（集約単体では判定できないもの）。
 * 「名前の重複」「件数上限」は他の行を見ないと分からないため、集約ではなく Guard が Repository を使って検証する。
 */
export class ProjectGuard {
	constructor(private readonly projectRepository: IProjectRepository) {}

	async ensureNameIsUnique(tenantId: TenantId, name: ProjectName): Promise<void> {
		if (await this.projectRepository.existsByTenantIdAndName(tenantId, name)) {
			throw new UsecaseException(PROJECT_ERROR_CODES.VALIDATION.DUPLICATE_NAME, { data: { name: name.value } });
		}
	}

	/** 更新時は、名前が変わるときだけ重複を見る */
	async ensureNameIsUniqueForUpdate(
		tenantId: TenantId,
		newName: ProjectName | undefined,
		currentName: ProjectName,
	): Promise<void> {
		if (newName === undefined || newName.equals(currentName)) return;
		await this.ensureNameIsUnique(tenantId, newName);
	}

	async ensureProjectCountLimit(tenantId: TenantId): Promise<void> {
		const count = await this.projectRepository.countByTenantId(tenantId);
		if (count >= PROJECT_COUNT_LIMIT) {
			throw new UsecaseException(PROJECT_ERROR_CODES.VALIDATION.COUNT_LIMIT_EXCEEDED, {
				data: { limit: PROJECT_COUNT_LIMIT },
			});
		}
	}
}
