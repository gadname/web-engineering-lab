import { httpClient } from "@/services/shared/clients/httpClient";

export async function getMe() {
	return await httpClient.core.GET("/api/v1/users/me");
}
