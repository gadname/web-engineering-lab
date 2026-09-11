import type { UseFormReturn } from "react-hook-form";
import type { ProjectCreateFormSchemaType } from "@/components/projects/project-create-form/hooks/use-project-create-form";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

export type ProjectCreateFormPresentationProps = {
	form: UseFormReturn<ProjectCreateFormSchemaType>;
	onSubmit: () => void;
	isSubmitting: boolean;
};

export function ProjectCreateFormPresentation({ form, onSubmit, isSubmitting }: ProjectCreateFormPresentationProps) {
	const { errors } = form.formState;
	return (
		<Card>
			<h2 className="mb-3 text-sm font-semibold">プロジェクトを作成</h2>
			<form onSubmit={onSubmit} className="flex flex-col gap-3">
				<label htmlFor="project-create-name" className="flex flex-col gap-1 text-sm">
					名前
					<Input id="project-create-name" {...form.register("name")} aria-invalid={!!errors.name} />
					{errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
				</label>
				<label htmlFor="project-create-description" className="flex flex-col gap-1 text-sm">
					説明
					<textarea
						id="project-create-description"
						{...form.register("description")}
						rows={3}
						className="rounded-md border border-border bg-background px-3 py-2 text-sm"
					/>
					{errors.description && (
						<span className="text-xs text-destructive">{errors.description.message}</span>
					)}
				</label>
				<div>
					<Button type="submit" disabled={isSubmitting}>
						作成
					</Button>
				</div>
			</form>
		</Card>
	);
}
