/**
 * DTD Util — small, dependency-free helper functions.
 *
 * Prefer importing directly for tree-shaking:
 *   import { debounce, escapeHtml } from "@/lib/dtd/util";
 */

/** Debounce function for search/filter inputs. */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 300): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delay);
	};
}

/** Escape HTML to prevent XSS. */
export function escapeHtml(str: string): string {
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}
