import { useEffect, useState } from "react";
import { loadAllData } from "@/lib/dtd/data";

export function useAllData(filenames: string[]) {
	const [data, setData] = useState<Record<string, unknown> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Stable key from filenames array to avoid re-fetching on every render
	const key = filenames.join(",");

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);
		loadAllData(filenames, controller.signal)
			.then((result) => {
				setData(result);
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
