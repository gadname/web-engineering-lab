import { UUID } from "@/domains/shared/dddObjectBases/uuid";

export class TenantId extends UUID<"TenantId"> {
	public constructor(value: string | null = null) {
		super(value);
	}
}
