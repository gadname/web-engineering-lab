import { OpenAPIHono } from "@hono/zod-openapi";
import { getMe } from "@/routes/v1/protected/userContext/users/getMe";
import type { ApplicationEntry } from "@/shared/types/app";

/** userContext: ユーザー個人のリソース。テナント認可は掛からない（JWT 認証のみ） */
export const protectedUserV1 = new OpenAPIHono<ApplicationEntry>();

protectedUserV1.route("/", getMe);
