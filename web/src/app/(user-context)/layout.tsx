import { UserContextLayout } from "@/page-components/user-context/layouts/layout";

export default function Layout({ children }: { children: React.ReactNode }) {
	return <UserContextLayout>{children}</UserContextLayout>;
}
