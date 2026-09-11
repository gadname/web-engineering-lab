/**
 * Hono のコンテキスト変数（c.get / c.set）の型。
 *
 * - ApplicationEntry: 全ルート共通（requestId、JWT 認証後のペイロード）
 * - TenantApplicationEntry: テナント認可（tenantAuthMiddleware）を通過したルート専用
 *
 * ルートの型引数にこれを与えると、ミドルウェアが set していない変数を get しようとした時点でコンパイルエラーになる。
 */
export type ApplicationEntry = {
	Variables: CommonVariables;
};

export type TenantApplicationEntry = {
	Variables: TenantContextVariables;
};

export type CommonVariables = {
	requestId: string;
	authJWTPayload: AuthJWTPayload;
};

export type TenantContextVariables = CommonVariables & {
	tenantContextPayload: TenantContextPayload;
};

/** JWT 認証で確定する「誰か」 */
export type AuthJWTPayload = {
	userId: string;
};

/** テナント認可で確定する「どのテナントの、どの所属として操作しているか」 */
export type TenantContextPayload = {
	userId: string;
	tenantId: string;
	membershipId: string;
};

export const LogLevel = {
	debug: "debug",
	info: "info",
	warn: "warn",
	error: "error",
} as const;
export type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel];

export const Env = {
	local: "local",
	test: "test",
	dev: "dev",
	stg: "stg",
	prod: "prod",
} as const;
export type EnvType = (typeof Env)[keyof typeof Env];
