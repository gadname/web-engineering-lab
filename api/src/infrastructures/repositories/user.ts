import { EmailAddress } from "@/domains/shared/valueObjects/emailAddress";
import type { IUserRepository } from "@/domains/user/repositories/user";
import { User } from "@/domains/user/user";
import { UserId } from "@/domains/user/valueObjects/userId";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";

export class UserRepository implements IUserRepository {
	constructor(private readonly prisma: IDatabaseClient<PrismaDatabaseClientType>) {}

	async find(id: UserId): Promise<User | null> {
		const row = await this.prisma.client.user.findUnique({ where: { id: id.value } });
		if (!row) return null;
		return User.reconstruct({
			id: new UserId(row.id),
			emailAddress: new EmailAddress(row.emailAddress),
			name: row.name,
		});
	}

	async unsafeSave(user: User): Promise<void> {
		await this.prisma.client.user.create({
			data: { id: user.id.value, emailAddress: user.emailAddress.value, name: user.name },
		});
	}
}
