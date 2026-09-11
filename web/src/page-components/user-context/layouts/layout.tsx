"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "@/shared/components/loader";
import { Button } from "@/shared/components/ui/button";
import { usePage } from "@/shared/hooks/use-page";
import { deleteCookie, getCookie } from "@/shared/lib/cookie";

/**
 * userContext のレイアウト。認証されていなければサインインへ戻す。
 * Cookie はサーバーレンダリング時に読めないため、マウント後に判定する（それまではローダー）。
 */
export function UserContextLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { page } = usePage();
	const [userId, setUserId] = useState<string | null | undefined>(undefined);

	useEffect(() => {
		const current = getCookie("userId");
		if (!current) {
			router.replace(page.COMMON.SIGN_IN_PAGE.URL());
			return;
		}
		setUserId(current);
	}, [router, page]);

	if (!userId) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader />
			</div>
		);
	}

	const signOut = () => {
		deleteCookie("userId");
		deleteCookie("tenantId");
		router.replace(page.COMMON.SIGN_IN_PAGE.URL());
	};

	return (
		<div className="min-h-screen">
			<div className="flex items-center justify-between border-b border-border bg-muted px-6 py-2 text-xs">
				<span>
					サインイン中: <span className="font-mono">{userId}</span>
				</span>
				<Button variant="outline" onClick={signOut} className="h-7 px-2 text-xs">
					サインアウト
				</Button>
			</div>
			{children}
		</div>
	);
}
