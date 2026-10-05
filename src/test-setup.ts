/**
 * Global test setup — preloaded by bun:test via bunfig.toml.
 *
 * Installs jsdom as the global DOM environment so React Testing Library
 * and component tests can render in a browser-like context.
 * Also registers @testing-library/jest-dom matchers (e.g. toBeInTheDocument).
 *
 * Non-DOM tests (dice, schemas, pipeline scripts) are unaffected — they
 * simply ignore the global DOM objects.
 */

import { expect } from "bun:test";
import { JSDOM } from "jsdom";

// ---------------------------------------------------------------------------
// jsdom environment — only set up if no document exists yet
// ---------------------------------------------------------------------------
if (typeof globalThis.document === "undefined") {
	const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
		url: "http://localhost",
		pretendToBeVisual: true,
	});

	// Populate the globals React and Testing Library expect.
	// Exclude timer functions (setTimeout, etc.) — Bun provides these natively
	// and jsdom's wrappers cause infinite recursion with Bun's runtime.
	const globals = {
		window: dom.window,
		document: dom.window.document,
		navigator: dom.window.navigator,
		HTMLElement: dom.window.HTMLElement,
		HTMLInputElement: dom.window.HTMLInputElement,
		HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
		HTMLSelectElement: dom.window.HTMLSelectElement,
		HTMLButtonElement: dom.window.HTMLButtonElement,
		HTMLFormElement: dom.window.HTMLFormElement,
		HTMLAnchorElement: dom.window.HTMLAnchorElement,
		Element: dom.window.Element,
		Node: dom.window.Node,
		Event: dom.window.Event,
		KeyboardEvent: dom.window.KeyboardEvent,
		MouseEvent: dom.window.MouseEvent,
		CustomEvent: dom.window.CustomEvent,
		MutationObserver: dom.window.MutationObserver,
		SVGElement: dom.window.SVGElement,
		NodeFilter: dom.window.NodeFilter,
		TreeWalker: dom.window.TreeWalker,
		Range: dom.window.Range,
		getComputedStyle: dom.window.getComputedStyle,
		requestAnimationFrame: dom.window.requestAnimationFrame,
		cancelAnimationFrame: dom.window.cancelAnimationFrame,
		DOMParser: dom.window.DOMParser,
		XMLSerializer: dom.window.XMLSerializer,
		ResizeObserver: dom.window.ResizeObserver,
		IntersectionObserver: dom.window.IntersectionObserver,
	};

	for (const [key, value] of Object.entries(globals)) {
		if (value !== undefined) {
			(globalThis as Record<string, unknown>)[key] = value;
		}
	}
}

// ---------------------------------------------------------------------------
// @testing-library/jest-dom custom matchers
// ---------------------------------------------------------------------------
// Imported dynamically, after the jsdom globals exist: jest-dom pulls in
// @testing-library/dom, whose `screen` binds to `document.body` at load time.
// A static import would be hoisted above the setup and leave `screen` unbound.
// (`default` is a CJS-interop key in the types only; it is not a matcher.)
const { default: _interop, ...matchers } = await import("@testing-library/jest-dom/matchers");
expect.extend(matchers);
