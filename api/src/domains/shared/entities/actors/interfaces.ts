import type { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { MembershipRole } from "@/domains/membership/valueObjects/membershipRole";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { UserId } from "@/domains/user/valueObjects/userId";

export type ActorIdType = UserId | MembershipId;

/**
 * 操作者（Actor）。認可ルールが参照する「誰が操作しているか」の最小表現。
 * 集約（User / Membership）を丸ごと渡さず、認可に要る項目だけを持つ。
 */
export interface IActor<Id extends ActorIdType> {
	get id(): Id;
	isUser(): this is IUserActor;
	isMembership(): this is IMembershipActor;
}

export interface IUserActor extends IActor<UserId> {}

export interface IMembershipActor extends IActor<MembershipId> {
	get role(): MembershipRole;
	get tenantId(): TenantId;
	hasAnyMembershipRoles(roles: MembershipRole[]): boolean;
}
