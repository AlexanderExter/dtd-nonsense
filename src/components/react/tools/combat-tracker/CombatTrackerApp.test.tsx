import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { installMockLocalStorage } from "@/lib/dtd/__test-utils__/mock-local-storage";
import { ENEMY_COMBATANT, GOBLIN_COMBATANT, KOBOLD_COMBATANT } from "../../__test-utils__/mock-characters";
import { createCombatant, defaultEncounterState } from "./constants";
import { useCombatStore } from "./store";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock character API to avoid real localStorage calls from imports
mock.module("@/lib/dtd/character", () => ({
	character: {
		list: mock(() => []),
		load: mock(() => null),
		createDefault: mock(() => ({})),
		save: mock(() => {}),
		remove: mock(() => {}),
	},
}));

// Mock dice roll for deterministic tests
mock.module("@/lib/dtd/dice", () => ({
	roll: mock(() => ({ total: 5, dice: [5], kept: [5] })),
}));

// Mock data loading (conditions from JSON)
mock.module("@/hooks/use-data", () => ({
	useAllData: mock(() => ({
		data: {
			conditions: [
				{ id: "stunned", name: "Stunned", effect: "No Reactions, half move only", leveled: false },
				{ id: "prone", name: "Prone", effect: "+2k0 melee attacks against", leveled: false },
			],
		},
		loading: false,
		error: null,
	})),
}));

const { CombatTrackerApp } = await import("./CombatTrackerApp");

let restoreLocalStorage: () => void;

afterEach(() => {
	cleanup();
	restoreLocalStorage?.();
	useCombatStore.setState({
		encounterState: defaultEncounterState(),
		conditionPickerState: null,
		importModalOpen: false,
		roundAlerts: [],
		encounterList: [],
		importCharList: [],
	});
});

describe("CombatTrackerApp", () => {
	it("renders the header with title and round counter", () => {
		restoreLocalStorage = installMockLocalStorage();
		render(<CombatTrackerApp />);
		expect(screen.getByText("Combat Tracker")).toBeTruthy();
		expect(screen.getByText("Round")).toBeTruthy();
		expect(screen.getByText("End Round")).toBeTruthy();
	});

	it("shows empty state message when no combatants", () => {
		restoreLocalStorage = installMockLocalStorage();
		render(<CombatTrackerApp />);
		expect(screen.getByText(/No combatants yet/)).toBeTruthy();
	});

	it("renders End Round button", () => {
		restoreLocalStorage = installMockLocalStorage();
		render(<CombatTrackerApp />);
		expect(screen.getByText("End Round")).toBeTruthy();
	});

	it("renders combatant when state has combatants", () => {
		restoreLocalStorage = installMockLocalStorage();
		const combatant = createCombatant({ name: "Fighter" });
		useCombatStore.setState({
			encounterState: {
				...defaultEncounterState(),
				combatants: [combatant],
			},
		});
		render(<CombatTrackerApp />);
		expect(screen.getByText("Fighter")).toBeTruthy();
	});

	it("shows current round number from state", () => {
		restoreLocalStorage = installMockLocalStorage();
		useCombatStore.setState({
			encounterState: {
				...defaultEncounterState(),
				round: 3,
			},
		});
		render(<CombatTrackerApp />);
		expect(screen.getByText("3")).toBeTruthy();
	});

	it("renders import sheet and roll all buttons via QuickAddRow", () => {
		restoreLocalStorage = installMockLocalStorage();
		render(<CombatTrackerApp />);
		expect(screen.getByText(/Import from Sheet/i)).toBeTruthy();
		expect(screen.getByText(/Roll All/i)).toBeTruthy();
	});

	it("renders full party with named character fixtures", () => {
		restoreLocalStorage = installMockLocalStorage();
		useCombatStore.setState({
			encounterState: {
				...defaultEncounterState(),
				combatants: [GOBLIN_COMBATANT, KOBOLD_COMBATANT, ENEMY_COMBATANT],
				encounterStarted: true,
			},
		});
		render(<CombatTrackerApp />);
		expect(screen.getByText("Testing Goblin")).toBeTruthy();
		expect(screen.getByText("Krix the Unbowed")).toBeTruthy();
		expect(screen.getByText("Chaos Cultist")).toBeTruthy();
	});
});
