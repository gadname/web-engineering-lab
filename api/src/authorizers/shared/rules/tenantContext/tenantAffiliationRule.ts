import type { IAuthorizationRule } from "@/authorizers/shared/rules/interfaces";
import type { ActorIdType, IActor } from "@/domains/shared/entities/actors/interfaces";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";

/** 操作者がリソースのテナントに所属しているか */
export class TenantAffiliationRule implements IAuthorizationRule {
	public constructor(
		private readonly actor: IActor<ActorIdType>,
		private readonly tenantId: TenantId,
	) {}

	public async ok(): Promise<boolean> {
		return this.actor.isMembership() && this.actor.tenantId.equals(this.tenantId);
	}
}
