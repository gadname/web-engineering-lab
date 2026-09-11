import path from "node:path";
import { defineConfig } from "vitest/config";

// unit テスト用。DB や外部サービスを使わないテストだけを対象にする（Docker が無くても回る）。
export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/unit/**/*.test.ts"],
		coverage: {
			// 規約テストの対象と同じく、ビジネスルールが集まる層だけを計測対象にする
			include: ["src/domains/**/*", "src/authorizers/**/*", "src/usecases/**/*"],
			reporter: ["text"],
		},
	},
	resolve: {
		alias: {
			"@/tests": path.resolve(__dirname, "./tests"),
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
