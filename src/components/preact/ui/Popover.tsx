import { Popover as AriakitPopover, PopoverDismiss, PopoverProvider } from "@ariakit/react";
import type { ComponentChildren } from "preact";

/**
 * Positioned popover backed by Ariakit, using virtual anchor positioning.
 *
 * ```tsx
 * <Popover open={isOpen} onClose={close} anchorRect={rect} title="Pick">
 *   <ul>...</ul>
 * </Popover>
 * ```
 */

interface PopoverProps {
	open: boolean;
	onClose: () => void;
	/** Virtual anchor rect for positioning (e.g., from getBoundingClientRect) */
	anchorRect?: { x: number; y: number; width: number; height: number };
	title?: string;
	children: ComponentChildren;
	class?: string;
}

export function Popover({ open, onClose, anchorRect, title, children, class: cls }: PopoverProps) {
	if (!open) return null;

	return (
		<PopoverProvider
			open={open}
			setOpen={(v) => {
				if (!v) onClose();
			}}
		>
			<AriakitPopover
				getAnchorRect={() => anchorRect || null}
				gutter={4}
				class={[
					"z-[1000] bg-surface-raised border border-border rounded-md p-sm max-h-[240px] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
					cls,
				]
					.filter(Boolean)
					.join(" ")}
				modal={false}
			>
				{title && (
					<div class="flex justify-between items-center mb-sm">
						<strong>{title}</strong>
						<PopoverDismiss class="btn btn-sm" aria-label="Close">
							&times;
						</PopoverDismiss>
					</div>
				)}
				{children}
			</AriakitPopover>
		</PopoverProvider>
	);
}
