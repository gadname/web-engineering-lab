import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		include: ["tests/unit/**/*.test.{ts,tsx}"],
		setupFiles: ["./tests/setup.ts"],
		env: {
			// 日付の解釈に依存するテストの決定性のため JST 固定
			TZ: "Asia/Tokyo",
		},
	},
	resolve: {
		alias: {
			"@/tests": path.resolve(__dirname, "./tests"),
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
