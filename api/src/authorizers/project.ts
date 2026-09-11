import type { IActorResolver } from "@/authorizers/shared/resolvers/interfaces";
import { AuthorizationRuleGroup } from "@/authorizers/shared/rules/authorizationRuleGroup";
import { AdminOrMemberRoleRule } from "@/authorizers/shared/rules/tenantContext/adminOrMemberRoleRule";
import { TenantAffiliationRule } from "@/authorizers/shared/rules/tenantContext/tenantAffiliationRule";
import type { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { IProjectTenantContextAuthorizer } from "@/domains/project/authorizers/project";
import type { Project } from "@/domains/project/project";
import type { ProjectId } from "@/domains/project/valueObjects/projectId";
import {
	type AggregationAuthResult,
	AllowedAggregation,
	AllowedId,
	DeniedAggregation,
	DeniedId,
	type IdAuthResult,
} from "@/domains/shared/authorizers/authorizerResult";

/**
 * Project の認可。
 * - 読み取り: テナント所属者なら誰でも
 * - 書き込み: テナント所属者 かつ ADMIN / MEMBER
 */
export class ProjectAuthorizer implements IProjectTenantContextAuthorizer {
	public constructor(private readonly actorResolver: IActorResolver) {}

	async canSave(actorId: MembershipId, resource: Project): Promise<AggregationAuthResult<Project>> {
		return this.authorizeWrite(actorId, resource);
	}

	async canFind(actorId: MembershipId, resource: Project): Promise<AggregationAuthResult<Project>> {
		const actor = await this.actorResolver.resolve(actorId);
		const rule = AuthorizationRuleGroup.or(new TenantAffiliationRule(actor, resource.tenantId));
		return (await rule.ok()) ? new AllowedAggregation(resource) : new DeniedAggregation(resource);
	}

	async canUpdate(actorId: MembershipId, resource: Project): Promise<AggregationAuthResult<Project>> {
		return this.authorizeWrite(actorId, resource);
	}

	async canDelete(actorId: MembershipId, resource: Project): Promise<IdAuthResult<ProjectId>> {
		const result = await this.authorizeWrite(actorId, resource);
		return result.isAllowed() ? new AllowedId(resource.id) : new DeniedId(resource.id);
	}

	private async authorizeWrite(actorId: MembershipId, resource: Project): Promise<AggregationAuthResult<Project>> {
		const actor = await this.actorResolver.resolve(actorId);
		const rule = AuthorizationRuleGroup.and(
			new TenantAffiliationRule(actor, resource.tenantId),
			new AdminOrMemberRoleRule(actor),
		);
		return (await rule.ok()) ? new AllowedAggregation(resource) : new DeniedAggregation(resource);
	}
}
