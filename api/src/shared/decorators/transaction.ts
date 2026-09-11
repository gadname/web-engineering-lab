import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";

/**
 * ユースケースの execute をトランザクションで包むデコレータ。
 *
 * 使う側のクラスは `databaseTxManager: IDatabaseTxManager` プロパティを持つこと（型で強制している）。
 * トランザクションの開始・終了をユースケース本文から追い出し、「1 ユースケース = 1 トランザクション」を
 * 宣言だけで守れるようにする。
 *
 * @example
 * ```ts
 * class CreateProjectUsecase {
 *   constructor(..., private readonly databaseTxManager: IDatabaseTxManager) {}
 *
 *   @databaseTx
 *   async execute(command: Command): Promise<Result> { ... }
 * }
 * ```
 */
export function databaseTx<This extends { databaseTxManager: IDatabaseTxManager }, Args extends unknown[], Return>(
	target: (this: This, ...args: Args) => Promise<Return>,
	_context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>,
) {
	return async function (this: This, ...args: Args): Promise<Return> {
		return this.databaseTxManager.do(async () => await target.call(this, ...args));
	};
}
