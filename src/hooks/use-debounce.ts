import { effect, type Signal, signal } from "@preact/signals";

export function useDebouncedSignal<T>(source: Signal<T>, delay = 300) {
	const debounced = signal<T>(source.value);

	effect(() => {
		const value = source.value;
		const timer = setTimeout(() => {
			debounced.value = value;
		}, delay);
		return () => clearTimeout(timer);
	});

	return debounced;
}
