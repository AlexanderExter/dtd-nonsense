import { Dialog as AriakitDialog, DialogDismiss, DialogHeading } from "@ariakit/react";
import type { ComponentChildren } from "preact";

/**
 * Full-screen modal dialog backed by Ariakit Dialog.
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
	children: ComponentChildren;
	class?: string;
}

export function Modal({ open, onClose, title, maxWidth = "500px", children, class: cls }: ModalProps) {
	if (!open) return null;

	return (
		<AriakitDialog
			open={open}
			onClose={onClose}
			backdrop={<div class="fixed inset-0 z-[200] bg-overlay" />}
			class={[
				"fixed inset-0 z-[201] flex items-center justify-center p-lg",
				"[&>*]:bg-surface [&>*]:border [&>*]:border-border [&>*]:rounded-lg [&>*]:p-xl [&>*]:w-full [&>*]:max-h-[80vh] [&>*]:overflow-y-auto",
			].join(" ")}
			render={
				<div class="fixed inset-0 z-[201] flex items-center justify-center p-lg">
					<div
						class={[
							"bg-surface border border-border rounded-lg p-xl w-full max-h-[80vh] overflow-y-auto",
							cls,
						]
							.filter(Boolean)
							.join(" ")}
						style={{ maxWidth }}
					/>
				</div>
			}
		>
			{title && (
				<div class="flex justify-between items-center mb-md">
					<DialogHeading class="m-0 text-accent">{title}</DialogHeading>
					<DialogDismiss class="btn btn-sm" aria-label="Close">
						&times;
					</DialogDismiss>
				</div>
			)}
			{children}
		</AriakitDialog>
	);
}
