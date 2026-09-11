import type { CoreOpenAPISchema } from "@/services/shared/clients/httpClient";

export type GetMeResponse = CoreOpenAPISchema["schemas"]["v1GetMeResponseSchema"];
export type Membership = GetMeResponse["memberships"][number];
