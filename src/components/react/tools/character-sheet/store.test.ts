import { afterEach, beforeEach, describe, expect, it, jest, mock } from "bun:test";
import { installMockLocalStorage } from "@/lib/dtd/__test-utils__/mock-local-storage";
import { useCharSheetStore } from "./store";

// ---------------------------------------------------------------------------
// Mock the character API module before importing the store
// ---------------------------------------------------------------------------
const mockCharAPI = {
	createDefault: () => ({
		id: "test-id",
		name: "",
		totalXP: 600,
		characteristics: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			charisma: 1,
			fellowship: 1,
			composure: 1,
			intelligence: 1,
			wisdom: 1,
			willpower: 1,
		},
		feats: [],
		assets: [],
		hindrances: [],
		skills: {},
		classes: [],
		backgrounds: [],
		meleeWeapons: [],
		rangedWeapons: [],
		modifiers: {
			staticDefense: 0,
			hitPoints: 0,
			mentalDefense: 0,
			resolve: 0,
			speed: 0,
			resilience: 0,
			initiative: 0,
		},
		race: "",
		exaltation: "",
		alignment: "",
		size: 4,
		level: 1,
	}),
	save: mock(() => {}),
	load: mock(() => mockCharAPI.createDefault()),
	remove: mock(() => {}),
	list: mock(() => []),
	importJSON: mock(() => Promise.resolve(mockCharAPI.createDefault())),
	exportJSON: mock(() => {}),
};

describe("character-sheet store", () => {
	let restoreLS: () => void;

	beforeEach(() => {
		restoreLS = installMockLocalStorage();
		// Reset store
		useCharSheetStore.setState({
			char: mockCharAPI.createDefault(),
			charId: null,
			charList: [],
			activeTab: "identity",
			gameData: null,
			saveStatus: "saved",
		});
		jest.restoreAllMocks();
	});

	afterEach(() => {
		restoreLS();
		jest.restoreAllMocks();
	});

	// -----------------------------------------------------------------------
	// Simple setters
	// -----------------------------------------------------------------------
	describe("setters", () => {
		it("setChar replaces the character", () => {
			const ch = mockCharAPI.createDefault();
			ch.name = "Test Hero";
			useCharSheetStore.getState().setChar(ch);
			expect(useCharSheetStore.getState().char.name).toBe("Test Hero");
		});

		it("setCharId sets the character ID", () => {
			useCharSheetStore.getState().setCharId("abc123");
			expect(useCharSheetStore.getState().charId).toBe("abc123");
		});

		it("setActiveTab switches tabs", () => {
			useCharSheetStore.getState().setActiveTab("combat");
			expect(useCharSheetStore.getState().activeTab).toBe("combat");
		});

		it("setSaveStatus updates save status", () => {
			useCharSheetStore.getState().setSaveStatus("saving");
			expect(useCharSheetStore.getState().saveStatus).toBe("saving");
		});

		it("setGameData sets game data", () => {
			const data = { skills: {} };
			useCharSheetStore.getState().setGameData(data);
			expect(useCharSheetStore.getState().gameData).toBe(data);
		});

		it("setCharList replaces the character list", () => {
			const list = [{ id: "a", name: "Hero A" }];
			useCharSheetStore.getState().setCharList(list);
			expect(useCharSheetStore.getState().charList).toEqual(list);
		});
	});

	// -----------------------------------------------------------------------
	// updateChar
	// -----------------------------------------------------------------------
	describe("updateChar", () => {
		it("applies mutation via deep clone", () => {
			useCharSheetStore.getState().updateChar((c) => {
				c.name = "Updated";
			});
			expect(useCharSheetStore.getState().char.name).toBe("Updated");
		});

		it("does not mutate the previous state reference", () => {
			const before = useCharSheetStore.getState().char;
			useCharSheetStore.getState().updateChar((c) => {
				c.name = "Changed";
			});
			expect(before.name).not.toBe("Changed");
		});
	});
});
