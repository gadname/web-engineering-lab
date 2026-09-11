import path from "node:path";
import { defineConfig } from "vitest/config";

// unit テスト用。DB を使わないテストだけを対象にする
export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/unit/**/*.test.ts"],
	},
	resolve: {
		alias: {
			"@/tests": path.resolve(__dirname, "./tests"),
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
