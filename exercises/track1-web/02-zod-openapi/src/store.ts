/**
 * インメモリのデータストア。
 *
 * この演習では永続化を扱わない（03 で Prisma に置き換える）。
 * 「ルーティングと HTTP の意味」に集中するため、保存先は Map で十分。
 */
export type Project = {
	id: string;
	name: string;
	description: string | null;
	createdAt: string; // ISO 8601
	updatedAt: string;
};

export type CreateProjectInput = {
	name: string;
	description?: string | null;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface IProjectStore {
	list(): Project[];
	get(id: string): Project | null;
	create(input: CreateProjectInput): Project;
	update(id: string, input: UpdateProjectInput): Project | null;
	delete(id: string): boolean;
}

export class InMemoryProjectStore implements IProjectStore {
	private readonly items = new Map<string, Project>();

	list(): Project[] {
		return [...this.items.values()];
	}

	get(id: string): Project | null {
		return this.items.get(id) ?? null;
	}

	create(input: CreateProjectInput): Project {
		const now = new Date().toISOString();
		const project: Project = {
			id: crypto.randomUUID(),
			name: input.name,
			description: input.description ?? null,
			createdAt: now,
			updatedAt: now,
		};
		this.items.set(project.id, project);
		return project;
	}

	update(id: string, input: UpdateProjectInput): Project | null {
		const current = this.items.get(id);
		if (!current) return null;
		const updated: Project = {
			...current,
			name: input.name ?? current.name,
			description: input.description === undefined ? current.description : input.description,
			updatedAt: new Date().toISOString(),
		};
		this.items.set(id, updated);
		return updated;
	}

	delete(id: string): boolean {
		return this.items.delete(id);
	}
}
