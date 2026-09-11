import type { IActorResolver } from "@/authorizers/shared/resolvers/interfaces";
import { AuthorizationRuleGroup } from "@/authorizers/shared/rules/authorizationRuleGroup";
import { TenantAffiliationRule } from "@/authorizers/shared/rules/tenantContext/tenantAffiliationRule";
import type { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type {
	GetProjectsQueryDTO,
	IGetProjectsQueryServiceAuthorizer,
} from "@/domains/queries/getProjectsQueryService";

/**
 * 一覧（DTO）の認可。Actor の解決は 1 回、判定はユニークな tenantId ごとに 1 回だけ行う。
 */
export class GetProjectsQueryServiceAuthorizer implements IGetProjectsQueryServiceAuthorizer {
	constructor(private readonly actorResolver: IActorResolver) {}

	async canFindMany(
		actorId: MembershipId,
		dtos: GetProjectsQueryDTO[],
	): Promise<{ allowed: GetProjectsQueryDTO[]; denied: GetProjectsQueryDTO[] }> {
		if (dtos.length === 0) return { allowed: [], denied: [] };

		const actor = await this.actorResolver.resolve(actorId);
		const tenantIdsByValue = new Map(dtos.map((d) => [d.tenantId.value, d.tenantId]));
		const results = new Map<string, boolean>();
		for (const tenantId of tenantIdsByValue.values()) {
			const rule = AuthorizationRuleGroup.or(new TenantAffiliationRule(actor, tenantId));
			results.set(tenantId.value, await rule.ok());
		}

		const allowed: GetProjectsQueryDTO[] = [];
		const denied: GetProjectsQueryDTO[] = [];
		for (const dto of dtos) (results.get(dto.tenantId.value) ? allowed : denied).push(dto);
		return { allowed, denied };
	}
}
