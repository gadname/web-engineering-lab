"use client";

import { useProjectCreateForm } from "@/components/projects/project-create-form/hooks/use-project-create-form";
import { ProjectCreateFormPresentation } from "@/components/projects/project-create-form/presentation";
import { usePostCreateProjectMutation } from "@/services/http/projects";
import { useErrorHandler } from "@/services/shared/exceptions/use-error-handler";
import { useToast } from "@/shared/hooks/use-toast";

export function ProjectCreateForm() {
	const form = useProjectCreateForm();
	const { postCreateProjectMutation } = usePostCreateProjectMutation();
	const { showSuccessToast } = useToast();
	const { handleError } = useErrorHandler();

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			await postCreateProjectMutation.mutateAsync({
				name: data.name,
				description: data.description.trim() === "" ? null : data.description,
			});
			showSuccessToast({ title: "プロジェクトを作成しました" });
			form.reset();
		} catch (error) {
			// 422 はフィールドに、それ以外は toast に振り分ける
			handleError(error, { form, fallbackTitle: "プロジェクトの作成に失敗しました" });
		}
	});

	return (
		<ProjectCreateFormPresentation
			form={form}
			onSubmit={onSubmit}
			isSubmitting={postCreateProjectMutation.isPending}
		/>
	);
}
