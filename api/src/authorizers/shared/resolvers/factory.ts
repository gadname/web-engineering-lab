import { ActorResolver } from "@/authorizers/shared/resolvers/actorResolver";
import type { IActorResolver } from "@/authorizers/shared/resolvers/interfaces";
import type { IMembershipRepository } from "@/domains/membership/repositories/membership";
import type { IUserRepository } from "@/domains/user/repositories/user";
import { MembershipRepository } from "@/infrastructures/repositories/membership";
import { UserRepository } from "@/infrastructures/repositories/user";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";

/**
 * DI コンテナ的 Factory。
 * 全ての依存をオプショナルにし、省略されたものはデフォルト実装（Prisma）を組み立てる。
 * 本番は `create({})`、テストはモックを渡す。トランザクションを共有したい場合は dbClient を渡す。
 */
// biome-ignore lint/complexity/noStaticOnlyClass: 静的メソッドのみの Factory
export class ActorResolverFactory {
	static create(props: {
		dbClient?: IDatabaseClient<PrismaDatabaseClientType>;
		userRepository?: IUserRepository;
		membershipRepository?: IMembershipRepository;
	}): IActorResolver {
		const dbClient = props.dbClient ?? DatabaseClientFactory.create({}).dbClient;
		return new ActorResolver(
			props.userRepository ?? new UserRepository(dbClient),
			props.membershipRepository ?? new MembershipRepository(dbClient),
		);
	}
}
