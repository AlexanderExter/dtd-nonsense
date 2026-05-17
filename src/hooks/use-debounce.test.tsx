import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { useDebounce } from "@/hooks/use-debounce";

afterEach(() => cleanup());

function TestConsumer({ value, delay }: { value: string; delay: number }) {
	const debounced = useDebounce(value, delay);
	return <span data-testid="output">{debounced}</span>;
}

describe("useDebounce", () => {
	beforeEach(() => jest.useFakeTimers());
	afterEach(() => {
		act(() => jest.runAllTimers());
		jest.useRealTimers();
	});

	it("returns the initial value immediately", () => {
		render(<TestConsumer delay={300} value="hello" />);
		expect(screen.getByTestId("output").textContent).toBe("hello");
	});

	it("does not update the value before the delay", () => {
		const { rerender } = render(<TestConsumer delay={300} value="a" />);
		rerender(<TestConsumer delay={300} value="b" />);
		act(() => jest.advanceTimersByTime(200));
		expect(screen.getByTestId("output").textContent).toBe("a");
	});

	it("updates the value after the delay", () => {
		const { rerender } = render(<TestConsumer delay={300} value="a" />);
		rerender(<TestConsumer delay={300} value="b" />);
		act(() => jest.advanceTimersByTime(300));
		expect(screen.getByTestId("output").textContent).toBe("b");
	});

	it("resets the timer on rapid changes", () => {
		const { rerender } = render(<TestConsumer delay={300} value="a" />);
		rerender(<TestConsumer delay={300} value="b" />);
		act(() => jest.advanceTimersByTime(200));
		rerender(<TestConsumer delay={300} value="c" />);
		act(() => jest.advanceTimersByTime(200));
		// Still "a" — timer reset
		expect(screen.getByTestId("output").textContent).toBe("a");
		act(() => jest.advanceTimersByTime(100));
		// Now "c" — 300ms since last change
		expect(screen.getByTestId("output").textContent).toBe("c");
	});
});
