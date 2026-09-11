import type { UseFormReturn } from "react-hook-form";
import type { SignInFormSchemaType } from "@/components/auth/sign-in/hooks/use-sign-in-form";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

export type SignInPresentationProps = {
	form: UseFormReturn<SignInFormSchemaType>;
	onSubmit: () => void;
	isSubmitting: boolean;
};

/** Presentation: props で受けたものを描くだけ。フックや API を呼ばない */
export function SignInPresentation({ form, onSubmit, isSubmitting }: SignInPresentationProps) {
	const nameError = form.formState.errors.userId?.message;
	return (
		<main className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<h1 className="mb-1 text-lg font-semibold">taskboard にサインイン</h1>
				<p className="mb-4 text-sm text-muted-foreground">
					ローカル環境ではユーザー ID をそのまま入力します（例: dev-user / dev-guest）。
				</p>
				<form onSubmit={onSubmit} className="flex flex-col gap-3">
					<label htmlFor="sign-in-user-id" className="flex flex-col gap-1 text-sm">
						ユーザー ID
						<Input
							id="sign-in-user-id"
							{...form.register("userId")}
							placeholder="dev-user"
							aria-invalid={!!nameError}
						/>
						{nameError && <span className="text-xs text-destructive">{nameError}</span>}
					</label>
					<Button type="submit" disabled={isSubmitting}>
						サインイン
					</Button>
				</form>
			</Card>
		</main>
	);
}
