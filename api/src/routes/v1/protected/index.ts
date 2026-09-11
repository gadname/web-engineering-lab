import { OpenAPIHono } from "@hono/zod-openapi";
import { protectedTenantV1 } from "@/routes/v1/protected/tenantContext";
import { protectedUserV1 } from "@/routes/v1/protected/userContext";
import { jwtAuthMiddleware } from "@/shared/middlewares/auth/jwt/jwtAuthMiddleware";
import type { ApplicationEntry } from "@/shared/types/app";

export const protectedV1 = new OpenAPIHono<ApplicationEntry>();

protectedV1.use(jwtAuthMiddleware);

protectedV1.route("/users", protectedUserV1);
protectedV1.route("/tenants", protectedTenantV1);
