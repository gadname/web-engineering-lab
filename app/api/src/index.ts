import { serve } from "@hono/node-server";
import { createApp } from "@/app";
import { loadConfig } from "@/config";
import { createPrismaClient } from "@/db";
import { PrismaProjectRepository } from "@/repositories/projectRepository";

/**
 * エントリポイント。設定を検証し、本番用の依存（Prisma）を組み立てて起動する。
 * graceful shutdown・keep-alive の調整は Track 3-03 で追加する。
 */
const config = loadConfig();
const db = createPrismaClient(config.DATABASE_URL);
const app = createApp({ projectRepository: new PrismaProjectRepository(db) });

serve({ fetch: app.fetch, port: config.PORT }, (info) => {
	console.log(`taskboard api listening on http://localhost:${info.port}`);
	console.log(`  spec:    http://localhost:${info.port}/api/doc`);
	console.log(`  swagger: http://localhost:${info.port}/api/swagger`);
});
