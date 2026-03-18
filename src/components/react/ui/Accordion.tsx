import { Collapsible } from "radix-ui";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
	title: string;
	count?: string;
	defaultOpen?: boolean;
	open?: boolean;
	onToggle?: () => void;
	children: ReactNode;
	className?: string;
}

export function AccordionItem({
	title,
	count,
	defaultOpen = false,
	open,
	onToggle,
	children,
	className,
}: AccordionItemProps) {
	const isControlled = open !== undefined && onToggle !== undefined;
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const isOpen = isControlled ? open : uncontrolledOpen;

	return (
		<Collapsible.Root
			open={isOpen}
			onOpenChange={(v) => {
				if (isControlled) {
					if (v !== open) onToggle();
				} else {
					setUncontrolledOpen(v);
				}
			}}
		>
			<div className={cn("border border-border rounded-md mb-md overflow-hidden", className)}>
				<Collapsible.Trigger asChild>
					<button
						type="button"
						className="flex items-center gap-md w-full px-lg py-md bg-surface border-none text-text-primary text-base font-semibold text-left cursor-pointer transition-colors duration-150 font-[inherit] hover:bg-surface-raised max-[600px]:px-md max-[600px]:py-sm max-[600px]:text-[0.9rem]"
					>
						<span
							className={cn(
								"text-accent shrink-0 inline-block transition-transform duration-200",
								isOpen && "rotate-90",
							)}
						>
							▸
						</span>
						{title}
						{count && <span className="ml-auto font-normal text-[0.8rem] text-text-dim">{count}</span>}
					</button>
				</Collapsible.Trigger>
				<Collapsible.Content className="bg-bg border-t border-border p-lg max-[600px]:p-md">
					{children}
				</Collapsible.Content>
			</div>
		</Collapsible.Root>
	);
}
