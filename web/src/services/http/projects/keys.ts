/**
 * TanStack Query のキー。`all` を前方一致の親にして階層化する。
 * 作成・削除後は `all` を無効化すれば一覧も詳細もまとめて再取得される。
 */
export const projectsKeys = {
	all: ["projects"] as const,
	getProjects: (query?: Record<string, unknown>) => ["projects", "list", query] as const,
	getProject: (projectId: string) => ["projects", "detail", projectId] as const,
};
