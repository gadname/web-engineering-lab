import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { app } from "@/app";
import { DatabaseClientFactory } from "@/infrastructures/shared/clients/databaseClient/factory";
import { AppConfig } from "@/shared/config/appConfig";
import { Logger } from "@/shared/logger/logger";

/**
 * エントリポイント。設定検証 → サーバ起動 → シグナルでの graceful shutdown。
 * app.ts と分けているのは、テストが app.request() でポートを開かずに叩けるようにするため。
 */
const config = AppConfig.initialize();
Logger.initBase({ level: config.get("LOG_LEVEL") });

const port = config.get("PORT");
const server = serve({ fetch: app.fetch, port });
Logger.info("Server started", { port, env: config.get("ENV"), nodeVersion: process.version });

// ロードバランサ（ALB 等）の idle timeout より長くする。
// バックエンドが先に idle 接続を閉じると、LB が再利用した接続で 502 になる。
const httpServer = server as HttpServer;
httpServer.keepAliveTimeout = 65 * 1000;
httpServer.headersTimeout = 66 * 1000;

let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
	if (isShuttingDown) return;
	isShuttingDown = true;
	Logger.info(`${signal} received, starting graceful shutdown`);

	// コンテナ基盤の stopTimeout（ECS 既定 30 秒）より短く切り上げ、SIGKILL 前に自分で終わる
	const forceExit = setTimeout(() => {
		Logger.warn("Shutdown timeout reached, forcing exit");
		process.exit(1);
	}, 25_000);

	try {
		// 1. 新規接続を止め、処理中のリクエストを待つ
		await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
		Logger.info("HTTP server closed");
		// 2. DB 接続を閉じる
		await DatabaseClientFactory.create({}).dbClient.disconnect();
		Logger.info("Database connection closed");
		clearTimeout(forceExit);
		process.exit(0);
	} catch (error) {
		Logger.error("Error during graceful shutdown", error instanceof Error ? error : new Error(String(error)));
		clearTimeout(forceExit);
		process.exit(1);
	}
};

process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.once("SIGINT", () => gracefulShutdown("SIGINT"));
