import { useMutation } from "@tanstack/react-query";
import { createSummaryJob } from "@/services/http/summary-jobs/functions";
import type { CreateSummaryJobBody } from "@/services/http/summary-jobs/types";

export function usePostCreateSummaryJobMutation() {
	const postCreateSummaryJobMutation = useMutation({
		mutationFn: (body: CreateSummaryJobBody) => createSummaryJob(body),
	});
	return { postCreateSummaryJobMutation };
}
