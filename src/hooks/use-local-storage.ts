import { effect, signal } from "@preact/signals";

export function useLocalStorage<T>(key: string, initial: T) {
	let startValue = initial;
	if (typeof window !== "undefined") {
		try {
			const stored = localStorage.getItem(key);
			if (stored !== null) {
				startValue = JSON.parse(stored) as T;
			}
		} catch {
			// Corrupted or unparseable — use initial
		}
	}

	const state = signal<T>(startValue);

	effect(() => {
		if (typeof window === "undefined") return;
		try {
			localStorage.setItem(key, JSON.stringify(state.value));
		} catch {
			// Quota exceeded or unavailable — silently ignore
		}
	});

	return state;
}
