import type { IDatabaseClient, IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import type { PrismaDatabaseClientType } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";

export class PrismaDatabaseTxManager implements IDatabaseTxManager {
	constructor(private readonly dbClient: IDatabaseClient<PrismaDatabaseClientType>) {}

	async do<T>(cb: () => Promise<T>): Promise<T> {
		return await this.dbClient.transaction(cb);
	}
}
