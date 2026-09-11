import type { ProjectDescription } from "@/domains/project/valueObjects/projectDescription";
import { ProjectId } from "@/domains/project/valueObjects/projectId";
import type { ProjectName } from "@/domains/project/valueObjects/projectName";
import { Aggregation, type AggregationConstructorArgs } from "@/domains/shared/dddObjectBases/aggregation";
import type { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import { PROJECT_ERROR_CODES } from "@/shared/errors/codes/domains/projectErrors";
import { DomainException } from "@/shared/exceptions/domainException";

const ProjectKey = Symbol("Project");

type ProjectConstructorArgs = {
	id: ProjectId;
	tenantId: TenantId;
	name: ProjectName;
	description: ProjectDescription;
	deletedAt: Date | null;
};

/**
 * プロジェクト（tenantContext の集約ルート）。
 *
 * - テナントは ID で参照する（Tenant 集約の実体は持たない）
 * - 削除は論理削除。行を残すのは、他テーブルからの参照（将来の Task など）を壊さないため
 * - 状態変更（update / delete）は新しいインスタンスを返す。呼び出し側は Repository.update で永続化する
 */
export class Project extends Aggregation<ProjectId, typeof ProjectKey> {
	protected readonly _id: ProjectId;
	private readonly _tenantId: TenantId;
	private readonly _name: ProjectName;
	private readonly _description: ProjectDescription;
	private readonly _deletedAt: Date | null;

	private constructor(args: AggregationConstructorArgs<ProjectConstructorArgs>) {
		super();
		const validated = this.validateConstructorArgs(args);
		this._id = validated.id;
		this._tenantId = validated.tenantId;
		this._name = validated.name;
		this._description = validated.description;
		this._deletedAt = validated.deletedAt;
	}

	public static create(props: { tenantId: TenantId; name: ProjectName; description: ProjectDescription }): Project {
		return new Project({
			id: new ProjectId(),
			tenantId: props.tenantId,
			name: props.name,
			description: props.description,
			deletedAt: null,
		});
	}

	/** 永続層からの復元。削除済みの復元も許す（監査・復元導線のため）。業務ルールの検証はしない */
	public static reconstruct(props: ProjectConstructorArgs): Project {
		return new Project(props);
	}

	public isDeleted(): boolean {
		return this._deletedAt !== null;
	}

	public update(props: { name?: ProjectName; description?: ProjectDescription }): Project {
		this.ensureNotDeleted();
		return new Project({
			id: this._id,
			tenantId: this._tenantId,
			name: props.name ?? this._name,
			description: props.description ?? this._description,
			deletedAt: this._deletedAt,
		});
	}

	public delete(now: Date = new Date()): Project {
		this.ensureNotDeleted();
		return new Project({
			id: this._id,
			tenantId: this._tenantId,
			name: this._name,
			description: this._description,
			deletedAt: now,
		});
	}

	private ensureNotDeleted(): void {
		if (this.isDeleted()) {
			throw new DomainException(PROJECT_ERROR_CODES.VALIDATION.ALREADY_DELETED);
		}
	}

	public get id(): ProjectId {
		return this._id;
	}
	public get tenantId(): TenantId {
		return this._tenantId;
	}
	public get name(): ProjectName {
		return this._name;
	}
	public get description(): ProjectDescription {
		return this._description;
	}
	public get deletedAt(): Date | null {
		return this._deletedAt;
	}
}
