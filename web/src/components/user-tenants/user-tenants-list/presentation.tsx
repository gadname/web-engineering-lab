import Link from "next/link";
import type { Membership } from "@/services/http/users/types";
import { Header } from "@/shared/components/header";
import { Loader } from "@/shared/components/loader";
import { Card } from "@/shared/components/ui/card";

export type UserTenantsListPresentationProps = {
	userName: string | undefined;
	memberships: Membership[];
	isLoading: boolean;
	getProjectsUrl: (tenantId: string) => string;
};

export function UserTenantsListPresentation({
	userName,
	memberships,
	isLoading,
	getProjectsUrl,
}: UserTenantsListPresentationProps) {
	return (
		<div className="flex h-full flex-col">
			<Header breadcrumbs={[{ label: "テナント一覧" }]} />
			<div className="p-6">
				{isLoading ? (
					<Loader />
				) : (
					<>
						<p className="mb-4 text-sm text-muted-foreground">{userName} さんが所属するテナント</p>
						{memberships.length === 0 ? (
							<p className="text-sm">所属しているテナントがありません。</p>
						) : (
							<ul className="grid gap-3 sm:grid-cols-2">
								{memberships.map((membership) => (
									<li key={membership.membershipId}>
										<Link href={getProjectsUrl(membership.tenantId)}>
											<Card className="hover:bg-muted">
												<p className="font-mono text-xs text-muted-foreground">
													{membership.tenantId}
												</p>
												<p className="mt-1 text-sm">ロール: {membership.role}</p>
											</Card>
										</Link>
									</li>
								))}
							</ul>
						)}
					</>
				)}
			</div>
		</div>
	);
}
