import { ProjectCreateForm } from "@/components/projects/project-create-form";
import { ProjectSummary } from "@/components/projects/project-summary";
import type { Project } from "@/services/http/projects/types";
import { Header, type HeaderBreadcrumb } from "@/shared/components/header";
import { Loader } from "@/shared/components/loader";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

export type ProjectsViewerPresentationProps = {
	breadcrumbs: HeaderBreadcrumb[];
	projects: Project[];
	totalCount: number;
	isLoading: boolean;
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	onSearch: () => void;
	onDelete: (projectId: string) => void;
	deletingProjectId: string | null;
};

export function ProjectsViewerPresentation({
	breadcrumbs,
	projects,
	totalCount,
	isLoading,
	searchInput,
	onSearchInputChange,
	onSearch,
	onDelete,
	deletingProjectId,
}: ProjectsViewerPresentationProps) {
	return (
		<div className="flex h-full flex-col">
			<Header breadcrumbs={breadcrumbs} />
			<div className="grid gap-6 p-6 lg:grid-cols-[1fr_20rem]">
				<section>
					<form
						className="mb-4 flex gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							onSearch();
						}}
					>
						<Input
							value={searchInput}
							onChange={(e) => onSearchInputChange(e.target.value)}
							placeholder="名前で検索"
							aria-label="検索"
						/>
						<Button type="submit" variant="outline" className="shrink-0">
							検索
						</Button>
					</form>
					<p className="mb-2 text-xs text-muted-foreground">{totalCount} 件</p>
					{isLoading ? (
						<Loader />
					) : projects.length === 0 ? (
						<p className="text-sm text-muted-foreground">プロジェクトがありません。</p>
					) : (
						<ul className="flex flex-col gap-3">
							{projects.map((project) => (
								<li key={project.id}>
									<Card>
										<div className="flex items-start justify-between gap-4">
											<div>
												<h3 className="font-semibold">{project.name}</h3>
												<p className="text-sm text-muted-foreground whitespace-pre-line">
													{project.description ?? "（説明なし）"}
												</p>
											</div>
											<Button
												variant="destructive"
												onClick={() => onDelete(project.id)}
												disabled={deletingProjectId === project.id}
												aria-label={`${project.name} を削除`}
											>
												削除
											</Button>
										</div>
										<ProjectSummary projectId={project.id} description={project.description} />
									</Card>
								</li>
							))}
						</ul>
					)}
				</section>
				<aside>
					<ProjectCreateForm />
				</aside>
			</div>
		</div>
	);
}
