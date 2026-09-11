import type React from "react";

export type HeaderBreadcrumb = { label: string; href?: string };

type HeaderProps = {
	breadcrumbs: HeaderBreadcrumb[];
	actions?: React.ReactNode;
};

/** 画面上部のパンくずと操作ボタン。見た目だけを持ち、状態は持たない */
export function Header({ breadcrumbs, actions }: HeaderProps) {
	return (
		<header className="flex items-center justify-between border-b border-border px-6 py-3">
			<nav aria-label="パンくず" className="flex items-center gap-2 text-sm">
				{breadcrumbs.map((crumb, index) => (
					<span key={crumb.label} className="flex items-center gap-2">
						{index > 0 && <span className="text-muted-foreground">/</span>}
						{crumb.href ? (
							<a href={crumb.href} className="text-muted-foreground hover:underline">
								{crumb.label}
							</a>
						) : (
							<span className="font-semibold">{crumb.label}</span>
						)}
					</span>
				))}
			</nav>
			{actions && <div className="flex items-center gap-2">{actions}</div>}
		</header>
	);
}
