import { aiHttpClient } from "@/services/shared/clients/httpClient/ai/httpClient";
import { coreHttpClient } from "@/services/shared/clients/httpClient/core/httpClient";

export const httpClient = {
	core: coreHttpClient,
	ai: aiHttpClient,
};

export type { AiOpenAPISchema } from "@/services/shared/clients/httpClient/ai/httpClient";
export type { CoreOpenAPISchema } from "@/services/shared/clients/httpClient/core/httpClient";
