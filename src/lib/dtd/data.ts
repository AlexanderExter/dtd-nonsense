/**
 * DTD Data — runtime JSON data loading from the /data/ public directory.
 *
 * Prefer importing directly for tree-shaking:
 *   import { loadData, loadAllData } from "@/lib/dtd/data";
 */

/**
 * Load JSON data from the /data/ folder (Astro public dir).
 * @param {string} filename - Name of the JSON file (e.g., 'races.json')
 * @param {AbortSignal} [signal] - Optional abort signal for cancellation
 * @returns {Promise<any>} Parsed JSON data
 */
export async function loadData<T = unknown>(filename: string, signal?: AbortSignal): Promise<T> {
	const url = `/data/${filename}`;
	const response = signal ? await fetch(url, { signal }) : await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to load ${filename}: ${response.status}`);
	}
	return response.json() as Promise<T>;
}

/**
 * Load multiple data files in parallel.
 * @param {string[]} filenames - Array of JSON filenames
 * @param {AbortSignal} [signal] - Optional abort signal for cancellation
 * @returns {Promise<Object>} Object with filename (without .json) as key
 */
export async function loadAllData(filenames: string[], signal?: AbortSignal): Promise<Record<string, unknown>> {
	const results = await Promise.all(filenames.map((f) => loadData(f, signal)));
	const data: Record<string, unknown> = {};
	filenames.forEach((f, i) => {
		const key = f.replace(".json", "");
		data[key] = results[i];
	});
	return data;
}
