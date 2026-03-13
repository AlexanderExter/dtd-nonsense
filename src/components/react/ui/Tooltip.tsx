import { Tooltip as RadixTooltip } from "radix-ui";
import type { ReactNode } from "react";

/**
 * Accessible tooltip backed by Radix. Wraps children with hover/focus trigger.
 *
 * ```tsx
 * <Tooltip content="Hit Points">
 *   <span>HP</span>
 * </Tooltip>
 * ```
 */

interface TooltipProps {
	content: string;
	children: ReactNode;
	placement?: "top" | "bottom" | "left" | "right";
	className?: string;
}

export function Tooltip({ content, children, placement = "top", className }: TooltipProps) {
	return (
		<RadixTooltip.Provider>
			<RadixTooltip.Root>
				<RadixTooltip.Trigger asChild>
					<span className="inline-flex">{children}</span>
				</RadixTooltip.Trigger>
				<RadixTooltip.Portal>
					<RadixTooltip.Content
						side={placement}
						sideOffset={4}
						className={[
							"z-[1100] bg-surface-raised border border-border rounded-sm px-sm py-xs text-[0.78rem] text-text-primary shadow-[0_2px_8px_rgba(0,0,0,0.4)] max-w-[280px]",
							className,
						]
							.filter(Boolean)
							.join(" ")}
					>
						{content}
					</RadixTooltip.Content>
				</RadixTooltip.Portal>
			</RadixTooltip.Root>
		</RadixTooltip.Provider>
	);
}
