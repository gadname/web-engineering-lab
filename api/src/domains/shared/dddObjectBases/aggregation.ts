import type { UUID } from "@/domains/shared/dddObjectBases/uuid";

/** read-only 化された DDD オブジェクトのマーカー */
export interface IReadOnlyDDDObject {
	readonly __readonly: true;
}

export type AggregationType = Aggregation<UUID<unknown>, symbol>;

/** 他の集約から参照してよい形（freeze 済み） */
export type ReadOnlyAggregation<T extends AggregationType> = Readonly<T> & IReadOnlyDDDObject;

// 書き換え可能な集約をコンストラクタ引数に混ぜるとコンパイルエラーにする
type NonAggregation<T> = T extends AggregationType ? (T extends IReadOnlyDDDObject ? T : never) : T;

export type AggregationConstructorArgs<T> = {
	[K in keyof T]: NonAggregation<T[K]>;
};

/**
 * 集約ルートの基底。
 *
 * - 識別子（id）で同一性を判定する
 * - 他の集約は ID で参照する（`tenantId: TenantId`）。実体を持つ必要があるときは read-only（`asReadOnly()`）に限る。
 *   これは「集約 A の保存が、集約 B の状態を巻き込んで書き換える」事故を型で防ぐため
 * - 状態変更メソッドは新しいインスタンスを返す（不変）。永続化は Repository が `update` で行う
 */
export abstract class Aggregation<Id extends UUID<unknown>, AggregationKey extends symbol> {
	protected abstract readonly _id: Id;
	private declare readonly _brand: AggregationKey;

	public abstract get id(): Id;

	public equals(other: Aggregation<Id, AggregationKey>): boolean {
		return this.constructor === other.constructor && this._id.equals(other._id);
	}

	/** 集約・エンティティの実体を引数に取れないことをコンパイル時に検査するだけのヘルパー */
	protected validateConstructorArgs<T extends Record<string, unknown>>(args: AggregationConstructorArgs<T>): T {
		return args as T;
	}

	public asReadOnly(): ReadOnlyAggregation<this> {
		if (Object.isFrozen(this)) return this as ReadOnlyAggregation<this>;
		(this as unknown as { __readonly: boolean }).__readonly = true;
		return Object.freeze(this) as ReadOnlyAggregation<this>;
	}
}
