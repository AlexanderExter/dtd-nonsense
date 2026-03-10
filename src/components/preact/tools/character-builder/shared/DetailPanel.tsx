import type { ComponentChildren } from "preact";

interface DetailPanelProps {
	children: ComponentChildren;
}

export function DetailPanel({ children }: DetailPanelProps) {
	if (!children) return null;
	return <div class="detail-panel">{children}</div>;
}
