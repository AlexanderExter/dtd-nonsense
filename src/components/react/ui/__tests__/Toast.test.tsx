import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { showToast, Toast } from "../Toast";

beforeEach(() => {
	jest.useFakeTimers();
});

afterEach(() => {
	act(() => jest.runAllTimers());
	jest.useRealTimers();
	cleanup();
});

describe("Toast", () => {
	it("renders the Toaster without crashing", () => {
		const { container } = render(<Toast />);
		// Sonner renders an <ol> as its container
		expect(container).toBeTruthy();
	});

	it("renders the message when showToast is called", async () => {
		render(<Toast />);
		act(() => showToast("Saved!"));
		// Sonner renders toasts asynchronously — advance microtasks
		act(() => jest.advanceTimersByTime(100));
		expect(screen.getByText("Saved!")).toBeTruthy();
	});

	it("auto-dismisses after the duration", () => {
		render(<Toast />);
		act(() => showToast("Temporary", 2500));
		act(() => jest.advanceTimersByTime(100));
		expect(screen.getByText("Temporary")).toBeTruthy();

		// Advance past duration + animation time
		act(() => jest.advanceTimersByTime(3000));
		expect(screen.queryByText("Temporary")).toBeNull();
	});

	it("showToast is callable with custom duration", () => {
		// Verify the wrapper doesn't throw
		expect(() => showToast("Quick", 500)).not.toThrow();
	});
});
