"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

/**
 * TanStack Query の QueryClient を提供する。
 * useState で 1 度だけ生成するのは、再レンダーのたびにキャッシュを捨てないため。
 * モジュールスコープの定数にしないのは、サーバー側でリクエスト間にキャッシュが共有されるのを防ぐため。
 */
export function TanStackProvider(props: { children: React.ReactNode }) {
	const [queryClient] = React.useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// 画面のフォーカス切替のたびに再取得しない（学習中はネットワークが見づらくなるため）
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			})
	);

	return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
}
