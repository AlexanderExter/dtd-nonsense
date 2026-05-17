import { useEffect, useState } from "react";
import { loadAllData } from "@/lib/dtd/data";
import type { GameDataMap, GameDataResult } from "@/lib/dtd/schemas";

export function useAllData<T extends (keyof GameDataMap)[]>(filenames: [...T]) {
	const [data, setData] = useState<GameDataResult<T> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Stable key from filenames array to avoid re-fetching on every render
	const key = filenames.join(",");

	// biome-ignore lint/correctness/useExhaustiveDependencies: key is a stable string derived from filenames — using filenames directly would re-trigger on every render since arrays are new references
	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);
		loadAllData(filenames, controller.signal)
			.then((result) => {
				setData(result as GameDataResult<T>);
			})
			.catch((err: unknown) => {
				if (err instanceof DOMException && err.name === "AbortError") return;
				setError(err instanceof Error ? err.message : String(err));
			})
			.finally(() => {
				setLoading(false);
			});
		return () => controller.abort();
	}, [key]);

	return { data, loading, error };
}
