/**
 * DTD Core — barrel re-export for backward compatibility.
 *
 * Prefer importing from specific modules for tree-shaking:
 *   import { derived } from "@/lib/dtd/derived";
 *   import { character } from "@/lib/dtd/character";
 */
export { character } from "./character.js";
export { loadAllData, loadData } from "./data.js";
export { derived } from "./derived.js";
export { initAccordion } from "./ui.js";
export { debounce, escapeHtml } from "./util.js";
