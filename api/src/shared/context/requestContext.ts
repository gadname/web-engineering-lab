import { AsyncLocalStorage } from "node:async_hooks";

/** リクエスト単位で共有する識別情報。Logger が自動で付与する */
export type RequestContextData = {
	requestId: string;
	httpMethod: string;
	path: string;
	userId?: string;
	tenantId?: string;
	membershipId?: string;
};

const storage = new AsyncLocalStorage<RequestContextData>();

/**
 * AsyncLocalStorage によるリクエストコンテキスト。
 *
 * Node はシングルスレッドで複数リクエストを並行処理するため、「今のリクエストの ID」を
 * 静的変数に持つと別リクエストの値が混ざる。AsyncLocalStorage は非同期の呼び出し鎖ごとに
 * 独立した store を持つので、usecase や repository の深い場所からでも正しい requestId が引ける。
 */
// biome-ignore lint/complexity/noStaticOnlyClass: 静的メソッドのみのユーティリティ
export class RequestContext {
	static run<T>(context: RequestContextData, fn: () => T): T {
		return storage.run(context, fn);
	}

	static get(): RequestContextData | undefined {
		return storage.getStore();
	}

	static setAuthenticatedUser(userId: string): void {
		const store = storage.getStore();
		if (!store) return;
		store.userId = userId;
	}

	static setTenantContext(context: { userId: string; tenantId: string; membershipId: string }): void {
		const store = storage.getStore();
		if (!store) return;
		store.userId = context.userId;
		store.tenantId = context.tenantId;
		store.membershipId = context.membershipId;
	}
}
