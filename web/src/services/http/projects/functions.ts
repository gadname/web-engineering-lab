import type { CreateProjectBody, GetProjectsQuery, UpdateProjectBody } from "@/services/http/projects/types";
import { httpClient } from "@/services/shared/clients/httpClient";

// パスは生成型に含まれるため、typo は型エラーになる
export async function getProjects(query?: GetProjectsQuery) {
	return await httpClient.core.GET("/api/v1/tenants/projects", { params: { query } });
}

export async function getProject(projectId: string) {
	return await httpClient.core.GET("/api/v1/tenants/projects/{projectId}", { params: { path: { projectId } } });
}

export async function createProject(body: CreateProjectBody) {
	return await httpClient.core.POST("/api/v1/tenants/projects", { body });
}

export async function updateProject(projectId: string, body: UpdateProjectBody) {
	return await httpClient.core.PATCH("/api/v1/tenants/projects/{projectId}", {
		params: { path: { projectId } },
		body,
	});
}

export async function deleteProject(projectId: string) {
	return await httpClient.core.DELETE("/api/v1/tenants/projects/{projectId}", { params: { path: { projectId } } });
}
