import type { Project } from "@/generated/prisma/client";
import type { CreateProjectInput, IProjectRepository, UpdateProjectInput } from "@/repositories/projectRepository";

/**
 * テスト用のインメモリ実装。
 * ルートのテストは DB を起動せずにこれを差し込む。Prisma 実装との「契約の一致」は統合テストで担保する。
 */
export class InMemoryProjectRepository implements IProjectRepository {
	private readonly items = new Map<string, Project & { deletedAt: Date | null }>();

	async list(): Promise<Project[]> {
		return [...this.items.values()].filter((p) => p.deletedAt === null).map(strip);
	}

	async findById(id: string): Promise<Project | null> {
		const found = this.items.get(id);
		return found && found.deletedAt === null ? strip(found) : null;
	}

	async create(input: CreateProjectInput): Promise<Project> {
		const now = new Date();
		const project = {
			id: crypto.randomUUID(),
			name: input.name,
			description: input.description ?? null,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		};
		this.items.set(project.id, project);
		return strip(project);
	}

	async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
		const current = this.items.get(id);
		if (!current || current.deletedAt !== null) return null;
		const updated = {
			...current,
			name: input.name ?? current.name,
			description: input.description === undefined ? current.description : input.description,
			updatedAt: new Date(),
		};
		this.items.set(id, updated);
		return strip(updated);
	}

	async softDelete(id: string): Promise<boolean> {
		const current = this.items.get(id);
		if (!current || current.deletedAt !== null) return false;
		this.items.set(id, { ...current, deletedAt: new Date() });
		return true;
	}
}

const strip = ({ deletedAt: _deletedAt, ...project }: Project & { deletedAt: Date | null }): Project => project;
