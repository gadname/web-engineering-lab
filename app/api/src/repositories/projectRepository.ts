import type { Db } from "@/db";
import type { Project } from "@/generated/prisma/client";

/**
 * Project の永続化を担う Repository。
 *
 * 01/02 の IProjectStore と同じ形をしているが、こちらは非同期。
 * ポイントは「読み取りは view（projects_live）、書き込みはテーブル（projects）」という使い分け。
 * 呼び出し側は削除済みの存在を意識しなくてよく、`deletedAt IS NULL` の付け忘れも起きない。
 */
export type CreateProjectInput = {
	name: string;
	description?: string | null;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface IProjectRepository {
	list(): Promise<Project[]>;
	findById(id: string): Promise<Project | null>;
	create(input: CreateProjectInput): Promise<Project>;
	update(id: string, input: UpdateProjectInput): Promise<Project | null>;
	softDelete(id: string): Promise<boolean>;
}

export class PrismaProjectRepository implements IProjectRepository {
	constructor(private readonly db: Db) {}

	list(): Promise<Project[]> {
		// view は read-only。orderBy は使えるが index は無いので、件数が増えたら実テーブル側の index に依存する
		return this.db.project.findMany({ orderBy: { createdAt: "asc" } });
	}

	findById(id: string): Promise<Project | null> {
		return this.db.project.findUnique({ where: { id } });
	}

	async create(input: CreateProjectInput): Promise<Project> {
		const record = await this.db.projectRecord.create({
			data: { name: input.name, description: input.description ?? null },
		});
		// view の型（Project）に揃えて返す。deletedAt を外に漏らさない
		return toProject(record);
	}

	async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
		// 削除済みは更新させない: view で生存確認してから実テーブルを更新する
		const alive = await this.findById(id);
		if (!alive) return null;
		const record = await this.db.projectRecord.update({
			where: { id },
			data: {
				...(input.name !== undefined ? { name: input.name } : {}),
				...(input.description !== undefined ? { description: input.description } : {}),
			},
		});
		return toProject(record);
	}

	async softDelete(id: string): Promise<boolean> {
		// updateMany は対象 0 件でも throw しないので、count で成否を判定できる
		const result = await this.db.projectRecord.updateMany({
			where: { id, deletedAt: null },
			data: { deletedAt: new Date() },
		});
		return result.count === 1;
	}
}

/** 実テーブルの行から view と同じ形（deletedAt 無し）に変換する */
export const toProject = (record: Project & { deletedAt?: Date | null }): Project => ({
	id: record.id,
	name: record.name,
	description: record.description,
	createdAt: record.createdAt,
	updatedAt: record.updatedAt,
});
