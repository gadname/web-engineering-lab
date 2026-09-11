import { OpenAPIHono } from "@hono/zod-openapi";
import { createProject } from "@/routes/v1/protected/tenantContext/projects/createProject";
import { deleteProject } from "@/routes/v1/protected/tenantContext/projects/deleteProject";
import { getProject } from "@/routes/v1/protected/tenantContext/projects/getProject";
import { getProjects } from "@/routes/v1/protected/tenantContext/projects/getProjects";
import { updateProject } from "@/routes/v1/protected/tenantContext/projects/updateProject";
import type { TenantApplicationEntry } from "@/shared/types/app";

export const protectedTenantProjectsV1 = new OpenAPIHono<TenantApplicationEntry>();

protectedTenantProjectsV1.route("/", createProject);
protectedTenantProjectsV1.route("/", getProjects);
protectedTenantProjectsV1.route("/", getProject);
protectedTenantProjectsV1.route("/", updateProject);
protectedTenantProjectsV1.route("/", deleteProject);
