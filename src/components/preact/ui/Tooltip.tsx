import { Tooltip as AriakitTooltip, TooltipAnchor, TooltipProvider } from "@ariakit/react";
import type { ComponentChildren } from "preact";

/**
 * Accessible tooltip backed by Ariakit. Wraps children with hover/focus trigger.
 *
 * ```tsx
 * <Tooltip content="Hit Points">
 *   <span>HP</span>
 * </Tooltip>
 * ```
 */

interface TooltipProps {
	content: string;
	children: ComponentChildren;
	placement?: "top" | "bottom" | "left" | "right";
	class?: string;
}

export function Tooltip({ content, children, placement = "top", class: cls }: TooltipProps) {
	return (
		<TooltipProvider placement={placement}>
			<TooltipAnchor render={<span class="inline-flex" />}>{children}</TooltipAnchor>
			<AriakitTooltip
				class={[
					"z-[1100] bg-surface-raised border border-border rounded-sm px-sm py-xs text-[0.78rem] text-text-primary shadow-[0_2px_8px_rgba(0,0,0,0.4)] max-w-[280px]",
					cls,
				]
					.filter(Boolean)
					.join(" ")}
			>
				{content}
			</AriakitTooltip>
		</TooltipProvider>
	);
}
