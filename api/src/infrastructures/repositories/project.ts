import { Project } from "@/domains/project/project";
import type { IProjectRepository } from "@/domains/project/repositories/project";
import { ProjectDescription } from "@/domains/project/valueObjects/projectDescription";
import { ProjectId } from "@/domains/project/valueObjects/projectId";
import { ProjectName } from "@/domains/project/valueObjects/projectName";
import type { AllowedAggregation, AllowedId } from "@/domains/shared/authorizers/authorizerResult";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { Project as PrismaProject } from "@/infrastructures/shared/clients/databaseClient/prisma/client";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";

/**
 * Project の Prisma 実装。
 * 認可付きメソッド（save / update / delete）は unsafe* に委譲するだけ。認可の証明は型で担保済み。
 */
export class ProjectRepository implements IProjectRepository {
	constructor(private readonly prisma: IDatabaseClient<PrismaDatabaseClientType>) {}

	async find(id: ProjectId): Promise<Project | null> {
		const row = await this.prisma.client.project.findUnique({ where: { id: id.value } });
		if (!row || row.deletedAt) return null; // 論理削除済みは「存在しない」
		return this.toProject(row);
	}

	async save(entity: AllowedAggregation<Project>): Promise<void> {
		await this.unsafeSave(entity.entity);
	}

	async update(entity: AllowedAggregation<Project>): Promise<void> {
		await this.unsafeUpdate(entity.entity);
	}

	async delete(id: AllowedId<ProjectId>): Promise<void> {
		await this.unsafeDelete(id.value);
	}

	async unsafeSave(project: Project): Promise<void> {
		await this.prisma.client.project.create({
			data: {
				id: project.id.value,
				tenantId: project.tenantId.value,
				name: project.name.value,
				description: project.description.value,
				deletedAt: project.deletedAt,
			},
		});
	}

	async unsafeUpdate(project: Project): Promise<void> {
		await this.prisma.client.project.update({
			where: { id: project.id.value },
			data: {
				name: project.name.value,
				description: project.description.value,
				deletedAt: project.deletedAt,
			},
		});
	}

	/** 論理削除。行は残す（将来の参照を壊さない） */
	async unsafeDelete(id: ProjectId): Promise<void> {
		await this.prisma.client.project.update({
			where: { id: id.value },
			data: { deletedAt: new Date() },
		});
	}

	async countByTenantId(tenantId: TenantId): Promise<number> {
		return await this.prisma.client.project.count({ where: { tenantId: tenantId.value, deletedAt: null } });
	}

	async existsByTenantIdAndName(tenantId: TenantId, name: ProjectName): Promise<boolean> {
		const found = await this.prisma.client.project.findFirst({
			where: { tenantId: tenantId.value, name: name.value, deletedAt: null },
			select: { id: true },
		});
		return found !== null;
	}

	private toProject(row: PrismaProject): Project {
		return Project.reconstruct({
			id: new ProjectId(row.id),
			tenantId: new TenantId(row.tenantId),
			name: new ProjectName(row.name),
			description: new ProjectDescription(row.description),
			deletedAt: row.deletedAt,
		});
	}
}
