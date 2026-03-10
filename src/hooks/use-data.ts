import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { loadAllData, loadData } from "@/lib/dtd/data";

export function useData<T>(filename: string) {
	const data = useSignal<T | null>(null);
	const loading = useSignal(true);
	const error = useSignal<string | null>(null);

	useEffect(() => {
		loading.value = true;
		error.value = null;
		loadData<T>(filename)
			.then((result) => {
				data.value = result;
			})
			.catch((err: unknown) => {
				error.value = err instanceof Error ? err.message : String(err);
			})
			.finally(() => {
				loading.value = false;
			});
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
		loading.value = true;
		error.value = null;
		loadAllData(filenames)
			.then((result) => {
				data.value = result;
			})
			.catch((err: unknown) => {
				error.value = err instanceof Error ? err.message : String(err);
			})
			.finally(() => {
				loading.value = false;
			});
	}, [key]);

	return { data, loading, error };
}
