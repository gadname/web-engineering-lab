import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import { MembershipRole } from "@/domains/membership/valueObjects/membershipRole";
import { Project } from "@/domains/project/project";
import { ProjectDescription } from "@/domains/project/valueObjects/projectDescription";
import { ProjectId } from "@/domains/project/valueObjects/projectId";
import { ProjectName } from "@/domains/project/valueObjects/projectName";
import { MembershipActor } from "@/domains/shared/entities/actors/actor";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";

export const TENANT_ID = "00000000-0000-4000-8000-000000000001";
export const OTHER_TENANT_ID = "00000000-0000-4000-8000-000000000002";
export const MEMBERSHIP_ID = "00000000-0000-4000-8000-000000000011";
export const PROJECT_ID = "00000000-0000-4000-8000-000000000021";

export const buildProject = (
	overrides: Partial<{
		id: string;
		tenantId: string;
		name: string;
		description: string | null;
		deletedAt: Date | null;
	}> = {},
): Project =>
	Project.reconstruct({
		id: new ProjectId(overrides.id ?? PROJECT_ID),
		tenantId: new TenantId(overrides.tenantId ?? TENANT_ID),
		name: new ProjectName(overrides.name ?? "Alpha"),
		description: new ProjectDescription(overrides.description ?? null),
		deletedAt: overrides.deletedAt ?? null,
	});

export const buildMembershipActor = (
	overrides: Partial<{ membershipId: string; role: MembershipRole; tenantId: string }> = {},
): MembershipActor =>
	new MembershipActor(
		new MembershipId(overrides.membershipId ?? MEMBERSHIP_ID),
		overrides.role ?? MembershipRole.MEMBER,
		new TenantId(overrides.tenantId ?? TENANT_ID),
	);
