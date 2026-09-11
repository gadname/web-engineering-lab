import type { EmailAddress } from "@/domains/shared/valueObjects/emailAddress";
import type { UserId } from "@/domains/user/valueObjects/userId";

/**
 * ユーザー。認証基盤上の人物に対応する。
 *
 * 識別子が UUID ではないため `Aggregation` 基底は継承せず、最小の不変オブジェクトとして扱う。
 * 作成・更新の導線は認証基盤との連携で決まるため、ここでは復元（reconstruct）だけを持つ。
 */
export class User {
	private constructor(
		private readonly _id: UserId,
		private readonly _emailAddress: EmailAddress,
		private readonly _name: string,
	) {}

	public static reconstruct(props: { id: UserId; emailAddress: EmailAddress; name: string }): User {
		return new User(props.id, props.emailAddress, props.name);
	}

	public get id(): UserId {
		return this._id;
	}
	public get emailAddress(): EmailAddress {
		return this._emailAddress;
	}
	public get name(): string {
		return this._name;
	}
}
