import type { AiOpenAPISchema } from "@/services/shared/clients/httpClient";

export type CreateSummaryJobBody = AiOpenAPISchema["schemas"]["CreateSummaryJobBodySchema"];
export type SummaryJob = AiOpenAPISchema["schemas"]["SummaryJobResponseSchema"];
export type SummaryJobStatus = SummaryJob["status"];
