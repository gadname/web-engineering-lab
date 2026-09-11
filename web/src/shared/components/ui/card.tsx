import type React from "react";
import { cn } from "@/shared/lib/style";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("rounded-lg border border-border bg-card p-4 shadow-sm", className)} {...props} />;
}
