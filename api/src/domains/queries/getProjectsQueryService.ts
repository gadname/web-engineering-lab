import type { ProjectId } from "@/domains/project/valueObjects/projectId";
import type { IQueryServiceTenantContextAuthorizer } from "@/domains/shared/authorizers/queryServiceAuthorizer";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";

/**
 * 一覧取得の Read Model（CQRS の Q 側）。
 *
 * 一覧は集約を復元せず、表示に要る項目だけを DTO として返す。
 * 集約（Project）は「変更のための形」、DTO は「表示のための形」で、両者を混ぜない。
 * 認可のため tenantId は必ず持つ。
 */
export class GetProjectsQueryDTO {
	private constructor(
		public readonly id: ProjectId,
		public readonly tenantId: TenantId,
		public readonly name: string,
		public readonly description: string | null,
		public readonly createdAt: Date,
		public readonly updatedAt: Date,
	) {}

	public static build(props: {
		id: ProjectId;
		tenantId: TenantId;
		name: string;
		description: string | null;
		createdAt: Date;
		updatedAt: Date;
	}): GetProjectsQueryDTO {
		return new GetProjectsQueryDTO(
			props.id,
			props.tenantId,
			props.name,
			props.description,
			props.createdAt,
			props.updatedAt,
		);
	}
}

export interface IGetProjectsQueryServiceParams {
	tenantId: TenantId;
	search?: string;
	page: number;
	limit: number;
}

export interface IGetProjectsQueryServiceResult {
	projects: GetProjectsQueryDTO[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
}

export interface IGetProjectsQueryService {
	execute(params: IGetProjectsQueryServiceParams): Promise<IGetProjectsQueryServiceResult>;
}

export interface IGetProjectsQueryServiceAuthorizer extends IQueryServiceTenantContextAuthorizer<GetProjectsQueryDTO> {}
