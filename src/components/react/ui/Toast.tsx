import { useSyncExternalStore } from "react";

/**
 * Zustand-lite toast notification system. Call `showToast(msg)` from anywhere;
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
	duration: number;
	message: string;
}

let toastState: ToastState | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emitChange() {
	for (const l of listeners) l();
}

/** Show a toast message. Auto-dismisses after `duration` ms (default 2500). */
export function showToast(message: string, duration = 2500): void {
	if (toastTimer) clearTimeout(toastTimer);
	toastState = { message, duration };
	emitChange();
	toastTimer = setTimeout(() => {
		toastState = null;
		toastTimer = null;
		emitChange();
	}, duration);
}

function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}
function getSnapshot() {
	return toastState;
}

/**
 * Toast renderer — mount once per tool page in the root *App.tsx.
 */
export function Toast() {
	const state = useSyncExternalStore(subscribe, getSnapshot, () => null);
	if (!state) return null;

	return (
		<output
			aria-live="polite"
			className="fixed bottom-lg left-1/2 z-[100] -translate-x-1/2 animate-slide-in rounded-md border border-border bg-surface-raised px-lg py-sm text-[0.85rem] text-text-primary"
		>
			{state.message}
		</output>
	);
}
