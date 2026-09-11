import type { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { AggregationAuthResult, IdAuthResult } from "@/domains/shared/authorizers/authorizerResult";
import type { AggregationType } from "@/domains/shared/dddObjectBases/aggregation";
import type { UserId } from "@/domains/user/valueObjects/userId";

/**
 * 認可の 2 層モデル。
 *
 * - userContext: ユーザー個人のリソース。操作者は UserId
 * - tenantContext: テナント内で共有するリソース。操作者は MembershipId（テナントへの所属）
 *
 * インターフェースはドメイン層に置き、実装（`src/authorizers/`）はドメインの外に置く。
 * ドメインは「誰が何をできるか」の契約だけを知り、ルールの中身（ロール・所属）は外から差し込む。
 */
export interface IUserContextAuthorizer<T extends AggregationType> {
	canSave(actorId: UserId, resource: T): Promise<AggregationAuthResult<T>>;
	canFind(actorId: UserId, resource: T): Promise<AggregationAuthResult<T>>;
	canUpdate(actorId: UserId, resource: T): Promise<AggregationAuthResult<T>>;
	canDelete(actorId: UserId, resource: T): Promise<IdAuthResult<T["id"]>>;
}

export interface ITenantContextAuthorizer<T extends AggregationType> {
	canSave(actorId: MembershipId, resource: T): Promise<AggregationAuthResult<T>>;
	canFind(actorId: MembershipId, resource: T): Promise<AggregationAuthResult<T>>;
	canUpdate(actorId: MembershipId, resource: T): Promise<AggregationAuthResult<T>>;
	canDelete(actorId: MembershipId, resource: T): Promise<IdAuthResult<T["id"]>>;
}
