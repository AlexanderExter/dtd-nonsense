import { Toaster, toast } from "sonner";

/**
 * Show a toast message. Wraps sonner's `toast()` for backward-compatible API.
 * Auto-dismisses after `duration` ms (default 2500).
 */
export function showToast(message: string, duration = 2500): void {
	toast(message, { duration });
}

/**
 * Toast renderer — mount once per tool page in the root *App.tsx.
 * Wraps sonner's `<Toaster>` with project-consistent WH40K theming.
 */
export function Toast() {
	return (
		<Toaster
			position="bottom-center"
			toastOptions={{
				className:
					"!border-border !bg-surface-raised !text-text-primary !text-sm !rounded-md !shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
			}}
		/>
	);
}
