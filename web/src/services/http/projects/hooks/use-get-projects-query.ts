import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/services/http/projects/functions";
import { projectsKeys } from "@/services/http/projects/keys";
import type { GetProjectsQuery } from "@/services/http/projects/types";

export const useGetProjectsQuery = (query?: GetProjectsQuery) => {
	const { data, isLoading, error } = useQuery({
		queryKey: projectsKeys.getProjects(query),
		queryFn: () => getProjects(query),
	});
	return { projects: data?.data, isLoading, error };
};
