import { ProjectId } from "@/domains/project/valueObjects/projectId";
import {
	GetProjectsQueryDTO,
	type IGetProjectsQueryService,
	type IGetProjectsQueryServiceParams,
	type IGetProjectsQueryServiceResult,
} from "@/domains/queries/getProjectsQueryService";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { Prisma } from "@/infrastructures/shared/clients/databaseClient/prisma/client";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";

/** 一覧の Read 実装。Prisma を直接使い、集約を経由しない */
export class GetProjectsQueryService implements IGetProjectsQueryService {
	constructor(private readonly prisma: IDatabaseClient<PrismaDatabaseClientType>) {}

	async execute(params: IGetProjectsQueryServiceParams): Promise<IGetProjectsQueryServiceResult> {
		const { tenantId, search, page, limit } = params;

		const where: Prisma.ProjectWhereInput = {
			tenantId: tenantId.value,
			deletedAt: null,
			...(search && { name: { contains: search, mode: "insensitive" } }),
		};

		const skip = (page - 1) * limit;
		const totalCount = await this.prisma.client.project.count({ where });
		const rows = await this.prisma.client.project.findMany({
			where,
			skip,
			take: limit,
			// 同じ作成日時のときも順序が安定するよう id で二次ソートする
			orderBy: [{ createdAt: "desc" }, { id: "asc" }],
		});

		const totalPages = Math.ceil(totalCount / Math.max(1, limit));
		return {
			projects: rows.map((row) =>
				GetProjectsQueryDTO.build({
					id: new ProjectId(row.id),
					tenantId: new TenantId(row.tenantId),
					name: row.name,
					description: row.description,
					createdAt: row.createdAt,
					updatedAt: row.updatedAt,
				}),
			),
			pagination: {
				currentPage: page,
				totalPages,
				totalCount,
				hasNext: page < totalPages,
				hasPrevious: page > 1,
			},
		};
	}
}
