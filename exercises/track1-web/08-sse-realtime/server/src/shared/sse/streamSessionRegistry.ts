/**
 * 実行中ストリームの登録簿（module-level singleton）。
 *
 * streamId → AbortController を保持し、別リクエスト（stop API）からストリームを中断できるようにする。
 *
 * ## 制約
 * in-memory Map なので **単一プロセスでしか動かない**。複数インスタンスに水平展開すると、
 * stop を受けたインスタンスと stream を持つインスタンスが別になり、abort が届かない。
 *
 * ## 水平展開するときの選択肢
 * AbortController はプロセス内のオブジェクトで永続化できない。「セッションの永続化」ではなく「分散シグナリング」として設計する。
 * - Redis Pub/Sub: stop を受けた側が publish、stream 側が subscribe して abort。即時。Redis の運用が要る
 * - 共有ストア（DB / DynamoDB）のポーリング: stop で status を書き、stream 側がチャンク送信の合間に読む。数百 ms の遅延。追加インフラ不要
 */
const sessions = new Map<string, AbortController>();

export const streamSessionRegistry = {
	/** 発行済みの streamId で登録する（started イベントで FE に通知する id と揃えるため） */
	register(streamId: string, controller: AbortController): void {
		sessions.set(streamId, controller);
	},

	/** @returns 登録があれば abort して true。無ければ false（既に終了 / 未知の id） */
	abort(streamId: string): boolean {
		const controller = sessions.get(streamId);
		if (!controller) return false;
		controller.abort(new Error("Stopped by request"));
		sessions.delete(streamId);
		return true;
	},

	remove(streamId: string): void {
		sessions.delete(streamId);
	},

	size(): number {
		return sessions.size;
	},

	/** テスト用 */
	clear(): void {
		sessions.clear();
	},
};
