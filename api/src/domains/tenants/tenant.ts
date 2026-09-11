import { Aggregation, type AggregationConstructorArgs } from "@/domains/shared/dddObjectBases/aggregation";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import type { TenantName } from "@/domains/tenants/valueObjects/tenantName";

const TenantKey = Symbol("Tenant");

/** テナント（組織・チーム）。マルチテナントの境界であり、テナント内リソースは必ず tenantId を持つ */
export class Tenant extends Aggregation<TenantId, typeof TenantKey> {
	protected readonly _id: TenantId;
	private readonly _name: TenantName;

	private constructor(args: AggregationConstructorArgs<{ id: TenantId; name: TenantName }>) {
		super();
		const validated = this.validateConstructorArgs(args);
		this._id = validated.id;
		this._name = validated.name;
	}

	public static create(props: { name: TenantName }): Tenant {
		return new Tenant({ id: new TenantId(), name: props.name });
	}

	public static reconstruct(props: { id: TenantId; name: TenantName }): Tenant {
		return new Tenant(props);
	}

	public get id(): TenantId {
		return this._id;
	}
	public get name(): TenantName {
		return this._name;
	}
}
