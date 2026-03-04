/**
 * DTD UI — shared DOM interaction helpers for tool pages.
 *
 * Prefer importing directly for tree-shaking:
 *   import { initAccordion } from "@/lib/dtd/ui";
 */

/** Initialize accordion behavior. */
export function initAccordion(container: Element): void {
	const items = container.querySelectorAll(".accordion-item");
	items.forEach((item) => {
		const header = item.querySelector(".accordion-header");
		header?.addEventListener("click", () => {
			item.classList.toggle("open");
		});
	});
}
