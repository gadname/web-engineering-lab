import { OpenAPIHono } from "@hono/zod-openapi";
import { protectedTenantProjectsV1 } from "@/routes/v1/protected/tenantContext/projects";
import { tenantAuthMiddleware } from "@/shared/middlewares/auth/tenant/tenantAuthMiddleware";
import type { TenantApplicationEntry } from "@/shared/types/app";

/** tenantContext: テナント内で共有するリソース。全ルートにテナント認可が掛かる */
export const protectedTenantV1 = new OpenAPIHono<TenantApplicationEntry>();

protectedTenantV1.use(tenantAuthMiddleware);

protectedTenantV1.route("/projects", protectedTenantProjectsV1);
