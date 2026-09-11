import path from "node:path";
import { defineConfig } from "vitest/config";

// 統合テスト用。globalSetup で Testcontainers の PostgreSQL を起動し、migrate deploy してから走らせる。
// unit と config を分けるのは「Docker が無い環境でも unit は回る」状態を保つため。
export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/integration/**/*.integration.test.ts"],
		globalSetup: ["./tests/integration/helpers/postgresGlobalSetup.ts"],
		setupFiles: ["./tests/integration/helpers/vitestSetup.ts"],
		testTimeout: 60_000,
		hookTimeout: 120_000,
		// PrismaClient はプロセス内シングルトンで DATABASE_URL を固定するため、ファイル並列は切って直列に流す
		fileParallelism: false,
	},
	resolve: {
		alias: {
			"@/tests": path.resolve(__dirname, "./tests"),
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
