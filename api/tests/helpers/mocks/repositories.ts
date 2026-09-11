import { vi } from "vitest";
import type { IMembershipRepository } from "@/domains/membership/repositories/membership";
import type { IProjectRepository } from "@/domains/project/repositories/project";
import type { IGetProjectsQueryService } from "@/domains/queries/getProjectsQueryService";
import type { IUserRepository } from "@/domains/user/repositories/user";

export const createMockProjectRepository = (): IProjectRepository => ({
	find: vi.fn(),
	save: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	unsafeSave: vi.fn(),
	unsafeUpdate: vi.fn(),
	unsafeDelete: vi.fn(),
	countByTenantId: vi.fn().mockResolvedValue(0),
	existsByTenantIdAndName: vi.fn().mockResolvedValue(false),
});

export const createMockMembershipRepository = (): IMembershipRepository => ({
	find: vi.fn(),
	findActorById: vi.fn(),
	findByUserIdAndTenantId: vi.fn(),
	findManyByUserId: vi.fn(),
	unsafeSave: vi.fn(),
});

export const createMockUserRepository = (): IUserRepository => ({
	find: vi.fn(),
	unsafeSave: vi.fn(),
});

export const createMockGetProjectsQueryService = (): IGetProjectsQueryService => ({
	execute: vi.fn(),
});
