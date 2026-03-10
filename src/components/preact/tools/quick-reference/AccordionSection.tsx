import type { ComponentChildren } from "preact";

interface AccordionSectionProps {
	id: string;
	title: string;
	count: string;
	isOpen: boolean;
	onToggle: () => void;
	isHidden: boolean;
	children: ComponentChildren;
}

export function AccordionSection({ id, title, count, isOpen, onToggle, isHidden, children }: AccordionSectionProps) {
	if (isHidden) return null;
	return (
		<div class={`qref-section${isOpen ? " open" : ""}`} id={`section-${id}`}>
			<button type="button" class="section-header" aria-expanded={isOpen} onClick={onToggle}>
				{title}
				{count && <span class="section-count">{count}</span>}
			</button>
			<div class="section-body">{children}</div>
		</div>
	);
}
