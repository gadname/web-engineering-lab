import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signInFormSchema = z.object({
	userId: z.string().trim().min(1, { message: "ユーザー ID を入力してください" }),
});

export type SignInFormSchemaType = z.infer<typeof signInFormSchema>;

/** フォームの定義（スキーマ・既定値・resolver）をコンポーネントから分離する */
export const useSignInForm = () =>
	useForm<SignInFormSchemaType>({
		defaultValues: { userId: "" },
		resolver: zodResolver(signInFormSchema),
		mode: "onBlur",
	});
