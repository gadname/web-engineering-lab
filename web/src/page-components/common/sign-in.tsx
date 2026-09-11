import { SignIn as SignInComponent } from "@/components/auth/sign-in";

/** page-components はページの実体。app/ の page.tsx はこれを返すだけにする */
export function SignIn() {
	return <SignInComponent />;
}
