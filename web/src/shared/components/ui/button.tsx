import type React from "react";
import { cn } from "@/shared/lib/style";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "outline" | "destructive";
};

/** shadcn の Button の最小版。variant で見た目だけを切り替える */
export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
	return (
		<button
			type={type}
			className={cn(
				"inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
				variant === "primary" && "bg-primary text-primary-foreground hover:opacity-90",
				variant === "outline" && "border border-border bg-transparent hover:bg-muted",
				variant === "destructive" && "bg-destructive text-primary-foreground hover:opacity-90",
				className
			)}
			{...props}
		/>
	);
}
