import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

/**
 * Full-screen modal dialog backed by Radix Dialog.
 * Includes backdrop overlay, optional title with close button.
 *
 * ```tsx
 * <Modal open={isOpen} onClose={() => setOpen(false)} title="Import">
 *   <p>Modal content</p>
 * </Modal>
 * ```
 */
interface ModalProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	maxWidth?: string;
	children: ReactNode;
	className?: string;
}

export function Modal({ open, onClose, title, maxWidth = "500px", children, className }: ModalProps) {
	return (
		<Dialog.Root
			open={open}
			onOpenChange={(v) => {
				if (!v) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-[200] bg-overlay" />
				<Dialog.Content
					className={[
						"fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] bg-surface border border-border rounded-lg p-xl w-full max-h-[80vh] overflow-y-auto",
						className,
					]
						.filter(Boolean)
						.join(" ")}
					style={{ maxWidth }}
					onEscapeKeyDown={() => onClose()}
				>
					{title && (
						<div className="flex justify-between items-center mb-md">
							<Dialog.Title className="m-0 text-accent">{title}</Dialog.Title>
							<Dialog.Close asChild>
								<button type="button" className="btn btn-sm" aria-label="Close">
									&times;
								</button>
							</Dialog.Close>
						</div>
					)}
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
