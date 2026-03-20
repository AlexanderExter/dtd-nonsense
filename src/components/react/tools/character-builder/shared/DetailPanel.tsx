import type { ReactNode } from "react";

interface DetailPanelProps {
	children: ReactNode;
}

export function DetailPanel({ children }: DetailPanelProps) {
	if (!children) return null;
	return <div className="mt-md rounded-md border border-border bg-surface p-lg empty:hidden">{children}</div>;
}
