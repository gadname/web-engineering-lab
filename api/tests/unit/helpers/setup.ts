import { beforeEach, vi } from "vitest";
import { Logger } from "@/shared/logger/logger";

/** 各テストの前にモックを初期化し、ログを黙らせる */
export const setupTestEnvironment = () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Logger.initBase({ level: "error", sink: () => undefined });
	});
};
