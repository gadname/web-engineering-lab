import type { Metadata } from "next";
import type React from "react";
import { PageProvider } from "@/shared/providers/page-provider";
import { TanStackProvider } from "@/shared/providers/tanstack-provider";
import { ToastProvider } from "@/shared/providers/toast-provider";
import "@/app/global.css";

export const metadata: Metadata = {
	title: "taskboard",
	description: "マルチテナントのタスク管理（学習用）",
};

/**
 * Provider の入れ子順には意味がある:
 *   TanStack（データ取得）→ Page（URL 定義）→ Toast（通知）。
 * 内側は外側に依存できるが逆はできない。
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="ja">
			<body className="min-h-screen bg-background text-foreground">
				<TanStackProvider>
					<PageProvider>
						<ToastProvider>{children}</ToastProvider>
					</PageProvider>
				</TanStackProvider>
			</body>
		</html>
	);
}
