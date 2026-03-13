import type { ReactNode } from "react";

interface SidebarPanelProps {
	title: string;
	children: ReactNode;
}

export function SidebarPanel({ title, children }: SidebarPanelProps) {
	return (
		<div className="bg-surface border border-border rounded-md p-md mb-md">
			<h3 className="text-accent text-[0.9rem] m-0 mb-sm uppercase tracking-[0.04em]">{title}</h3>
			{children}
		</div>
	);
}
