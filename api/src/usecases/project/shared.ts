import type { Project } from "@/domains/project/project";

/** ルートに返す形。集約をそのまま返さず、プリミティブに落とす（レスポンススキーマと 1:1） */
export type ProjectOutput = {
	id: string;
	tenantId: string;
	name: string;
	description: string | null;
};

export const toProjectOutput = (project: Project): ProjectOutput => ({
	id: project.id.value,
	tenantId: project.tenantId.value,
	name: project.name.value,
	description: project.description.value,
});
