/**
 * DTD Core — barrel re-export for backward compatibility.
 *
 * Prefer importing from specific modules for tree-shaking:
 *   import { derived } from "@/lib/dtd/derived";
 *   import { character } from "@/lib/dtd/character";
 */
export { character } from "./character.ts";
export { loadAllData, loadData } from "./data.ts";
export { derived } from "./derived.ts";
export { initAccordion } from "./ui.ts";
export { debounce, escapeHtml } from "./util.ts";
