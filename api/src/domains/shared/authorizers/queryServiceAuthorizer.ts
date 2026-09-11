import type { MembershipId } from "@/domains/membership/valueObjects/membershipId";

/**
 * QueryService（読み取り専用の DTO）に対する認可。
 * 集約を復元しない読み取り経路でも認可を省略しないための契約。一覧はまとめて判定する。
 */
export interface IQueryServiceTenantContextAuthorizer<TDto> {
	canFindMany(actorId: MembershipId, dtos: TDto[]): Promise<{ allowed: TDto[]; denied: TDto[] }>;
}
