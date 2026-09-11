import { DefaultRequestMiddlewareStrategy } from "@/services/shared/clients/httpClient/middlewares/strategies/defaultRequestMiddlewareStrategy";
import { FakeRequestMiddlewareStrategy } from "@/services/shared/clients/httpClient/middlewares/strategies/fakeRequestMiddlewareStrategy";
import type { IRequestMiddlewareStrategy } from "@/services/shared/clients/httpClient/middlewares/strategies/interfaces";
import { getClientEnv } from "@/shared/configs/env";

/** 環境に応じて認証ヘッダの付け方を選ぶ Factory（バックエンドの AuthenticatorFactory と対になる） */
// biome-ignore lint/complexity/noStaticOnlyClass: 参考実装と同じ静的 Factory
export class RequestMiddlewareFactory {
	private static instance: IRequestMiddlewareStrategy | null = null;

	static getStrategy(): IRequestMiddlewareStrategy {
		if (!RequestMiddlewareFactory.instance) {
			const useFake = getClientEnv().NEXT_PUBLIC_ENV === "local";
			RequestMiddlewareFactory.instance = useFake
				? new FakeRequestMiddlewareStrategy()
				: new DefaultRequestMiddlewareStrategy();
		}
		return RequestMiddlewareFactory.instance;
	}

	static resetInstance(): void {
		RequestMiddlewareFactory.instance = null;
	}
}
