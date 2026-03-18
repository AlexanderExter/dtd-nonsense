import { Tabs as RadixTabs } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
	id: string;
	label: string;
}

interface TabsProps {
	tabs: TabItem[];
	activeId: string;
	onTabChange: (id: string) => void;
	children: ReactNode;
	className?: string;
}

export function Tabs({ tabs, activeId, onTabChange, children, className }: TabsProps) {
	return (
		<RadixTabs.Root value={activeId} onValueChange={onTabChange}>
			<RadixTabs.List
				className={cn(
					"flex gap-0.5 border-b-2 border-border mb-md overflow-x-auto [scrollbar-width:thin]",
					className,
				)}
			>
				{tabs.map((tab) => (
					<RadixTabs.Trigger
						key={tab.id}
						value={tab.id}
						className={cn(
							"px-md py-sm bg-transparent border-0 border-b-2 -mb-[2px] text-[0.9rem] font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 font-[inherit] hover:text-text-primary",
							activeId === tab.id
								? "text-accent border-b-accent"
								: "text-text-muted border-b-transparent",
						)}
					>
						{tab.label}
					</RadixTabs.Trigger>
				))}
			</RadixTabs.List>
			{children}
		</RadixTabs.Root>
	);
}
