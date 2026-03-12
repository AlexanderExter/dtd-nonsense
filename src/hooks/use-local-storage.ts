import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
	const [state, setState] = useState<T>(() => {
		if (typeof window === "undefined") return initial;
		try {
			const stored = localStorage.getItem(key);
			if (stored !== null) return JSON.parse(stored) as T;
		} catch {
			// Corrupted or unparseable — use initial
		}
		return initial;
	});

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			localStorage.setItem(key, JSON.stringify(state));
		} catch {
			// Quota exceeded or unavailable — silently ignore
		}
	}, [key, state]);

	return [state, setState];
}
