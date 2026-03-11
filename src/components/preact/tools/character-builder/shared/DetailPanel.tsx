import type { ComponentChildren } from "preact";

interface DetailPanelProps {
	children: ComponentChildren;
}

export function DetailPanel({ children }: DetailPanelProps) {
	if (!children) return null;
	return <div class="bg-surface border border-border rounded-md p-lg mt-md empty:hidden">{children}</div>;
}
