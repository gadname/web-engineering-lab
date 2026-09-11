import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type {
	IGetProjectsQueryService,
	IGetProjectsQueryServiceAuthorizer,
} from "@/domains/queries/getProjectsQueryService";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import { databaseTx } from "@/shared/decorators/transaction";

export type GetProjectsCommand = {
	actorId: string;
	tenantId: string;
	search?: string;
	page?: number;
	limit?: number;
};

export type GetProjectsOutput = {
	projects: {
		id: string;
		name: string;
		description: string | null;
		createdAt: string;
		updatedAt: string;
	}[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** 一覧は QueryService（Read Model）を使う。Repository で集約を復元しない */
export class GetProjectsUsecase {
	constructor(
		private readonly queryServiceAuthorizer: IGetProjectsQueryServiceAuthorizer,
		private readonly queryService: IGetProjectsQueryService,
		readonly databaseTxManager: IDatabaseTxManager,
	) {}

	@databaseTx
	async execute(command: GetProjectsCommand): Promise<GetProjectsOutput> {
		const actorId = new MembershipId(command.actorId);
		const tenantId = new TenantId(command.tenantId);

		const result = await this.queryService.execute({
			tenantId,
			search: command.search,
			page: Math.max(1, command.page ?? DEFAULT_PAGE),
			limit: Math.min(MAX_LIMIT, Math.max(1, command.limit ?? DEFAULT_LIMIT)),
		});

		// テナントで絞った後でも認可は省略しない（絞り込み条件の変更で漏れる事故を二重に防ぐ）
		const { allowed } = await this.queryServiceAuthorizer.canFindMany(actorId, result.projects);

		return {
			projects: allowed.map((dto) => ({
				id: dto.id.value,
				name: dto.name,
				description: dto.description,
				createdAt: dto.createdAt.toISOString(),
				updatedAt: dto.updatedAt.toISOString(),
			})),
			pagination: result.pagination,
		};
	}
}
