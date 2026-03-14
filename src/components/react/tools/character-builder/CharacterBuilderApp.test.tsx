import { afterEach, describe, expect, it, mock } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { MOCK_GAME_DATA } from "../../__test-utils__/mock-game-data";
import { createDefaultMeta } from "./constants";
import { createDefaultChar, useBuilderStore } from "./store";

// ---------------------------------------------------------------------------
// Mock useAllData hook to control loading/error/data states
// ---------------------------------------------------------------------------
let mockUseAllData = () => ({ data: null, loading: true, error: null });

mock.module("@/hooks/use-data", () => ({
	useAllData: (..._args: unknown[]) => mockUseAllData(),
}));

// The dynamic import must come AFTER mock.module to be intercepted
const { CharacterBuilderApp } = await import("./CharacterBuilderApp");

afterEach(() => {
	cleanup();
	// Reset store to defaults
	useBuilderStore.setState({
		char: createDefaultChar(),
		meta: createDefaultMeta(),
		gameData: null,
		currentStep: 1,
	});
	mockUseAllData = () => ({ data: null, loading: true, error: null });
});

describe("CharacterBuilderApp", () => {
	it("shows loading message while data is loading", () => {
		mockUseAllData = () => ({ data: null, loading: true, error: null });
		render(<CharacterBuilderApp />);
		expect(screen.getByText(/Loading game data/)).toBeTruthy();
	});

	it("shows error message when data fails to load", () => {
		mockUseAllData = () => ({ data: null, loading: false, error: "Network error" });
		render(<CharacterBuilderApp />);
		expect(screen.getByText(/Failed to load data/)).toBeTruthy();
		expect(screen.getByText(/Network error/)).toBeTruthy();
	});

	it("renders the main layout when data is loaded", () => {
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		useBuilderStore.setState({ gameData: MOCK_GAME_DATA });
		render(<CharacterBuilderApp />);
		expect(screen.getByRole("heading", { name: "Character Builder" })).toBeTruthy();
		// Two "Start Over" buttons: one in app header (sm), one in sidebar
		expect(screen.getAllByText("Start Over").length).toBeGreaterThanOrEqual(1);
	});

	it("syncs game data into store on first load", async () => {
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		render(<CharacterBuilderApp />);
		// The useEffect syncs data into store
		await waitFor(() => {
			expect(useBuilderStore.getState().gameData).not.toBeNull();
		});
	});

	it("does not overwrite gameData if already set", () => {
		const existingData = { custom: true } as Record<string, unknown>;
		useBuilderStore.setState({ gameData: existingData });
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		render(<CharacterBuilderApp />);
		expect(useBuilderStore.getState().gameData).toBe(existingData);
	});

	it("resets character and meta on Start Over (confirmed)", () => {
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		useBuilderStore.setState({
			gameData: MOCK_GAME_DATA,
			currentStep: 5,
		});

		// Mock window.confirm to return true
		const originalConfirm = globalThis.confirm;
		globalThis.confirm = () => true;

		render(<CharacterBuilderApp />);
		// Target the app header's Start Over button (has btn-sm class)
		const btns = screen.getAllByText("Start Over");
		const appBtn = btns.find((b) => b.classList.contains("btn-sm")) ?? btns[0];
		act(() => appBtn.click());

		expect(useBuilderStore.getState().currentStep).toBe(1);

		globalThis.confirm = originalConfirm;
	});

	it("does nothing on Start Over when user cancels", () => {
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		useBuilderStore.setState({
			gameData: MOCK_GAME_DATA,
			currentStep: 5,
		});

		const originalConfirm = globalThis.confirm;
		globalThis.confirm = () => false;

		render(<CharacterBuilderApp />);
		const btns = screen.getAllByText("Start Over");
		const appBtn = btns.find((b) => b.classList.contains("btn-sm")) ?? btns[0];
		act(() => appBtn.click());

		// Step should NOT reset since user cancelled
		expect(useBuilderStore.getState().currentStep).toBe(5);

		globalThis.confirm = originalConfirm;
	});
});
