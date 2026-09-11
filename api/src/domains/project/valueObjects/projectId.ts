import { UUID } from "@/domains/shared/dddObjectBases/uuid";

export class ProjectId extends UUID<"ProjectId"> {
	public constructor(value: string | null = null) {
		super(value);
	}
}
