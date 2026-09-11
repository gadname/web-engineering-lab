import type { AggregationType } from "@/domains/shared/dddObjectBases/aggregation";
import type { UUID } from "@/domains/shared/dddObjectBases/uuid";

/**
 * 認可結果。
 *
 * Repository の save / update / delete は `AllowedAggregation` / `AllowedId` しか受け取らない。
 * つまり「認可を通していない集約は保存できない」ことを型で強制する。
 * `isAllowed()` は型ガードなので、分岐後は entity にアクセスできる。
 */
export class AllowedAggregation<T extends AggregationType> {
	public readonly key = "ALLOWED" as const;
	public constructor(private readonly _entity: T) {}
	public get entity(): T {
		return this._entity;
	}
	public isAllowed(): this is AllowedAggregation<T> {
		return true;
	}
	public isDenied(): this is DeniedAggregation<T> {
		return false;
	}
	/** 認可済みの集約から、その識別子の認可済み参照を取り出す（delete 用） */
	public get allowedId(): AllowedId<T["id"]> {
		return new AllowedId(this._entity.id);
	}
}

export class DeniedAggregation<T extends AggregationType> {
	public readonly key = "DENIED" as const;
	public constructor(private readonly _entity: T) {}
	public get entity(): T {
		return this._entity;
	}
	public isAllowed(): this is AllowedAggregation<T> {
		return false;
	}
	public isDenied(): this is DeniedAggregation<T> {
		return true;
	}
}

export class AllowedId<T extends UUID<unknown>> {
	public readonly key = "ALLOWED" as const;
	public constructor(private readonly _value: T) {}
	public get value(): T {
		return this._value;
	}
	public isAllowed(): this is AllowedId<T> {
		return true;
	}
	public isDenied(): this is DeniedId<T> {
		return false;
	}
}

export class DeniedId<T extends UUID<unknown>> {
	public readonly key = "DENIED" as const;
	public constructor(private readonly _value: T) {}
	public get value(): T {
		return this._value;
	}
	public isAllowed(): this is AllowedId<T> {
		return false;
	}
	public isDenied(): this is DeniedId<T> {
		return true;
	}
}

export type AggregationAuthResult<T extends AggregationType> = AllowedAggregation<T> | DeniedAggregation<T>;
export type IdAuthResult<T extends UUID<unknown>> = AllowedId<T> | DeniedId<T>;
