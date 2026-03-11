import { signal } from "@preact/signals";

/**
 * Signal-driven toast notification system. Call `showToast(msg)` from anywhere;
 * mount `<Toast />` once in the root App component.
 *
 * ```tsx
 * // Trigger:
 * showToast("Saved!");
 *
 * // Mount once in *App.tsx:
 * <Toast />
 * ```
 */

interface ToastState {
	message: string;
	duration: number;
}

const toastState = signal<ToastState | null>(null);

let toastTimer: ReturnType<typeof setTimeout> | null = null;

/** Show a toast message. Auto-dismisses after `duration` ms (default 2500). */
export function showToast(message: string, duration = 2500): void {
	if (toastTimer) clearTimeout(toastTimer);
	toastState.value = { message, duration };
	toastTimer = setTimeout(() => {
		toastState.value = null;
		toastTimer = null;
	}, duration);
}

/** Dismiss the current toast immediately. */
export function dismissToast(): void {
	if (toastTimer) clearTimeout(toastTimer);
	toastState.value = null;
	toastTimer = null;
}

/**
 * Toast renderer — mount once per tool page in the root *App.tsx.
 * Reads from the shared `toastState` signal.
 */

export function Toast() {
	const state = toastState.value;
	if (!state) return null;

	return (
		<output
			class="fixed bottom-lg left-1/2 -translate-x-1/2 bg-surface-raised border border-border rounded-md px-lg py-sm text-text-primary text-[0.85rem] z-[100] animate-slide-in"
			aria-live="polite"
		>
			{state.message}
		</output>
	);
}
