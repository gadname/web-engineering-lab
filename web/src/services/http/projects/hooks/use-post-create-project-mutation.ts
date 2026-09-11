import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "@/services/http/projects/functions";
import { projectsKeys } from "@/services/http/projects/keys";
import type { CreateProjectBody } from "@/services/http/projects/types";

export function usePostCreateProjectMutation() {
	const queryClient = useQueryClient();

	const postCreateProjectMutation = useMutation({
		mutationFn: (body: CreateProjectBody) => createProject(body),
		onSuccess: () => {
			// 一覧を無効化して再取得させる。手でキャッシュに足すより単純で、並び順もサーバーに従う
			queryClient.invalidateQueries({ queryKey: projectsKeys.all });
		},
	});

	return { postCreateProjectMutation };
}
