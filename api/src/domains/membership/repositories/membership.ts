import type { Membership } from "@/domains/membership/membership";
import type { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { MembershipActor } from "@/domains/shared/entities/actors/actor";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { UserId } from "@/domains/user/valueObjects/userId";

export interface IMembershipRepository {
	find(id: MembershipId): Promise<Membership | null>;
	/**
	 * 認可のために、所属を操作者（Actor）として取得する。
	 * 認可は操作のたびに走るので、集約を復元せず「ロールとテナント」だけを引く軽い取得口を分けている。
	 */
	findActorById(id: MembershipId): Promise<MembershipActor | null>;
	findByUserIdAndTenantId(userId: UserId, tenantId: TenantId): Promise<Membership | null>;
	findManyByUserId(userId: UserId): Promise<Membership[]>;
	unsafeSave(membership: Membership): Promise<void>;
}
