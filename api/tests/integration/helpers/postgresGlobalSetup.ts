import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { execa } from "execa";
import type { TestProject } from "vitest/node";

/**
 * 統合テストの globalSetup。
 * 1. Testcontainers で使い捨ての PostgreSQL を起動
 * 2. `prisma migrate deploy` でマイグレーション適用（本番と同じコマンド。dev は使わない）
 * 3. 接続 URL を provide でテストに渡す
 */
let container: StartedPostgreSqlContainer | undefined;

declare module "vitest" {
	export interface ProvidedContext {
		databaseUrl: string;
	}
}

export async function setup(project: TestProject): Promise<void> {
	container = await new PostgreSqlContainer("postgres:16-alpine")
		.withDatabase("taskboard_test")
		.withUsername("postgres")
		.withPassword("postgres")
		.start();

	const databaseUrl = container.getConnectionUri();
	await execa("npx", ["prisma", "migrate", "deploy"], {
		env: { ...process.env, DATABASE_URL: databaseUrl },
		stdio: "inherit",
	});
	project.provide("databaseUrl", databaseUrl);
}

export async function teardown(): Promise<void> {
	await container?.stop();
}
