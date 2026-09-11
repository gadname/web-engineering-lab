import type { ActorIdType, IActor } from "@/domains/shared/entities/actors/interfaces";

export interface IActorResolver {
	resolve(actorId: ActorIdType): Promise<IActor<ActorIdType>>;
}
