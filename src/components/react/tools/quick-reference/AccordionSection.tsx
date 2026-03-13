import type { ReactNode } from "react";

interface AccordionSectionProps {
	id: string;
	title: string;
	count: string;
	isOpen: boolean;
	onToggle: () => void;
	isHidden: boolean;
	children: ReactNode;
}

export function AccordionSection({ id, title, count, isOpen, onToggle, isHidden, children }: AccordionSectionProps) {
	if (isHidden) return null;
	return (
		<div className="border border-border rounded-md mb-md overflow-hidden" id={`section-${id}`}>
			<button
				type="button"
				className="flex items-center gap-md w-full px-lg py-md bg-surface border-none text-text-primary text-base font-semibold text-left cursor-pointer transition-colors duration-150 font-[inherit] hover:bg-surface-raised max-[600px]:px-md max-[600px]:py-sm max-[600px]:text-[0.9rem]"
				aria-expanded={isOpen}
				onClick={onToggle}
			>
				<span
					className={[
						"text-accent shrink-0 inline-block transition-transform duration-200",
						isOpen ? "rotate-90" : "",
					]
						.filter(Boolean)
						.join(" ")}
				>
					▸
				</span>
				{title}
				{count && <span className="ml-auto font-normal text-[0.8rem] text-text-dim">{count}</span>}
			</button>
			<div
				className={["bg-bg border-t border-border", isOpen ? "block p-lg max-[600px]:p-md" : "hidden"]
					.filter(Boolean)
					.join(" ")}
			>
				{children}
			</div>
		</div>
	);
}
