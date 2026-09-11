import type { Project } from "@/domains/project/project";
import type { ProjectName } from "@/domains/project/valueObjects/projectName";
import type { IRepository } from "@/domains/shared/repositories/repository";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";

/**
 * Project の永続化契約。インターフェースはドメイン層、実装（Prisma）はインフラ層。
 * `find` は論理削除済みを返さない。削除済みを見たい導線ができたら `findWithDeleted` を別に切る。
 */
export interface IProjectRepository extends IRepository<Project> {
	countByTenantId(tenantId: TenantId): Promise<number>;
	existsByTenantIdAndName(tenantId: TenantId, name: ProjectName): Promise<boolean>;
}
