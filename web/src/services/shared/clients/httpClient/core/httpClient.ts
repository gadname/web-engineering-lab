import createClient from "openapi-fetch";
import type { components, paths } from "@/services/shared/clients/httpClient/core/client";
import { commonRequestMiddleware } from "@/services/shared/clients/httpClient/middlewares/commonRequestMiddleware";
import { errorHandlingMiddleware } from "@/services/shared/clients/httpClient/middlewares/errorHandlingMiddleware";
import { tenantContextRequestMiddleware } from "@/services/shared/clients/httpClient/middlewares/tenantContextRequestMiddleware";
import { getClientEnv } from "@/shared/configs/env";

/**
 * api（Hono）向けクライアント。paths / components の型は api/openapi.json から生成する（npm run client:core:generate）。
 * パスやスキーマを変えるとここでコンパイルエラーになるのが、型を生成する目的。
 */
export const coreHttpClient = createClient<paths>({ baseUrl: getClientEnv().NEXT_PUBLIC_CORE_BACKEND_REST_ENDPOINT });
coreHttpClient.use(commonRequestMiddleware);
coreHttpClient.use(tenantContextRequestMiddleware);
coreHttpClient.use(errorHandlingMiddleware);

export interface CoreOpenAPISchema extends components {}
