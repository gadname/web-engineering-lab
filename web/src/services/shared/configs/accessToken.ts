/**
 * 本番向けのアクセストークン置き場（IdP 連携時に実装する）。
 * ローカルでは FakeRequestMiddlewareStrategy が Cookie の userId を使うため、ここは空のままでよい。
 */
// biome-ignore lint/complexity/noStaticOnlyClass: 参考実装と同じ静的アクセサ
export class AccessToken {
	private static token: string | null = null;

	static set(token: string | null): void {
		AccessToken.token = token;
	}

	static get(): string | null {
		return AccessToken.token;
	}

	static exists(): boolean {
		return AccessToken.token !== null;
	}
}
