import { cn } from "@/shared/lib/style";

export function Loader({ className }: { className?: string }) {
	return (
		<output
			aria-label="読み込み中"
			className={cn(
				"inline-block size-6 animate-spin rounded-full border-2 border-border border-t-primary",
				className
			)}
		/>
	);
}
