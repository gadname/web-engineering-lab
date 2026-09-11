import type { IAuthorizationRule } from "@/authorizers/shared/rules/interfaces";
import { MembershipRole } from "@/domains/membership/valueObjects/membershipRole";
import type { ActorIdType, IActor } from "@/domains/shared/entities/actors/interfaces";

/** ADMIN または MEMBER ロールか（GUEST は書き込み不可） */
export class AdminOrMemberRoleRule implements IAuthorizationRule {
	public constructor(private readonly actor: IActor<ActorIdType>) {}

	public async ok(): Promise<boolean> {
		return (
			this.actor.isMembership() && this.actor.hasAnyMembershipRoles([MembershipRole.ADMIN, MembershipRole.MEMBER])
		);
	}
}
