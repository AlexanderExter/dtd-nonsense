/**
 * Reusable fetch mock for tests that call loadData / loadAllData.
 *
 * Usage:
 *   import { installMockFetch } from ".../mock-fetch";
 *
 *   let restore: () => void;
 *   beforeEach(() => {
 *     restore = installMockFetch({
 *       "skills.json": [{ name: "Acrobatics" }],
 *       "races.json":  [{ name: "Human" }],
 *     });
 *   });
 *   afterEach(() => { restore(); });
 */

import { mock } from "bun:test";

/**
 * Install a mock globalThis.fetch that responds based on a filename→data map.
 * Any URL containing a key from the map returns `{ ok: true, json() }`.
 * Unmatched URLs return `{ ok: false, status: 404 }`.
 *
 * Returns a cleanup function that restores the original fetch.
 */
export function installMockFetch(dataMap: Record<string, unknown>): () => void {
	const original = (globalThis as Record<string, unknown>).fetch;

	(globalThis as Record<string, unknown>).fetch = mock((url: string | URL | Request) => {
		const urlStr = typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
		for (const [filename, data] of Object.entries(dataMap)) {
			if (urlStr.includes(filename)) {
				return Promise.resolve({
					ok: true,
					status: 200,
					json: () => Promise.resolve(data),
				});
			}
		}
		return Promise.resolve({ ok: false, status: 404 });
	});

	return () => {
		(globalThis as Record<string, unknown>).fetch = original;
	};
}
