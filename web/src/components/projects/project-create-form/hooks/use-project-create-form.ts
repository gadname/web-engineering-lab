import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// 上限はバックエンドの値オブジェクトと合わせる（サーバーでも検証されるので、ここは早めに気づかせるため）
const PROJECT_NAME_MAX_LENGTH = 100;
const PROJECT_DESCRIPTION_MAX_LENGTH = 1000;

const projectCreateFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: "プロジェクト名を入力してください" })
		.max(PROJECT_NAME_MAX_LENGTH, { message: `${PROJECT_NAME_MAX_LENGTH} 文字以内で入力してください` }),
	description: z.string().max(PROJECT_DESCRIPTION_MAX_LENGTH, {
		message: `${PROJECT_DESCRIPTION_MAX_LENGTH} 文字以内で入力してください`,
	}),
});

export type ProjectCreateFormSchemaType = z.infer<typeof projectCreateFormSchema>;

export const useProjectCreateForm = () =>
	useForm<ProjectCreateFormSchemaType>({
		defaultValues: { name: "", description: "" },
		resolver: zodResolver(projectCreateFormSchema),
		mode: "onBlur",
	});
