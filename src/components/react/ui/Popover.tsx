import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

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
			className={cn(
				"z-[1000] max-h-[240px] overflow-y-auto rounded-md border border-border bg-surface-raised p-sm shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
				className,
			)}
			ref={ref}
			role="dialog"
			style={style}
		>
			{title && (
				<div className="mb-sm flex items-center justify-between">
					<strong>{title}</strong>
					<button aria-label="Close" className="btn btn-sm" onClick={onClose} type="button">
						&times;
					</button>
				</div>
			)}
			{children}
		</div>,
		document.body,
	);
}
