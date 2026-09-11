"use client";

import { UserTenantsListPresentation } from "@/components/user-tenants/user-tenants-list/presentation";
import { useGetMeQuery } from "@/services/http/users";
import { usePage } from "@/shared/hooks/use-page";

export function UserTenantsList() {
	const { me, isLoading } = useGetMeQuery();
	const { page } = usePage();

	return (
		<UserTenantsListPresentation
			userName={me?.name}
			memberships={me?.memberships ?? []}
			isLoading={isLoading}
			getProjectsUrl={(tenantId) => page.TENANT_CONTEXT.PROJECTS_PAGE.URL({ tenantId })}
		/>
	);
}
