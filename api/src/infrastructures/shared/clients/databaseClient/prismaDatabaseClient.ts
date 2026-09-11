import { AsyncLocalStorage } from "node:async_hooks";
import type { IDatabaseClient } from "@/infrastructures/shared/clients/databaseClient/interfaces";
import { type Prisma, PrismaClient } from "@/infrastructures/shared/clients/databaseClient/prisma/client";
import { AppConfig } from "@/shared/config/appConfig";
import { DATABASE_ERROR_CODES } from "@/shared/errors/codes/system/databaseErrors";
import { ApplicationException } from "@/shared/exceptions/applicationException";
import { DomainException } from "@/shared/exceptions/domainException";
import { UsecaseException } from "@/shared/exceptions/usecaseException";
import { Logger } from "@/shared/logger/logger";

const SLOW_QUERY_THRESHOLD_MS = 500;

export type PrismaDatabaseClientType = PrismaClient | Prisma.TransactionClient;

// PrismaClient はコネクションプールを内包するので、プロセスで 1 つを共有する
let prisma: PrismaClient | null = null;

// トランザクション中のクライアントを、非同期の呼び出し鎖に沿って伝搬する（RequestContext と同じ仕組み）
const txStorage = new AsyncLocalStorage<Prisma.TransactionClient>();

/**
 * Prisma のラッパー。
 *
 * Repository は `dbClient.client` を使うだけで、トランザクション内なら自動的に TransactionClient になる。
 * トランザクションの開始はユースケース（@databaseTx）が行い、Repository はトランザクションの有無を知らない。
 * ネストした transaction 呼び出しは外側を再利用する（二重 $transaction によるデッドロック防止）。
 */
export class PrismaDatabaseClient implements IDatabaseClient<PrismaDatabaseClientType> {
	private readonly _prisma: PrismaClient;

	constructor() {
		if (prisma === null) {
			const client = new PrismaClient({
				datasourceUrl: AppConfig.getInstance().get("DATABASE_URL"),
				log: [
					{ emit: "event", level: "warn" },
					{ emit: "event", level: "error" },
					{ emit: "event", level: "query" },
				],
			});
			client.$on("warn", (e) => Logger.warn("Prisma warning", { message: e.message }));
			client.$on("error", (e) => Logger.warn("Prisma error event", { message: e.message, target: e.target }));
			client.$on("query", (e) => {
				if (e.duration > SLOW_QUERY_THRESHOLD_MS) {
					Logger.warn("Slow query detected", {
						query: e.query,
						duration: e.duration,
						// バインド値は PII を含みうるので debug のときだけ
						...(Logger.isDebugEnabled() && { params: e.params }),
					});
				}
			});
			prisma = client;
		}
		this._prisma = prisma;
	}

	get client(): PrismaDatabaseClientType {
		return txStorage.getStore() ?? this._prisma;
	}

	async connect(): Promise<void> {
		await this._prisma.$connect();
	}

	async disconnect(): Promise<void> {
		await this._prisma.$disconnect();
		prisma = null;
	}

	async transaction<T>(cb: () => Promise<T>): Promise<T> {
		if (txStorage.getStore()) {
			Logger.debug("Transaction reused (nested call)");
			return await cb();
		}

		return await this._prisma.$transaction(async (txClient) => {
			Logger.debug("Transaction started");
			try {
				return await txStorage.run(txClient, cb);
			} catch (error) {
				// ドメイン例外はそのまま透過。それ以外はユースケース層の失敗として包む
				// （InfrastructureException にすると、ユースケース由来の 4xx が全て 5xx になってしまう）
				if (error instanceof DomainException) throw error;
				if (error instanceof ApplicationException) {
					throw new UsecaseException(error.errorCode, { cause: error, data: error.meta.data });
				}
				throw new UsecaseException(DATABASE_ERROR_CODES.TRANSACTION.FAILED, { cause: error });
			} finally {
				Logger.debug("Transaction finished");
			}
		});
	}
}
