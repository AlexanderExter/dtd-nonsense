/**
 * Test wrapper for rendering React components that depend on Zustand stores.
 *
 * Zustand stores are module-level singletons, so tests need to reset state
 * between runs. This utility provides helpers for that pattern.
 *
 * Usage:
 *   import { renderWithCleanup } from ".../render-with-store";
 *   import { useMyStore } from "./store";
 *
 *   afterEach(() => cleanup());
 *
 *   it("renders", () => {
 *     // Pre-set store state before rendering
 *     useMyStore.setState({ someField: "value" });
 *     const { getByText } = renderWithCleanup(<MyComponent />);
 *     expect(getByText("value")).toBeTruthy();
 *   });
 */

import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render, cleanup as rtlCleanup } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Render a React element and return the Testing Library result.
 * Automatically cleans up on subsequent calls.
 */
export function renderWithCleanup(ui: ReactElement, options?: Omit<RenderOptions, "queries">): RenderResult {
	return render(ui, options);
}

/** Re-export cleanup for afterEach hooks. */
export { rtlCleanup as cleanup };
