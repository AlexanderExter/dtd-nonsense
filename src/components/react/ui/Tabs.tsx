import { Tabs as RadixTabs } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
	id: string;
	label: string;
}

interface TabsProps {
	activeId: string;
	children: ReactNode;
	className?: string;
	onTabChange: (id: string) => void;
	tabs: TabItem[];
}

export function Tabs({ tabs, activeId, onTabChange, children, className }: TabsProps) {
	return (
		<RadixTabs.Root onValueChange={onTabChange} value={activeId}>
			<RadixTabs.List
				className={cn(
					"mb-md flex gap-0.5 overflow-x-auto border-border border-b-2 [scrollbar-width:thin]",
					className,
				)}
			>
				{tabs.map((tab) => (
					<RadixTabs.Trigger
						className={cn(
							"-mb-[2px] cursor-pointer whitespace-nowrap border-0 border-b-2 bg-transparent px-md py-sm font-[inherit] font-semibold text-sm transition-all duration-150 hover:text-text-primary",
							activeId === tab.id
								? "border-b-accent text-accent"
								: "border-b-transparent text-text-muted",
						)}
						key={tab.id}
						value={tab.id}
					>
						{tab.label}
					</RadixTabs.Trigger>
				))}
			</RadixTabs.List>
			{children}
		</RadixTabs.Root>
	);
}

interface TabContentProps {
	children: ReactNode;
	className?: string;
	value: string;
}

export function TabContent({ value, children, className }: TabContentProps) {
	return (
		<RadixTabs.Content className={className} forceMount={false} value={value}>
			{children}
		</RadixTabs.Content>
	);
}
