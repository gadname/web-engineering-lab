import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// env.ts はモジュール読み込み時に NEXT_PUBLIC_* を zod で検証する。
// httpClient を import 連鎖に含むテストが落ちないよう、全テスト共通でここで stub する
vi.stubEnv("NEXT_PUBLIC_ENV", "local");
vi.stubEnv("NEXT_PUBLIC_CORE_BACKEND_REST_ENDPOINT", "http://localhost:8787");
vi.stubEnv("NEXT_PUBLIC_AI_BACKEND_REST_ENDPOINT", "http://localhost:8000");

afterEach(() => {
	cleanup();
});
