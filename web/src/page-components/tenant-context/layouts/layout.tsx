"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserContextLayout } from "@/page-components/user-context/layouts/layout";
import { Loader } from "@/shared/components/loader";
import { getCookie, setCookie } from "@/shared/lib/cookie";

/**
 * tenantContext のレイアウト。URL の tenantId を Cookie に写す。
 * HTTP クライアントのミドルウェアはこの Cookie を X-Tenant-ID ヘッダに載せる。
 * 写し終わるまで子を描画しないのは、古いテナント ID で API を呼ばないため。
 */
export function TenantContextLayout({ children }: { children: React.ReactNode }) {
	const { tenantId } = useParams<{ tenantId: string }>();
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		if (tenantId && getCookie("tenantId") !== tenantId) {
			setCookie("tenantId", tenantId);
		}
		setIsReady(true);
	}, [tenantId]);

	return <UserContextLayout>{isReady ? children : <Loader className="m-6" />}</UserContextLayout>;
}
