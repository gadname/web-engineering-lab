/**
 * Cookie の読み書き（ブラウザ専用）。
 *
 * 認証中のユーザー ID とテナント ID を Cookie に置くのは、HTTP クライアントのミドルウェアが
 * React の外（fetch 時）で参照するため。React の state だと fetch 関数からは読めない。
 */
export const getCookie = (name: string): string | null => {
	if (typeof document === "undefined") return null;
	const found = document.cookie
		.split("; ")
		.map((pair) => pair.split("="))
		.find(([key]) => key === name);
	return found?.[1] ? decodeURIComponent(found[1]) : null;
};

export const setCookie = (name: string, value: string, options: { path?: string; maxAgeSeconds?: number } = {}) => {
	if (typeof document === "undefined") return;
	const parts = [`${name}=${encodeURIComponent(value)}`, `path=${options.path ?? "/"}`, "SameSite=Lax"];
	if (options.maxAgeSeconds !== undefined) parts.push(`max-age=${options.maxAgeSeconds}`);
	// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API は Safari 未対応のため document.cookie を使う
	document.cookie = parts.join("; ");
};

export const deleteCookie = (name: string) => {
	setCookie(name, "", { maxAgeSeconds: 0 });
};
