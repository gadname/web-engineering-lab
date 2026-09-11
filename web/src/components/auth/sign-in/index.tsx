"use client";

import { useRouter } from "next/navigation";
import { useSignInForm } from "@/components/auth/sign-in/hooks/use-sign-in-form";
import { SignInPresentation } from "@/components/auth/sign-in/presentation";
import { usePage } from "@/shared/hooks/use-page";
import { setCookie } from "@/shared/lib/cookie";

/**
 * Container: 状態と副作用を担当する。
 * ローカル認証は「ユーザー ID を Cookie に置く」だけ。IdP 連携時はここを差し替える。
 */
export function SignIn() {
	const router = useRouter();
	const { page } = usePage();
	const form = useSignInForm();

	const onSubmit = form.handleSubmit(({ userId }) => {
		setCookie("userId", userId);
		router.push(page.USER_CONTEXT.USER_TENANTS_PAGE.URL({ userId }));
	});

	return <SignInPresentation form={form} onSubmit={onSubmit} isSubmitting={form.formState.isSubmitting} />;
}
