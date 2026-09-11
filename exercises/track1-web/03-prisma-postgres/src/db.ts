import { PrismaClient } from "@/generated/prisma/client";

/**
 * PrismaClient の生成。
 *
 * - 接続先は `DATABASE_URL` 環境変数（schema.prisma の datasource で参照している）
 * - PrismaClient はコネクションプールを内包するので、アプリ全体で 1 つを使い回す（毎回 new しない）
 * - テストでは接続先を差し替えたいので、ファクトリ関数にしておく
 */
export const createPrismaClient = (databaseUrl?: string) =>
	new PrismaClient({
		...(databaseUrl ? { datasourceUrl: databaseUrl } : {}),
		log: process.env.PRISMA_LOG === "1" ? ["query", "warn", "error"] : ["warn", "error"],
	});

export type Db = ReturnType<typeof createPrismaClient>;
