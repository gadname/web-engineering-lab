import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "@/services/http/projects/functions";
import { projectsKeys } from "@/services/http/projects/keys";

export function useDeleteProjectMutation() {
	const queryClient = useQueryClient();

	const deleteProjectMutation = useMutation({
		mutationFn: (projectId: string) => deleteProject(projectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: projectsKeys.all });
		},
	});

	return { deleteProjectMutation };
}
