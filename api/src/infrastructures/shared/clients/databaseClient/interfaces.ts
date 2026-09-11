/**
 * DB クライアントの抽象。Repository はこの型にだけ依存する。
 * `client` はトランザクション内なら TransactionClient、外なら通常のクライアントを返す（呼び出し側は意識しない）。
 */
export type IDatabaseClient<TClient> = {
	get client(): TClient;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	transaction<T>(cb: () => Promise<T>): Promise<T>;
};

export type IDatabaseTxManager = {
	do<T>(cb: () => Promise<T>): Promise<T>;
};
