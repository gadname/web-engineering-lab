import type { Config } from "tailwindcss";

// 色は CSS 変数で定義し（global.css）、ダークモードは class で切り替える。参考実装と同じ流儀
const config: Config = {
	darkMode: ["class"],
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				background: "rgb(var(--background) / <alpha-value>)",
				foreground: "rgb(var(--foreground) / <alpha-value>)",
				muted: "rgb(var(--muted) / <alpha-value>)",
				"muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
				border: "rgb(var(--border) / <alpha-value>)",
				primary: "rgb(var(--primary) / <alpha-value>)",
				"primary-foreground": "rgb(var(--primary-foreground) / <alpha-value>)",
				destructive: "rgb(var(--destructive) / <alpha-value>)",
				card: "rgb(var(--card) / <alpha-value>)",
			},
		},
	},
	plugins: [],
};

export default config;
