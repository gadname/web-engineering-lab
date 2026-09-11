import type { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { MembershipRole } from "@/domains/membership/valueObjects/membershipRole";
import type { IMembershipActor, IUserActor } from "@/domains/shared/entities/actors/interfaces";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { UserId } from "@/domains/user/valueObjects/userId";

export class UserActor implements IUserActor {
	constructor(private readonly _userId: UserId) {}
	isUser(): this is IUserActor {
		return true;
	}
	isMembership(): this is IMembershipActor {
		return false;
	}
	get id(): UserId {
		return this._userId;
	}
}

export class MembershipActor implements IMembershipActor {
	constructor(
		private readonly _membershipId: MembershipId,
		private readonly _role: MembershipRole,
		private readonly _tenantId: TenantId,
	) {}
	isUser(): this is IUserActor {
		return false;
	}
	isMembership(): this is IMembershipActor {
		return true;
	}
	get id(): MembershipId {
		return this._membershipId;
	}
	get role(): MembershipRole {
		return this._role;
	}
	get tenantId(): TenantId {
		return this._tenantId;
	}
	public hasAnyMembershipRoles(roles: MembershipRole[]): boolean {
		return roles.some((role) => this._role.equals(role));
	}
}
