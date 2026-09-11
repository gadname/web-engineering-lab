import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectAuthorizer } from "@/authorizers/project";
import type { IActorResolver } from "@/authorizers/shared/resolvers/interfaces";
import { MembershipId } from "@/domains/membership/valueObjects/membershipId";
import { MembershipRole } from "@/domains/membership/valueObjects/membershipRole";
import { buildMembershipActor, buildProject, MEMBERSHIP_ID, OTHER_TENANT_ID } from "@/tests/helpers/fixtures";
import { createMockActorResolver } from "@/tests/helpers/mocks/authorizers";
import { setupTestEnvironment } from "@/tests/unit/helpers/setup";

describe("ProjectAuthorizer", () => {
	setupTestEnvironment();

	let actorResolver: IActorResolver;
	let authorizer: ProjectAuthorizer;
	const actorId = new MembershipId(MEMBERSHIP_ID);

	beforeEach(() => {
		actorResolver = createMockActorResolver();
		authorizer = new ProjectAuthorizer(actorResolver);
	});

	it.each([
		["ADMIN", MembershipRole.ADMIN, true],
		["MEMBER", MembershipRole.MEMBER, true],
		["GUEST", MembershipRole.GUEST, false],
	])("canSave: 同じテナントの %s → allowed=%s", async (_label, role, expected) => {
		vi.mocked(actorResolver.resolve).mockResolvedValue(buildMembershipActor({ role }));
		const result = await authorizer.canSave(actorId, buildProject());
		expect(result.isAllowed()).toBe(expected);
	});

	it("canFind: 同じテナントなら GUEST でも読める", async () => {
		vi.mocked(actorResolver.resolve).mockResolvedValue(buildMembershipActor({ role: MembershipRole.GUEST }));
		expect((await authorizer.canFind(actorId, buildProject())).isAllowed()).toBe(true);
	});

	it("canFind: 別テナントの所属は ADMIN でも読めない", async () => {
		vi.mocked(actorResolver.resolve).mockResolvedValue(
			buildMembershipActor({ role: MembershipRole.ADMIN, tenantId: OTHER_TENANT_ID }),
		);
		expect((await authorizer.canFind(actorId, buildProject())).isAllowed()).toBe(false);
	});

	it("canDelete: 許可時は AllowedId を返す", async () => {
		vi.mocked(actorResolver.resolve).mockResolvedValue(buildMembershipActor({ role: MembershipRole.ADMIN }));
		const project = buildProject();
		const result = await authorizer.canDelete(actorId, project);
		expect(result.isAllowed()).toBe(true);
		expect(result.value.equals(project.id)).toBe(true);
	});
});
