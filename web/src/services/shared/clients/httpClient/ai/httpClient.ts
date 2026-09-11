import createClient from "openapi-fetch";
import type { components, paths } from "@/services/shared/clients/httpClient/ai/client";
import { commonRequestMiddleware } from "@/services/shared/clients/httpClient/middlewares/commonRequestMiddleware";
import { errorHandlingMiddleware } from "@/services/shared/clients/httpClient/middlewares/errorHandlingMiddleware";
import { tenantContextRequestMiddleware } from "@/services/shared/clients/httpClient/middlewares/tenantContextRequestMiddleware";
import { getClientEnv } from "@/shared/configs/env";

/** ai（FastAPI）向けクライアント。型は ai/openapi.json から生成する（npm run client:ai:generate） */
export const aiHttpClient = createClient<paths>({ baseUrl: getClientEnv().NEXT_PUBLIC_AI_BACKEND_REST_ENDPOINT });
aiHttpClient.use(commonRequestMiddleware);
aiHttpClient.use(tenantContextRequestMiddleware);
aiHttpClient.use(errorHandlingMiddleware);

export interface AiOpenAPISchema extends components {}
