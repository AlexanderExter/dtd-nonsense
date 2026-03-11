import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { loadAllData, loadData } from "@/lib/dtd/data";

export function useData<T>(filename: string) {
	const data = useSignal<T | null>(null);
	const loading = useSignal(true);
	const error = useSignal<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		loading.value = true;
		error.value = null;
		loadData<T>(filename, controller.signal)
			.then((result) => {
				data.value = result;
			})
			.catch((err: unknown) => {
				if (err instanceof DOMException && err.name === "AbortError") return;
				error.value = err instanceof Error ? err.message : String(err);
			})
			.finally(() => {
				loading.value = false;
			});
		return () => controller.abort();
	}, [filename]);

	return { data, loading, error };
}

export function useAllData(filenames: string[]) {
	const data = useSignal<Record<string, unknown> | null>(null);
	const loading = useSignal(true);
	const error = useSignal<string | null>(null);

	// Stable key from filenames array to avoid re-fetching on every render
	const key = filenames.join(",");

	useEffect(() => {
		const controller = new AbortController();
		loading.value = true;
		error.value = null;
		loadAllData(filenames, controller.signal)
			.then((result) => {
				data.value = result;
			})
			.catch((err: unknown) => {
				if (err instanceof DOMException && err.name === "AbortError") return;
				error.value = err instanceof Error ? err.message : String(err);
			})
			.finally(() => {
				loading.value = false;
			});
		return () => controller.abort();
	}, [key]);

	return { data, loading, error };
}
