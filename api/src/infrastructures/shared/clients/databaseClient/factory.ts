import type { IDatabaseClient, IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import {
	PrismaDatabaseClient,
	type PrismaDatabaseClientType,
} from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseClient";
import { PrismaDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/prismaDatabaseTxManager";

/** DB クライアントとトランザクションマネージャの組を作る Factory。省略時は Prisma 実装 */
// biome-ignore lint/complexity/noStaticOnlyClass: 静的メソッドのみの Factory
export class DatabaseClientFactory {
	static create(props: { dbClient?: IDatabaseClient<PrismaDatabaseClientType>; txManager?: IDatabaseTxManager }): {
		dbClient: IDatabaseClient<PrismaDatabaseClientType>;
		txManager: IDatabaseTxManager;
	} {
		const dbClient = props.dbClient ?? new PrismaDatabaseClient();
		const txManager = props.txManager ?? new PrismaDatabaseTxManager(dbClient);
		return { dbClient, txManager };
	}
}
