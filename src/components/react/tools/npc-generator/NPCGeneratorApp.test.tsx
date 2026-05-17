import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { installMockLocalStorage } from "@/lib/dtd/__test-utils__/mock-local-storage";
import { createDefaultNPC } from "./constants";
import { useNPCStore } from "./store";

// ---------------------------------------------------------------------------
// Mock data loading — intercept useAllData hook
// ---------------------------------------------------------------------------
const MOCK_NPC_DATA = {
	traits: [],
	"npc-templates": [],
	skills: { skills: {} },
	feats: { feats: [] },
};
const LOADED = { data: MOCK_NPC_DATA, loading: false, error: null };
const LOADING = { data: null, loading: true, error: null };

let mockUseAllData = () => LOADING;

mock.module("@/hooks/use-data", () => ({
	useAllData: (..._args: unknown[]) => mockUseAllData(),
}));

const { NPCGeneratorApp } = await import("./NPCGeneratorApp");

let restoreLocalStorage: () => void;

afterEach(() => {
	cleanup();
	restoreLocalStorage?.();
	useNPCStore.setState({
		npcState: createDefaultNPC(),
		savedList: [],
		traitsData: [],
		templatesList: [],
		skillNames: [],
		dataLoaded: false,
	});
	mockUseAllData = () => LOADING;
});

describe("NPCGeneratorApp", () => {
	it("shows loading message before data is loaded", () => {
		restoreLocalStorage = installMockLocalStorage();
		render(<NPCGeneratorApp />);
		expect(screen.getByText(/Loading NPC Builder/)).toBeTruthy();
	});

	it("renders header and form after data loads", async () => {
		restoreLocalStorage = installMockLocalStorage();
		mockUseAllData = () => LOADED;
		render(<NPCGeneratorApp />);
		await waitFor(() => {
			expect(screen.getByText("NPC Stat Block Builder")).toBeTruthy();
		});
	});

	it("renders template selector", async () => {
		restoreLocalStorage = installMockLocalStorage();
		mockUseAllData = () => LOADED;
		render(<NPCGeneratorApp />);
		await waitFor(() => {
			expect(screen.getByTitle("Load template")).toBeTruthy();
		});
	});

	it("renders action buttons when data is loaded", () => {
		restoreLocalStorage = installMockLocalStorage();
		mockUseAllData = () => LOADED;
		useNPCStore.setState({ dataLoaded: true });
		render(<NPCGeneratorApp />);
		expect(screen.getByTitle("Save NPC")).toBeTruthy();
		expect(screen.getByTitle("Clear all fields")).toBeTruthy();
	});

	it("renders when immediately provided with dataLoaded state", () => {
		restoreLocalStorage = installMockLocalStorage();
		mockUseAllData = () => LOADED;
		useNPCStore.setState({ dataLoaded: true });
		render(<NPCGeneratorApp />);
		expect(screen.getByText("NPC Stat Block Builder")).toBeTruthy();
	});

	it("renders a saved NPC with Testing Goblin stats", () => {
		restoreLocalStorage = installMockLocalStorage();
		mockUseAllData = () => LOADED;
		const goblinNPC = {
			...createDefaultNPC(),
			name: "Testing Goblin",
			level: 3,
			size: 3,
			speed: 5,
			characteristics: {
				strength: 2,
				dexterity: 4,
				constitution: 3,
				charisma: 2,
				fellowship: 1,
				composure: 3,
				intelligence: 3,
				wisdom: 2,
				willpower: 2,
			},
			skills: [{ name: "Stealth", dots: 3 }],
			feats: ["Quick Draw"],
		};
		useNPCStore.setState({
			dataLoaded: true,
			npcState: goblinNPC,
		});
		render(<NPCGeneratorApp />);
		expect(screen.getByDisplayValue("Testing Goblin")).toBeTruthy();
	});
});
