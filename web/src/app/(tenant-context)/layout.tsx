import { TenantContextLayout } from "@/page-components/tenant-context/layouts/layout";

export default function Layout({ children }: { children: React.ReactNode }) {
	return <TenantContextLayout>{children}</TenantContextLayout>;
}
