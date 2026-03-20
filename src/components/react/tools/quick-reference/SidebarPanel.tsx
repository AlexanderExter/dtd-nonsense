import type { ReactNode } from "react";

interface SidebarPanelProps {
	children: ReactNode;
	title: string;
}

export function SidebarPanel({ title, children }: SidebarPanelProps) {
	return (
		<div className="mb-md rounded-md border border-border bg-surface p-md">
			<h3 className="m-0 mb-sm text-[0.9rem] text-accent uppercase tracking-[0.04em]">{title}</h3>
			{children}
		</div>
	);
}
