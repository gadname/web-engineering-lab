"use client";

import type React from "react";
import { createContext, useCallback, useState } from "react";
import { cn } from "@/shared/lib/style";

export type Toast = { id: number; variant: "success" | "error"; title: string; description?: string };
export type ToastInput = Omit<Toast, "id" | "variant">;

export const ToastContext = createContext(
	{} as {
		showSuccessToast: (toast: ToastInput) => void;
		showErrorToast: (toast: ToastInput) => void;
	}
);

const TOAST_DURATION_MS = 4000;

/** 画面右下に通知を積む。shadcn の Toaster の最小版 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const push = useCallback((variant: Toast["variant"], input: ToastInput) => {
		const id = Date.now() + Math.random();
		setToasts((prev) => [...prev, { id, variant, ...input }]);
		setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_DURATION_MS);
	}, []);

	const showSuccessToast = useCallback((input: ToastInput) => push("success", input), [push]);
	const showErrorToast = useCallback((input: ToastInput) => push("error", input), [push]);

	return (
		<ToastContext.Provider value={{ showSuccessToast, showErrorToast }}>
			{children}
			<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
				{toasts.map((toast) => (
					<output
						key={toast.id}
						className={cn(
							"min-w-64 rounded-md border px-4 py-3 text-sm shadow-lg bg-card",
							toast.variant === "error" ? "border-destructive" : "border-border"
						)}
					>
						<p className="font-semibold">{toast.title}</p>
						{toast.description && (
							<p className="text-muted-foreground whitespace-pre-line">{toast.description}</p>
						)}
					</output>
				))}
			</div>
		</ToastContext.Provider>
	);
}
