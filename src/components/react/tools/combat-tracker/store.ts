import type { ReactNode } from "react";
import { create } from "zustand";
import type { Combatant, EncounterState } from "./constants";
import { AUTOSAVE_DELAY, defaultEncounterState, ENCOUNTER_PREFIX } from "./constants";

interface CombatStore {
	encounterState: EncounterState;
	conditionPickerState: { combatantId: string; rect: DOMRect } | null;
	importModalOpen: boolean;
	sidebarOpen: boolean;
	hitLocationResult: string;
	damageCalcResult: string;
	roundAlerts: ReactNode[];
	encounterList: Array<{ id: string; name: string }>;
	importCharList: Array<{ id: string; name: string }>;

	setEncounterState: (state: EncounterState) => void;
	setConditionPickerState: (state: { combatantId: string; rect: DOMRect } | null) => void;
	setImportModalOpen: (open: boolean) => void;
	setSidebarOpen: (open: boolean) => void;
	setHitLocationResult: (result: string) => void;
	setDamageCalcResult: (result: string) => void;
	setRoundAlerts: (alerts: ReactNode[]) => void;
	setEncounterList: (list: Array<{ id: string; name: string }>) => void;
	setImportCharList: (list: Array<{ id: string; name: string }>) => void;

	updateState: (patch: Partial<EncounterState>) => void;
	updateCombatant: (id: string, updater: (c: Combatant) => Combatant) => void;
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

export const useCombatStore = create<CombatStore>((set, get) => ({
	encounterState: defaultEncounterState(),
	conditionPickerState: null,
	importModalOpen: false,
	sidebarOpen: false,
	hitLocationResult: "",
	damageCalcResult: "",
	roundAlerts: [],
	encounterList: [],
	importCharList: [],

	setEncounterState: (encounterState) => set({ encounterState }),
	setConditionPickerState: (conditionPickerState) => set({ conditionPickerState }),
	setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
	setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
	setHitLocationResult: (hitLocationResult) => set({ hitLocationResult }),
	setDamageCalcResult: (damageCalcResult) => set({ damageCalcResult }),
	setRoundAlerts: (roundAlerts) => set({ roundAlerts }),
	setEncounterList: (encounterList) => set({ encounterList }),
	setImportCharList: (importCharList) => set({ importCharList }),

	updateState: (patch) => {
		set((prev) => ({
			encounterState: { ...prev.encounterState, ...patch },
		}));
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveTimer = setTimeout(() => {
			const s = get().encounterState;
			if (s.encounterId) {
				localStorage.setItem(ENCOUNTER_PREFIX + s.encounterId, JSON.stringify(s));
			}
		}, AUTOSAVE_DELAY);
	},

	updateCombatant: (id, updater) => {
		const s = get().encounterState;
		get().updateState({
			combatants: s.combatants.map((c) => (c.id === id ? updater(c) : c)),
		});
	},
}));
