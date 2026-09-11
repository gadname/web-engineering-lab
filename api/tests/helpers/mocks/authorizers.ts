import { vi } from "vitest";
import type { IActorResolver } from "@/authorizers/shared/resolvers/interfaces";
import type { IProjectTenantContextAuthorizer } from "@/domains/project/authorizers/project";
import type { IGetProjectsQueryServiceAuthorizer } from "@/domains/queries/getProjectsQueryService";

export const createMockActorResolver = (): IActorResolver => ({
	resolve: vi.fn(),
});

export const createMockProjectAuthorizer = (): IProjectTenantContextAuthorizer => ({
	canSave: vi.fn(),
	canFind: vi.fn(),
	canUpdate: vi.fn(),
	canDelete: vi.fn(),
});

export const createMockGetProjectsQueryServiceAuthorizer = (): IGetProjectsQueryServiceAuthorizer => ({
	canFindMany: vi.fn(),
});
