import { Collapsible } from "radix-ui";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
	children: ReactNode;
	className?: string;
	count?: string;
	defaultOpen?: boolean;
	onToggle?: () => void;
	open?: boolean;
	title: string;
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
			onOpenChange={(v) => {
				if (isControlled) {
					if (v !== open) onToggle();
				} else {
					setUncontrolledOpen(v);
				}
			}}
			open={isOpen}
		>
			<div className={cn("mb-md overflow-hidden rounded-md border border-border", className)}>
				<Collapsible.Trigger asChild>
					<button
						className="flex w-full cursor-pointer items-center gap-md border-none bg-surface px-lg py-md text-left font-[inherit] font-semibold text-base text-text-primary transition-colors duration-150 hover:bg-surface-raised max-[600px]:px-md max-[600px]:py-sm max-[600px]:text-[0.9rem]"
						type="button"
					>
						<span
							className={cn(
								"inline-block shrink-0 text-accent transition-transform duration-200",
								isOpen && "rotate-90",
							)}
						>
							▸
						</span>
						{title}
						{count && <span className="ml-auto font-normal text-[0.8rem] text-text-dim">{count}</span>}
					</button>
				</Collapsible.Trigger>
				<Collapsible.Content className="border-border border-t bg-bg p-lg max-[600px]:p-md">
					{children}
				</Collapsible.Content>
			</div>
		</Collapsible.Root>
	);
}
