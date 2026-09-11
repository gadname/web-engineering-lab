/**
 * 画面の URL 定義。ページ遷移はここで定義した URL 関数だけを使い、文字列リテラルを散らさない。
 * ルートを変えるときの変更箇所を 1 か所にするため。
 */
export type Page = {
	COMMON: {
		SIGN_IN_PAGE: { URL: () => string };
	};
	USER_CONTEXT: {
		USER_TENANTS_PAGE: { URL: (props: { userId: string }) => string; label: string };
	};
	TENANT_CONTEXT: {
		PROJECTS_PAGE: { URL: (props: { tenantId: string }) => string; label: string };
	};
};

export const useProvidePage = (): Page => ({
	COMMON: {
		SIGN_IN_PAGE: { URL: () => "/sign-in" },
	},
	USER_CONTEXT: {
		USER_TENANTS_PAGE: { URL: ({ userId }) => `/users/${userId}/tenants`, label: "テナント一覧" },
	},
	TENANT_CONTEXT: {
		PROJECTS_PAGE: { URL: ({ tenantId }) => `/tenants/${tenantId}/projects`, label: "プロジェクト" },
	},
});
