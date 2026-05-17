import { Dialog, VisuallyHidden } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button";

interface ModalProps {
	children: ReactNode;
	className?: string;
	maxWidth?: string;
	onClose: () => void;
	open: boolean;
	title?: string;
}

export function Modal({ open, onClose, title, maxWidth = "500px", children, className }: ModalProps) {
	return (
		<Dialog.Root
			onOpenChange={(v) => {
				if (!v) onClose();
			}}
			open={open}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-[200] bg-overlay" />
				<Dialog.Content
					className={cn(
						"fixed top-1/2 left-1/2 z-[201] max-h-[80vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-surface p-xl sm:w-full",
						className,
					)}
					onEscapeKeyDown={() => onClose()}
					style={{ maxWidth }}
				>
					{title ? (
						<div className="mb-md flex items-center justify-between">
							<Dialog.Title className="m-0 text-accent">{title}</Dialog.Title>
							<Dialog.Close asChild>
								<button aria-label="Close" className={buttonVariants({ size: "sm" })} type="button">
									&times;
								</button>
							</Dialog.Close>
						</div>
					) : (
						<VisuallyHidden.Root>
							<Dialog.Title>Dialog</Dialog.Title>
						</VisuallyHidden.Root>
					)}
					<VisuallyHidden.Root>
						<Dialog.Description>Dialog content</Dialog.Description>
					</VisuallyHidden.Root>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
