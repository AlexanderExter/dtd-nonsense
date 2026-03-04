/**
 * DTD Data — runtime JSON data loading from the /data/ public directory.
 *
 * Prefer importing directly for tree-shaking:
 *   import { loadData, loadAllData } from "@/lib/dtd/data";
 */

/**
 * Load JSON data from the /data/ folder (Astro public dir).
 * @param {string} filename - Name of the JSON file (e.g., 'races.json')
 * @returns {Promise<any>} Parsed JSON data
 */
export async function loadData<T = unknown>(filename: string): Promise<T> {
	const response = await fetch(`/data/${filename}`);
	if (!response.ok) {
		throw new Error(`Failed to load ${filename}: ${response.status}`);
	}
	return response.json() as Promise<T>;
}

/**
 * Load multiple data files in parallel.
 * @param {string[]} filenames - Array of JSON filenames
 * @returns {Promise<Object>} Object with filename (without .json) as key
 */
export async function loadAllData(filenames: string[]): Promise<Record<string, unknown>> {
	const results = await Promise.all(filenames.map((f) => loadData(f)));
	const data: Record<string, unknown> = {};
	filenames.forEach((f, i) => {
		const key = f.replace(".json", "");
		data[key] = results[i];
	});
	return data;
}
