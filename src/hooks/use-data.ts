import { signal } from "@preact/signals";
import { loadAllData, loadData } from "@/lib/dtd/data";

export function useData<T>(filename: string) {
	const data = signal<T | null>(null);
	const loading = signal(true);
	const error = signal<string | null>(null);

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

	return { data, loading, error };
}

export function useAllData(filenames: string[]) {
	const data = signal<Record<string, unknown> | null>(null);
	const loading = signal(true);
	const error = signal<string | null>(null);

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

	return { data, loading, error };
}
