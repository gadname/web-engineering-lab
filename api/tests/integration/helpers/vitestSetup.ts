import { inject } from "vitest";
import { AppConfig } from "@/shared/config/appConfig";
import { Logger } from "@/shared/logger/logger";

// 各テストファイルの先頭で、Testcontainers の接続先で AppConfig を初期化する
AppConfig.reset();
AppConfig.initialize({ ENV: "test", LOG_LEVEL: "error", DATABASE_URL: inject("databaseUrl") });
Logger.initBase({ level: "error", sink: () => undefined });
