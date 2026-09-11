import type { AllowedAggregation, AllowedId } from "@/domains/shared/authorizers/authorizerResult";
import type { AggregationType } from "@/domains/shared/dddObjectBases/aggregation";

/**
 * Repository の共通契約。
 *
 * 書き込み系は認可済みの入力しか受け取らない。`unsafe*` は認可を経由しない経路で、
 * シード・テスト・システム処理（バッチ）用。ルートやユースケースから呼んではいけない。
 */
export interface IRepository<T extends AggregationType> {
	find(id: T["id"]): Promise<T | null>;
	save(entity: AllowedAggregation<T>): Promise<void>;
	update(entity: AllowedAggregation<T>): Promise<void>;
	delete(id: AllowedId<T["id"]>): Promise<void>;
	unsafeSave(entity: T): Promise<void>;
	unsafeUpdate(entity: T): Promise<void>;
	unsafeDelete(id: T["id"]): Promise<void>;
}
