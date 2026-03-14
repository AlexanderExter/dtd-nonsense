import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { showToast, Toast } from "../Toast";

// Toast uses module-level state, so we need to reset between tests.
// We also need to control timers for the auto-dismiss behavior.

beforeEach(() => {
	jest.useFakeTimers();
});

afterEach(() => {
	// Dismiss any active toast by advancing timers
	act(() => jest.runAllTimers());
	jest.useRealTimers();
	cleanup();
});

describe("Toast", () => {
	it("renders nothing when no toast is active", () => {
		const { container } = render(<Toast />);
		expect(container.querySelector("output")).toBeNull();
	});

	it("renders the message when showToast is called", () => {
		render(<Toast />);
		act(() => showToast("Saved!"));
		expect(screen.getByText("Saved!")).toBeTruthy();
	});

	it("renders with aria-live='polite' for accessibility", () => {
		render(<Toast />);
		act(() => showToast("Hello"));
		const el = screen.getByText("Hello");
		expect(el.getAttribute("aria-live")).toBe("polite");
	});

	it("auto-dismisses after the default duration", () => {
		render(<Toast />);
		act(() => showToast("Temporary"));
		expect(screen.getByText("Temporary")).toBeTruthy();

		// Advance past the default 2500ms
		act(() => jest.advanceTimersByTime(2600));
		expect(screen.queryByText("Temporary")).toBeNull();
	});

	it("auto-dismisses after a custom duration", () => {
		render(<Toast />);
		act(() => showToast("Quick", 500));
		expect(screen.getByText("Quick")).toBeTruthy();

		act(() => jest.advanceTimersByTime(600));
		expect(screen.queryByText("Quick")).toBeNull();
	});

	it("replaces the current toast when called again", () => {
		render(<Toast />);
		act(() => showToast("First"));
		expect(screen.getByText("First")).toBeTruthy();

		act(() => showToast("Second"));
		expect(screen.queryByText("First")).toBeNull();
		expect(screen.getByText("Second")).toBeTruthy();
	});

	it("resets the dismiss timer when replaced", () => {
		render(<Toast />);
		act(() => showToast("Original", 1000));

		// Advance 800ms, then replace
		act(() => jest.advanceTimersByTime(800));
		act(() => showToast("Replacement", 1000));
		expect(screen.getByText("Replacement")).toBeTruthy();

		// Advance another 800ms — original would have expired, but replacement has fresh timer
		act(() => jest.advanceTimersByTime(800));
		expect(screen.getByText("Replacement")).toBeTruthy();

		// Advance past replacement's timer
		act(() => jest.advanceTimersByTime(300));
		expect(screen.queryByText("Replacement")).toBeNull();
	});
});
