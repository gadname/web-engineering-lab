import type { Project } from "@/domains/project/project";
import type { ITenantContextAuthorizer } from "@/domains/shared/authorizers/authorizer";

export interface IProjectTenantContextAuthorizer extends ITenantContextAuthorizer<Project> {}
