import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Positioned popover using virtual anchor positioning.
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
	children: ReactNode;
	className?: string;
}

export function Popover({ open, onClose, anchorRect, title, children, className }: PopoverProps) {
	const ref = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onClose();
			}
		}
		function handleEscape(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [open, onClose]);

	if (!open) return null;

	const style: React.CSSProperties = anchorRect
		? { position: "fixed", top: anchorRect.y + anchorRect.height + 4, left: anchorRect.x }
		: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

	return createPortal(
		<div
			ref={ref}
			role="dialog"
			style={style}
			className={[
				"z-[1000] bg-surface-raised border border-border rounded-md p-sm max-h-[240px] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{title && (
				<div className="flex justify-between items-center mb-sm">
					<strong>{title}</strong>
					<button type="button" className="btn btn-sm" aria-label="Close" onClick={onClose}>
						&times;
					</button>
				</div>
			)}
			{children}
		</div>,
		document.body,
	);
}
