import { Membership } from "@/domains/membership/membership";
import type { IMembershipRepository } from "@/domains/membership/repositories/membership";
import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import { MembershipRole } from "@/domains/membership/valueObjects/membershipRole";
import { MembershipActor } from "@/domains/shared/entities/actors/actor";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import { UserId } from "@/domains/user/valueObjects/userId";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { Membership as PrismaMembership } from "@/infrastructures/shared/clients/databaseClient/prisma/client";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";

export class MembershipRepository implements IMembershipRepository {
	constructor(private readonly prisma: IDatabaseClient<PrismaDatabaseClientType>) {}

	async find(id: MembershipId): Promise<Membership | null> {
		const row = await this.prisma.client.membership.findUnique({ where: { id: id.value } });
		return row ? this.toMembership(row) : null;
	}

	async findActorById(id: MembershipId): Promise<MembershipActor | null> {
		// 認可用。集約を復元せず、必要な列だけ引く
		const row = await this.prisma.client.membership.findUnique({
			where: { id: id.value },
			select: { id: true, role: true, tenantId: true },
		});
		if (!row) return null;
		return new MembershipActor(new MembershipId(row.id), new MembershipRole(row.role), new TenantId(row.tenantId));
	}

	async findByUserIdAndTenantId(userId: UserId, tenantId: TenantId): Promise<Membership | null> {
		const row = await this.prisma.client.membership.findUnique({
			where: { userId_tenantId: { userId: userId.value, tenantId: tenantId.value } },
		});
		return row ? this.toMembership(row) : null;
	}

	async findManyByUserId(userId: UserId): Promise<Membership[]> {
		const rows = await this.prisma.client.membership.findMany({
			where: { userId: userId.value },
			orderBy: { createdAt: "asc" },
		});
		return rows.map((row) => this.toMembership(row));
	}

	async unsafeSave(membership: Membership): Promise<void> {
		await this.prisma.client.membership.create({
			data: {
				id: membership.id.value,
				userId: membership.userId.value,
				tenantId: membership.tenantId.value,
				role: membership.role.value,
			},
		});
	}

	private toMembership(row: PrismaMembership): Membership {
		return Membership.reconstruct({
			id: new MembershipId(row.id),
			userId: new UserId(row.userId),
			tenantId: new TenantId(row.tenantId),
			role: new MembershipRole(row.role),
		});
	}
}
