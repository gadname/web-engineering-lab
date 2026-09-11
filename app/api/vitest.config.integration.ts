import path from "node:path";
import { defineConfig } from "vitest/config";

// 統合テスト用。globalSetup で Testcontainers の PostgreSQL を起動し、migrate deploy してから走らせる。
// unit と config を分けるのは、「Docker が無い環境でも unit は回る」状態を保つため。
export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/integration/**/*.integration.test.ts"],
		globalSetup: ["./tests/integration/helpers/postgresGlobalSetup.ts"],
		// コンテナ起動 + migrate に時間がかかるので長めに
		testTimeout: 60_000,
		hookTimeout: 120_000,
		// 同じ DB を共有するので、ファイル並列は切って直列に流す
		fileParallelism: false,
	},
	resolve: {
		alias: {
			"@/tests": path.resolve(__dirname, "./tests"),
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
