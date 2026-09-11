import type { CoreOpenAPISchema } from "@/services/shared/clients/httpClient";

// 生成された型を services 層で再エクスポートする。コンポーネントは生成物を直接 import しない
export type GetProjectsResponse = CoreOpenAPISchema["schemas"]["v1GetProjectsResponseSchema"];
export type GetProjectsQuery = {
	search?: string;
	page?: number;
	limit?: number;
};
export type Project = GetProjectsResponse["projects"][number];
export type CreateProjectBody = CoreOpenAPISchema["schemas"]["v1CreateProjectBodySchema"];
export type CreateProjectResponse = CoreOpenAPISchema["schemas"]["v1ProjectResponseSchema"];
export type UpdateProjectBody = CoreOpenAPISchema["schemas"]["v1UpdateProjectBodySchema"];
