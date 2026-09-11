import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/http/users/functions";
import { usersKeys } from "@/services/http/users/keys";

export const useGetMeQuery = () => {
	const { data, isLoading, error } = useQuery({
		queryKey: usersKeys.getMe(),
		queryFn: () => getMe(),
	});
	return { me: data?.data, isLoading, error };
};
