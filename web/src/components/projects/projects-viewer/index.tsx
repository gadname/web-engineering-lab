"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ProjectsViewerPresentation } from "@/components/projects/projects-viewer/presentation";
import { useDeleteProjectMutation, useGetProjectsQuery } from "@/services/http/projects";
import { useErrorHandler } from "@/services/shared/exceptions/use-error-handler";
import { usePage } from "@/shared/hooks/use-page";
import { useToast } from "@/shared/hooks/use-toast";
import { getCookie } from "@/shared/lib/cookie";

/**
 * Container: クエリ・ミューテーション・URL 状態を束ね、Presentation に渡す値を作る。
 * 検索語は「入力中の値」と「確定した値（クエリに使う）」を分け、入力のたびに API を叩かない。
 */
export function ProjectsViewer() {
	const { tenantId } = useParams<{ tenantId: string }>();
	const { page } = usePage();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const { projects, isLoading } = useGetProjectsQuery(search ? { search } : undefined);
	const { deleteProjectMutation } = useDeleteProjectMutation();
	const { showSuccessToast } = useToast();
	const { handleError } = useErrorHandler();

	const onDelete = async (projectId: string) => {
		try {
			await deleteProjectMutation.mutateAsync(projectId);
			showSuccessToast({ title: "プロジェクトを削除しました" });
		} catch (error) {
			handleError(error, { fallbackTitle: "プロジェクトの削除に失敗しました" });
		}
	};

	const userId = getCookie("userId") ?? "";
	const breadcrumbs = [
		{ label: page.USER_CONTEXT.USER_TENANTS_PAGE.label, href: page.USER_CONTEXT.USER_TENANTS_PAGE.URL({ userId }) },
		{ label: `${page.TENANT_CONTEXT.PROJECTS_PAGE.label}（${tenantId}）` },
	];

	return (
		<ProjectsViewerPresentation
			breadcrumbs={breadcrumbs}
			projects={projects?.projects ?? []}
			totalCount={projects?.pagination.totalCount ?? 0}
			isLoading={isLoading}
			searchInput={searchInput}
			onSearchInputChange={setSearchInput}
			onSearch={() => setSearch(searchInput.trim())}
			onDelete={onDelete}
			deletingProjectId={deleteProjectMutation.isPending ? (deleteProjectMutation.variables ?? null) : null}
		/>
	);
}
