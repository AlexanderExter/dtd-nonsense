import { signal } from "@preact/signals";

export function useWorker<T = unknown>(workerUrl: URL) {
	const result = signal<T | null>(null);
	const loading = signal(false);

	let worker: Worker | null = null;
	let nextId = 1;
	const pending = new Map<number, { resolve: (v: T) => void; reject: (e: Error) => void }>();

	function ensureWorker() {
		if (worker) return worker;
		worker = new Worker(workerUrl, { type: "module" });
		worker.onmessage = (e: MessageEvent) => {
			const { id, ...rest } = e.data;
			const entry = pending.get(id);
			if (!entry) return;
			pending.delete(id);
			entry.resolve(rest as T);
			// Update signal with latest result
			result.value = rest as T;
			if (pending.size === 0) loading.value = false;
		};
		worker.onerror = (e) => {
			pending.forEach((entry) => {
				entry.reject(new Error(e.message));
			});
			pending.clear();
			loading.value = false;
		};
		return worker;
	}

	function run(input: Record<string, unknown>): Promise<T> {
		const w = ensureWorker();
		const id = nextId++;
		loading.value = true;
		return new Promise<T>((resolve, reject) => {
			pending.set(id, { resolve, reject });
			w.postMessage({ id, ...input });
		});
	}

	function cleanup() {
		if (worker) {
			worker.terminate();
			worker = null;
		}
		for (const entry of pending.values()) {
			entry.reject(new Error("Worker disposed"));
		}
		pending.clear();
		loading.value = false;
	}

	return { result, loading, run, cleanup };
}
