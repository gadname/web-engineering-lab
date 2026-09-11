import type { IMembershipRepository } from "@/domains/membership/repositories/membership";
import type { MembershipRoleType } from "@/domains/membership/valueObjects/membershipRole";
import type { IUserRepository } from "@/domains/user/repositories/user";
import { UserId } from "@/domains/user/valueObjects/userId";
import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import { databaseTx } from "@/shared/decorators/transaction";
import { USER_ERROR_CODES } from "@/shared/errors/codes/domains/userErrors";
import { UsecaseException } from "@/shared/exceptions/usecaseException";

export type GetMeCommand = {
	actorId: string;
};

export type GetMeOutput = {
	id: string;
	emailAddress: string;
	name: string;
	memberships: { membershipId: string; tenantId: string; role: MembershipRoleType }[];
};

/**
 * userContext のユースケース。操作者は UserId で、テナント認可を経由しない。
 * 自分の所属一覧を返すので、認可は「自分自身のリソース」であることで満たされる。
 */
export class GetMeUsecase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly membershipRepository: IMembershipRepository,
		readonly databaseTxManager: IDatabaseTxManager,
	) {}

	@databaseTx
	async execute(command: GetMeCommand): Promise<GetMeOutput> {
		const userId = new UserId(command.actorId);
		const user = await this.userRepository.find(userId);
		if (!user) {
			throw new UsecaseException(USER_ERROR_CODES.COMMON.NOT_FOUND);
		}
		const memberships = await this.membershipRepository.findManyByUserId(userId);
		return {
			id: user.id.value,
			emailAddress: user.emailAddress.value,
			name: user.name,
			memberships: memberships.map((m) => ({
				membershipId: m.id.value,
				tenantId: m.tenantId.value,
				role: m.role.value,
			})),
		};
	}
}
