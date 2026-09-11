import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import {
	ProjectsViewerPresentation,
	type ProjectsViewerPresentationProps,
} from "@/components/projects/projects-viewer/presentation";
import { PageProvider } from "@/shared/providers/page-provider";
import { ToastProvider } from "@/shared/providers/toast-provider";

vi.mock("next/navigation", () => ({
	useParams: () => ({ tenantId: "t1" }),
	useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>
		<PageProvider>
			<ToastProvider>{children}</ToastProvider>
		</PageProvider>
	</QueryClientProvider>
);

const baseProps: ProjectsViewerPresentationProps = {
	breadcrumbs: [{ label: "プロジェクト" }],
	projects: [],
	totalCount: 0,
	isLoading: false,
	searchInput: "",
	onSearchInputChange: vi.fn(),
	onSearch: vi.fn(),
	onDelete: vi.fn(),
	deletingProjectId: null,
};

describe("ProjectsViewerPresentation", () => {
	it("0 件のときは空状態を出す", () => {
		render(<ProjectsViewerPresentation {...baseProps} />, { wrapper: Wrapper });
		expect(screen.getByText("プロジェクトがありません。")).toBeInTheDocument();
	});

	it("一覧を描画し、削除ボタンが onDelete を呼ぶ", () => {
		const onDelete = vi.fn();
		render(
			<ProjectsViewerPresentation
				{...baseProps}
				totalCount={1}
				onDelete={onDelete}
				projects={[
					{
						id: "p1",
						name: "Alpha",
						description: null,
						createdAt: "2026-09-11T00:00:00Z",
						updatedAt: "2026-09-11T00:00:00Z",
					},
				]}
			/>,
			{ wrapper: Wrapper }
		);
		expect(screen.getByText("Alpha")).toBeInTheDocument();
		screen.getByRole("button", { name: "Alpha を削除" }).click();
		expect(onDelete).toHaveBeenCalledWith("p1");
	});
});
