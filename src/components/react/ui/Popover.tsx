import { Popover as RadixPopover } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button";

interface PopoverProps {
	/** Virtual anchor rect for positioning (e.g., from getBoundingClientRect) */
	anchorRect?: { x: number; y: number; width: number; height: number };
	children: ReactNode;
	className?: string;
	onClose: () => void;
	open: boolean;
	title?: string;
}

export function Popover({ open, onClose, anchorRect, title, children, className }: PopoverProps) {
	return (
		<RadixPopover.Root
			onOpenChange={(v) => {
				if (!v) onClose();
			}}
			open={open}
		>
			{/* Invisible positioned anchor for Radix to calculate offsets */}
			<RadixPopover.Anchor asChild>
				<span
					aria-hidden
					style={
						anchorRect
							? {
									position: "fixed",
									top: anchorRect.y,
									left: anchorRect.x,
									width: anchorRect.width,
									height: anchorRect.height,
									pointerEvents: "none",
								}
							: { position: "fixed", top: "50%", left: "50%", pointerEvents: "none" }
					}
				/>
			</RadixPopover.Anchor>
			<RadixPopover.Portal>
				<RadixPopover.Content
					align="start"
					className={cn(
						"z-[1000] max-h-[240px] overflow-y-auto rounded-md border border-border bg-surface-raised p-sm shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
						className,
					)}
					onEscapeKeyDown={() => onClose()}
					onInteractOutside={() => onClose()}
					sideOffset={4}
				>
					{title && (
						<div className="mb-sm flex items-center justify-between">
							<strong>{title}</strong>
							<RadixPopover.Close asChild>
								<button aria-label="Close" className={buttonVariants({ size: "sm" })} type="button">
									&times;
								</button>
							</RadixPopover.Close>
						</div>
					)}
					{children}
				</RadixPopover.Content>
			</RadixPopover.Portal>
		</RadixPopover.Root>
	);
}
