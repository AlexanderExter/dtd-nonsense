import type { ReactNode } from "react";

interface DetailPanelProps {
	children: ReactNode;
}

export function DetailPanel({ children }: DetailPanelProps) {
	if (!children) return null;
	return <div className="bg-surface border border-border rounded-md p-lg mt-md empty:hidden">{children}</div>;
}
