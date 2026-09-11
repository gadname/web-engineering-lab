import { UUID } from "@/domains/shared/dddObjectBases/uuid";

export class MembershipId extends UUID<"MembershipId"> {
	public constructor(value: string | null = null) {
		super(value);
	}
}
