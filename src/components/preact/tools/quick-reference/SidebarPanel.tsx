import type { ComponentChildren } from "preact";

interface SidebarPanelProps {
	title: string;
	children: ComponentChildren;
}

export function SidebarPanel({ title, children }: SidebarPanelProps) {
	return (
		<div class="sidebar-panel">
			<h3>{title}</h3>
			{children}
		</div>
	);
}
