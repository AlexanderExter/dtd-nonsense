import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MOCK_GAME_DATA } from "../../__test-utils__/mock-game-data";
import { useCharSheetStore } from "./store";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
let mockUseAllData = () => ({ data: null, loading: true, error: null });

mock.module("@/hooks/use-data", () => ({
	useAllData: () => mockUseAllData(),
}));

// Mock the character API to avoid localStorage in tests
const mockCharList = mock(() => [] as Array<{ id: string; name: string }>);
const mockCharLoad = mock(
	(id: string) =>
		({
			id,
			name: "Test Character",
			race: "",
			exaltation: "",
			characteristics: {
				strength: 2,
				dexterity: 2,
				constitution: 2,
				intelligence: 2,
				wisdom: 2,
				charisma: 2,
				composure: 2,
				fellowship: 2,
				willpower: 2,
			},
			skills: {},
			classes: [],
			feats: [],
			assets: [],
			hindrances: [],
			backgrounds: [],
			alignment: "",
			equipment: [],
			weapons: [],
			notes: "",
		}) as unknown,
);
const mockCharCreateDefault = mock(
	() =>
		({
			id: "new-char-1",
			name: "New Character",
			race: "",
			exaltation: "",
			characteristics: {
				strength: 1,
				dexterity: 1,
				constitution: 1,
				intelligence: 1,
				wisdom: 1,
				charisma: 1,
				composure: 1,
				fellowship: 1,
				willpower: 1,
			},
			skills: {},
			classes: [],
			feats: [],
			assets: [],
			hindrances: [],
			backgrounds: [],
			alignment: "",
			equipment: [],
			weapons: [],
			notes: "",
		}) as unknown,
);
const mockCharSave = mock(() => {});

mock.module("@/lib/dtd/character", () => ({
	character: {
		list: mockCharList,
		load: mockCharLoad,
		createDefault: mockCharCreateDefault,
		save: mockCharSave,
		remove: mock(() => {}),
		importJSON: mock(() => Promise.resolve({})),
		exportJSON: mock(() => {}),
	},
}));

const { CharacterSheetApp } = await import("./CharacterSheetApp");

afterEach(() => {
	cleanup();
	useCharSheetStore.setState({
		char: mockCharCreateDefault() as any,
		charId: null,
		charList: [],
		activeTab: "identity",
		gameData: null,
		saveStatus: "saved",
	});
	mockUseAllData = () => ({ data: null, loading: true, error: null });
});

describe("CharacterSheetApp", () => {
	it("shows loading message while data is loading", () => {
		mockUseAllData = () => ({ data: null, loading: true, error: null });
		render(<CharacterSheetApp />);
		expect(screen.getByText(/Loading game data/)).toBeTruthy();
	});

	it("shows error message when data fails to load", () => {
		mockUseAllData = () => ({ data: null, loading: false, error: "Fetch failed" });
		render(<CharacterSheetApp />);
		expect(screen.getByText(/Failed to load data/)).toBeTruthy();
		expect(screen.getByText(/Fetch failed/)).toBeTruthy();
	});

	it("renders tabs when data is loaded", () => {
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		useCharSheetStore.setState({
			gameData: MOCK_GAME_DATA,
			charId: "test-1",
			char: mockCharLoad("test-1") as any,
		});
		render(<CharacterSheetApp />);
		// TAB_LABELS should include these tab names
		expect(screen.getByText("Identity")).toBeTruthy();
		expect(screen.getByText("Stats")).toBeTruthy();
		expect(screen.getByText("Combat")).toBeTruthy();
	});

	it("shows save status indicator", () => {
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		useCharSheetStore.setState({
			gameData: MOCK_GAME_DATA,
			charId: "test-1",
			char: mockCharLoad("test-1") as any,
			saveStatus: "saved",
		});
		render(<CharacterSheetApp />);
		expect(screen.getByText("Saved")).toBeTruthy();
	});

	it("shows saving status when autosave is in progress", () => {
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		useCharSheetStore.setState({
			gameData: MOCK_GAME_DATA,
			charId: "test-1",
			char: mockCharLoad("test-1") as any,
			saveStatus: "saving",
		});
		render(<CharacterSheetApp />);
		expect(screen.getByText("Saving…")).toBeTruthy();
	});

	it("shows error status when save fails", () => {
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		useCharSheetStore.setState({
			gameData: MOCK_GAME_DATA,
			charId: "test-1",
			char: mockCharLoad("test-1") as any,
			saveStatus: "error",
		});
		render(<CharacterSheetApp />);
		expect(screen.getByText("Save error")).toBeTruthy();
	});

	it("syncs data into store on first load", async () => {
		mockUseAllData = () => ({ data: MOCK_GAME_DATA, loading: false, error: null });
		render(<CharacterSheetApp />);
		await waitFor(() => {
			expect(useCharSheetStore.getState().gameData).not.toBeNull();
		});
	});
});
