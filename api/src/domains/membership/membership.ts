import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import type { MembershipRole } from "@/domains/membership/valueObjects/membershipRole";
import { Aggregation, type AggregationConstructorArgs } from "@/domains/shared/dddObjectBases/aggregation";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { UserId } from "@/domains/user/valueObjects/userId";

const MembershipKey = Symbol("Membership");

type MembershipConstructorArgs = {
	id: MembershipId;
	userId: UserId;
	tenantId: TenantId;
	role: MembershipRole;
};

/**
 * 所属。「ユーザーがテナントにどのロールで属しているか」。
 * テナント内の操作者はユーザーではなく所属（MembershipId）であり、認可はこの単位で判定する。
 */
export class Membership extends Aggregation<MembershipId, typeof MembershipKey> {
	protected readonly _id: MembershipId;
	private readonly _userId: UserId;
	private readonly _tenantId: TenantId;
	private readonly _role: MembershipRole;

	private constructor(args: AggregationConstructorArgs<MembershipConstructorArgs>) {
		super();
		const validated = this.validateConstructorArgs(args);
		this._id = validated.id;
		this._userId = validated.userId;
		this._tenantId = validated.tenantId;
		this._role = validated.role;
	}

	public static create(props: { userId: UserId; tenantId: TenantId; role: MembershipRole }): Membership {
		return new Membership({ id: new MembershipId(), ...props });
	}

	public static reconstruct(props: MembershipConstructorArgs): Membership {
		return new Membership(props);
	}

	public get id(): MembershipId {
		return this._id;
	}
	public get userId(): UserId {
		return this._userId;
	}
	public get tenantId(): TenantId {
		return this._tenantId;
	}
	public get role(): MembershipRole {
		return this._role;
	}
}
