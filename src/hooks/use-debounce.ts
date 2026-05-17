import { useEffect, useState } from "react";

/**
 * Debounces a value. Returns the debounced value which updates `delay` ms
 * after the last change to the input value.
 *
 * ```tsx
 * const [input, setInput] = useState("");
 * const debouncedInput = useDebounce(input, 300);
 * // debouncedInput updates 300ms after typing stops
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}
