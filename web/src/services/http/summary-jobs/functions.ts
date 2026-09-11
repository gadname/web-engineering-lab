import type { CreateSummaryJobBody } from "@/services/http/summary-jobs/types";
import { httpClient } from "@/services/shared/clients/httpClient";

export async function createSummaryJob(body: CreateSummaryJobBody) {
	return await httpClient.ai.POST("/api/ai/v1/protected/summary-jobs", { body });
}

export async function getSummaryJob(jobId: string) {
	return await httpClient.ai.GET("/api/ai/v1/protected/summary-jobs/{job_id}", {
		params: { path: { job_id: jobId } },
	});
}
