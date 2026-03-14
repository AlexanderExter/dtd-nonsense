import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { getMockStorage, installMockLocalStorage } from "@/lib/dtd/__test-utils__/mock-local-storage";
import type { Combatant } from "./constants";
import { AUTOSAVE_DELAY, defaultEncounterState, ENCOUNTER_PREFIX } from "./constants";
import { useCombatStore } from "./store";

function makeCombatant(overrides: Partial<Combatant> = {}): Combatant {
	return {
		id: "c1",
		name: "Fighter",
		dexterity: 3,
		composure: 2,
		modifier: 0,
		heroPoint: false,
		surprised: false,
		initiativeRoll: null,
		initiativeTotal: null,
		hpMax: 14,
		hpCurrent: 14,
		willpower: 3,
		sd: 17,
		resilience: 3,
		resourceMax: 0,
		resourceCurrent: 0,
		resourceLabel: "",
		conditions: [],
		actionBudget: { half1: false, half2: false, fullAction: false, reaction: false },
		notes: "",
		imported: false,
		importedData: null,
		isNpc: false,
		...overrides,
	};
}

describe("combat-tracker store", () => {
	let restoreLS: () => void;

	beforeEach(() => {
		restoreLS = installMockLocalStorage();
		useCombatStore.setState({
			encounterState: defaultEncounterState(),
			conditionPickerState: null,
			importModalOpen: false,
			sidebarOpen: false,
			hitLocationResult: "",
			damageCalcResult: "",
			roundAlerts: [],
			encounterList: [],
			importCharList: [],
		});
	});

	afterEach(() => {
		restoreLS();
		jest.restoreAllMocks();
	});

	// -----------------------------------------------------------------------
	// Simple setters
	// -----------------------------------------------------------------------
	describe("setters", () => {
		it("setImportModalOpen toggles modal state", () => {
			useCombatStore.getState().setImportModalOpen(true);
			expect(useCombatStore.getState().importModalOpen).toBe(true);
		});

		it("setSidebarOpen toggles sidebar state", () => {
			useCombatStore.getState().setSidebarOpen(true);
			expect(useCombatStore.getState().sidebarOpen).toBe(true);
		});

		it("setHitLocationResult sets result string", () => {
			useCombatStore.getState().setHitLocationResult("Head");
			expect(useCombatStore.getState().hitLocationResult).toBe("Head");
		});

		it("setDamageCalcResult sets result string", () => {
			useCombatStore.getState().setDamageCalcResult("12 damage");
			expect(useCombatStore.getState().damageCalcResult).toBe("12 damage");
		});

		it("setEncounterList replaces the list", () => {
			const list = [{ id: "e1", name: "Encounter 1" }];
			useCombatStore.getState().setEncounterList(list);
			expect(useCombatStore.getState().encounterList).toEqual(list);
		});
	});

	// -----------------------------------------------------------------------
	// updateState
	// -----------------------------------------------------------------------
	describe("updateState", () => {
		it("merges a partial patch into encounter state", () => {
			useCombatStore.getState().updateState({ round: 3 });
			expect(useCombatStore.getState().encounterState.round).toBe(3);
		});

		it("preserves unpatched fields", () => {
			useCombatStore.getState().updateState({ round: 2 });
			expect(useCombatStore.getState().encounterState.encounterStarted).toBe(false);
			expect(useCombatStore.getState().encounterState.combatants).toEqual([]);
		});

		it("schedules localStorage autosave for active encounters", async () => {
			useCombatStore.getState().updateState({
				encounterId: "enc-1",
				round: 1,
			});

			// Wait for autosave timer
			await new Promise((r) => setTimeout(r, AUTOSAVE_DELAY + 100));

			const stored = getMockStorage()[`${ENCOUNTER_PREFIX}enc-1`];
			expect(stored).toBeDefined();
			const parsed = JSON.parse(stored);
			expect(parsed.round).toBe(1);
		});
	});

	// -----------------------------------------------------------------------
	// updateCombatant
	// -----------------------------------------------------------------------
	describe("updateCombatant", () => {
		it("updates the correct combatant by ID", () => {
			const c1 = makeCombatant({ id: "c1", name: "Fighter" });
			const c2 = makeCombatant({ id: "c2", name: "Wizard" });
			useCombatStore.getState().updateState({ combatants: [c1, c2] });

			useCombatStore.getState().updateCombatant("c1", (c) => ({
				...c,
				hpCurrent: 5,
			}));

			const combatants = useCombatStore.getState().encounterState.combatants;
			expect(combatants.find((c) => c.id === "c1")?.hpCurrent).toBe(5);
			expect(combatants.find((c) => c.id === "c2")?.hpCurrent).toBe(14);
		});

		it("leaves other combatants unchanged", () => {
			const c1 = makeCombatant({ id: "c1", name: "Fighter" });
			const c2 = makeCombatant({ id: "c2", name: "Wizard", hpCurrent: 10 });
			useCombatStore.getState().updateState({ combatants: [c1, c2] });

			useCombatStore.getState().updateCombatant("c1", (c) => ({
				...c,
				conditions: [{ conditionId: "stunned" }],
			}));

			expect(useCombatStore.getState().encounterState.combatants[1].hpCurrent).toBe(10);
			expect(useCombatStore.getState().encounterState.combatants[1].conditions).toEqual([]);
		});
	});
});
