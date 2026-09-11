import type { IActorResolver } from "@/authorizers/shared/resolvers/interfaces";
import type { IMembershipRepository } from "@/domains/membership/repositories/membership";
import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import { UserActor } from "@/domains/shared/entities/actors/actor";
import type { ActorIdType, IActor } from "@/domains/shared/entities/actors/interfaces";
import type { IUserRepository } from "@/domains/user/repositories/user";
import { MEMBERSHIP_ERROR_CODES } from "@/shared/errors/codes/domains/membershipErrors";
import { USER_ERROR_CODES } from "@/shared/errors/codes/domains/userErrors";
import { UsecaseException } from "@/shared/exceptions/usecaseException";

/** 操作者 ID から Actor（認可に必要な情報だけを持つ表現）を解決する */
export class ActorResolver implements IActorResolver {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly membershipRepository: IMembershipRepository,
	) {}

	async resolve(actorId: ActorIdType): Promise<IActor<ActorIdType>> {
		if (actorId instanceof MembershipId) {
			const actor = await this.membershipRepository.findActorById(actorId);
			if (!actor) throw new UsecaseException(MEMBERSHIP_ERROR_CODES.COMMON.NOT_FOUND);
			return actor;
		}
		const user = await this.userRepository.find(actorId);
		if (!user) throw new UsecaseException(USER_ERROR_CODES.COMMON.NOT_FOUND);
		return new UserActor(actorId);
	}
}
