import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AccordionSectionProps {
	children: ReactNode;
	count: string;
	id: string;
	isHidden: boolean;
	isOpen: boolean;
	onToggle: () => void;
	title: string;
}

export function AccordionSection({ id, title, count, isOpen, onToggle, isHidden, children }: AccordionSectionProps) {
	if (isHidden) return null;
	return (
		<div className="mb-md overflow-hidden rounded-md border border-border" id={`section-${id}`}>
			<button
				aria-expanded={isOpen}
				className="flex w-full cursor-pointer items-center gap-md border-none bg-surface px-lg py-md text-left font-[inherit] font-semibold text-base text-text-primary transition-colors duration-150 hover:bg-surface-raised max-[600px]:px-md max-[600px]:py-sm max-[600px]:text-[0.9rem]"
				onClick={onToggle}
				type="button"
			>
				<span
					className={cn(
						"inline-block shrink-0 text-accent transition-transform duration-200",
						isOpen ? "rotate-90" : "",
					)}
				>
					▸
				</span>
				{title}
				{count && <span className="ml-auto font-normal text-[0.8rem] text-text-dim">{count}</span>}
			</button>
			<div className={cn("border-border border-t bg-bg", isOpen ? "block p-lg max-[600px]:p-md" : "hidden")}>
				{children}
			</div>
		</div>
	);
}
