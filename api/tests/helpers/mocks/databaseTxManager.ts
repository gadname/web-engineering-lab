import { vi } from "vitest";
import type { IDatabaseTxManager } from "@/infrastructures/shared/clients/databaseClient/interfaces";

export const createMockDatabaseTxManager = (): IDatabaseTxManager => ({
	do: vi.fn().mockImplementation(async (callback: () => Promise<unknown>) => await callback()),
});
