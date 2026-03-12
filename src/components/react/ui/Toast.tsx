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
	message: string;
	duration: number;
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

/** Dismiss the current toast immediately. */
export function dismissToast(): void {
	if (toastTimer) clearTimeout(toastTimer);
	toastState = null;
	toastTimer = null;
	emitChange();
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
			className="fixed bottom-lg left-1/2 -translate-x-1/2 bg-surface-raised border border-border rounded-md px-lg py-sm text-text-primary text-[0.85rem] z-[100] animate-slide-in"
			aria-live="polite"
		>
			{state.message}
		</output>
	);
}
