import type { User } from "@/domains/user/user";
import type { UserId } from "@/domains/user/valueObjects/userId";

export interface IUserRepository {
	find(id: UserId): Promise<User | null>;
	unsafeSave(user: User): Promise<void>;
}
