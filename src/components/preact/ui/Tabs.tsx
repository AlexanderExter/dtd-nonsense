import { Tab as AriakitTab, TabList as AriakitTabList, TabPanel as AriakitTabPanel, TabProvider } from "@ariakit/react";
import type { ComponentChildren } from "preact";

/**
 * Accessible tab navigation backed by Ariakit Tab. Pair with `<TabPanel>`.
 *
 * ```tsx
 * <Tabs tabs={[{ id: "stats", label: "Stats" }]} activeId={tab} onTabChange={setTab}>
 *   <TabPanel tabId="stats">...</TabPanel>
 * </Tabs>
 * ```
 */

interface TabItem {
	id: string;
	label: string;
}

interface TabsProps {
	tabs: TabItem[];
	activeId: string;
	onTabChange: (id: string) => void;
	children: ComponentChildren;
	class?: string;
}

export function Tabs({ tabs, activeId, onTabChange, children, class: cls }: TabsProps) {
	return (
		<TabProvider
			activeId={activeId}
			setActiveId={(id) => {
				if (id) onTabChange(id);
			}}
		>
			<AriakitTabList
				class={["flex gap-0.5 border-b-2 border-border mb-md overflow-x-auto [scrollbar-width:thin]", cls]
					.filter(Boolean)
					.join(" ")}
			>
				{tabs.map((tab) => (
					<AriakitTab
						key={tab.id}
						id={tab.id}
						class={[
							"px-md py-sm bg-transparent border-0 border-b-2 -mb-[2px] text-[0.9rem] font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 font-[inherit] hover:text-text-primary",
							activeId === tab.id
								? "text-accent border-b-accent"
								: "text-text-muted border-b-transparent",
						]
							.filter(Boolean)
							.join(" ")}
						render={<button type="button" />}
					>
						{tab.label}
					</AriakitTab>
				))}
			</AriakitTabList>
			{children}
		</TabProvider>
	);
}

/**
 * Content panel for a single tab. Must be nested inside `<Tabs>`.
 */

interface TabPanelProps {
	tabId: string;
	children: ComponentChildren;
	class?: string;
}

export function TabPanel({ tabId, children, class: cls }: TabPanelProps) {
	return (
		<AriakitTabPanel tabId={tabId} class={cls}>
			{children}
		</AriakitTabPanel>
	);
}
