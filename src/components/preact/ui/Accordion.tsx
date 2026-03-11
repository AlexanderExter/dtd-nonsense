import {
	Disclosure as AriakitDisclosure,
	DisclosureContent as AriakitDisclosureContent,
	DisclosureProvider,
} from "@ariakit/react";
import type { ComponentChildren } from "preact";

/**
 * Collapsible section backed by Ariakit Disclosure.
 *
 * Supports both uncontrolled (default) and controlled mode (pass `open` + `onToggle`).
 *
 * ```tsx
 * <AccordionItem title="Details" defaultOpen>
 *   <p>Content here</p>
 * </AccordionItem>
 * ```
 */

interface AccordionItemProps {
	title: string;
	count?: string;
	defaultOpen?: boolean;
	open?: boolean;
	onToggle?: () => void;
	children: ComponentChildren;
	class?: string;
}

export function AccordionItem({
	title,
	count,
	defaultOpen = false,
	open,
	onToggle,
	children,
	class: cls,
}: AccordionItemProps) {
	// Controlled mode when open+onToggle are provided
	const isControlled = open !== undefined && onToggle !== undefined;

	return (
		<DisclosureProvider
			defaultOpen={defaultOpen}
			open={isControlled ? open : undefined}
			setOpen={
				isControlled
					? (v) => {
							if (!v === open) onToggle();
						}
					: undefined
			}
		>
			<div class={["border border-border rounded-md mb-md overflow-hidden", cls].filter(Boolean).join(" ")}>
				<AriakitDisclosure
					class="flex items-center gap-md w-full px-lg py-md bg-surface border-none text-text-primary text-base font-semibold text-left cursor-pointer transition-colors duration-150 font-[inherit] hover:bg-surface-raised max-[600px]:px-md max-[600px]:py-sm max-[600px]:text-[0.9rem]"
					render={<button type="button" />}
				>
					{(props: Record<string, unknown>) => {
						const isOpen = props["aria-expanded"] === true || props["aria-expanded"] === "true";
						return (
							<>
								<span
									class={[
										"text-accent shrink-0 inline-block transition-transform duration-200",
										isOpen ? "rotate-90" : "",
									]
										.filter(Boolean)
										.join(" ")}
								>
									▸
								</span>
								{title}
								{count && <span class="ml-auto font-normal text-[0.8rem] text-text-dim">{count}</span>}
							</>
						);
					}}
				</AriakitDisclosure>
				<AriakitDisclosureContent class="bg-bg border-t border-border p-lg max-[600px]:p-md">
					{children}
				</AriakitDisclosureContent>
			</div>
		</DisclosureProvider>
	);
}
