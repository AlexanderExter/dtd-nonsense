import type { ComponentChildren } from "preact";

interface SidebarPanelProps {
	title: string;
	children: ComponentChildren;
}

export function SidebarPanel({ title, children }: SidebarPanelProps) {
	return (
		<div class="bg-surface border border-border rounded-md p-md mb-md">
			<h3 class="text-accent text-[0.9rem] m-0 mb-sm uppercase tracking-[0.04em]">{title}</h3>
			{children}
		</div>
	);
}
