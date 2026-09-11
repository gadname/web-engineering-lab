import type { IMembershipRepository } from "@/domains/membership/repositories/membership";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { UserId } from "@/domains/user/valueObjects/userId";
import { MembershipRepository } from "@/infrastructures/repositories/membership";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import { MEMBERSHIP_ERROR_CODES } from "@/shared/errors/codes/domains/membershipErrors";
import { UsecaseException } from "@/shared/exceptions/usecaseException";
import type { ITenantContextValidator } from "@/shared/middlewares/auth/tenant/strategies/interfaces";
import type { TenantContextPayload } from "@/shared/types/app";

/** ユーザーがテナントに所属しているかを検証し、所属（membershipId）を確定する */
export class TenantContextValidator implements ITenantContextValidator {
	private readonly membershipRepository: IMembershipRepository;

	constructor(membershipRepository?: IMembershipRepository) {
		this.membershipRepository =
			membershipRepository ?? new MembershipRepository(DatabaseClientFactory.create({}).dbClient);
	}

	async validate(userId: UserId, tenantId: TenantId): Promise<TenantContextPayload> {
		const membership = await this.membershipRepository.findByUserIdAndTenantId(userId, tenantId);
		// 不所属は正当な認可失敗（403）。ここで握りつぶして 401/500 にすると本物の障害と区別できなくなる
		if (!membership) {
			throw new UsecaseException(MEMBERSHIP_ERROR_CODES.COMMON.FORBIDDEN, {
				data: { userId: userId.value, tenantId: tenantId.value },
			});
		}
		return { userId: userId.value, tenantId: tenantId.value, membershipId: membership.id.value };
	}
}
