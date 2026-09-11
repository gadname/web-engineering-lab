import { ValueObject } from "@/domains/shared/dddObjectBases/valueObject";
import { MEMBERSHIP_ERROR_CODES } from "@/shared/errors/codes/domains/membershipErrors";
import { DomainException } from "@/shared/exceptions/domainException";
import type { ObjectValueList } from "@/shared/types/utility";

export const MEMBERSHIP_ROLE = {
	ADMIN: "ADMIN",
	MEMBER: "MEMBER",
	GUEST: "GUEST",
} as const;
export type MembershipRoleType = ObjectValueList<typeof MEMBERSHIP_ROLE>;

/** zod の z.enum() に渡すための非空タプル */
export const MEMBERSHIP_ROLE_VALUES = Object.values(MEMBERSHIP_ROLE) as [MembershipRoleType, ...MembershipRoleType[]];

export class MembershipRole extends ValueObject<string, "MembershipRole", MembershipRoleType> {
	public static readonly ADMIN = new MembershipRole(MEMBERSHIP_ROLE.ADMIN);
	public static readonly MEMBER = new MembershipRole(MEMBERSHIP_ROLE.MEMBER);
	public static readonly GUEST = new MembershipRole(MEMBERSHIP_ROLE.GUEST);

	protected validate(value: string): MembershipRoleType {
		if (!MembershipRole.isRole(value)) {
			throw new DomainException(MEMBERSHIP_ERROR_CODES.VALIDATION.INVALID_ROLE, { data: { value } });
		}
		return value;
	}

	private static isRole(value: string): value is MembershipRoleType {
		return (MEMBERSHIP_ROLE_VALUES as string[]).includes(value);
	}

	public isAdmin(): boolean {
		return this._value === MEMBERSHIP_ROLE.ADMIN;
	}
}
