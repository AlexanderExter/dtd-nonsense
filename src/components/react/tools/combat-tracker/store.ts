import type { ReactNode } from "react";
import { create } from "zustand";
import { createAutosave } from "@/lib/autosave";
import type { Combatant, EncounterState } from "./constants";
import { AUTOSAVE_DELAY, defaultEncounterState, ENCOUNTER_PREFIX } from "./constants";

interface CombatStore {
	conditionPickerState: { combatantId: string; rect: DOMRect } | null;
	encounterList: Array<{ id: string; name: string }>;
	encounterState: EncounterState;
	importCharList: Array<{ id: string; name: string }>;
	importModalOpen: boolean;
	roundAlerts: ReactNode[];
	setConditionPickerState: (state: { combatantId: string; rect: DOMRect } | null) => void;
	setEncounterList: (list: Array<{ id: string; name: string }>) => void;

	setEncounterState: (state: EncounterState) => void;
	setImportCharList: (list: Array<{ id: string; name: string }>) => void;
	setImportModalOpen: (open: boolean) => void;
	setRoundAlerts: (alerts: ReactNode[]) => void;
	updateCombatant: (id: string, updater: (c: Combatant) => Combatant) => void;

	updateState: (patch: Partial<EncounterState>) => void;
}

const scheduleSave = createAutosave(() => {
	const s = useCombatStore.getState().encounterState;
	if (s.encounterId) {
		localStorage.setItem(ENCOUNTER_PREFIX + s.encounterId, JSON.stringify(s));
	}
}, AUTOSAVE_DELAY);

export const useCombatStore = create<CombatStore>((set, get) => ({
	encounterState: defaultEncounterState(),
	conditionPickerState: null,
	importModalOpen: false,
	roundAlerts: [],
	encounterList: [],
	importCharList: [],

	setEncounterState: (encounterState) => set({ encounterState }),
	setConditionPickerState: (conditionPickerState) => set({ conditionPickerState }),
	setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
	setRoundAlerts: (roundAlerts) => set({ roundAlerts }),
	setEncounterList: (encounterList) => set({ encounterList }),
	setImportCharList: (importCharList) => set({ importCharList }),

	updateState: (patch) => {
		set((prev) => ({
			encounterState: { ...prev.encounterState, ...patch },
		}));
		scheduleSave();
	},

	updateCombatant: (id, updater) => {
		const s = get().encounterState;
		get().updateState({
			combatants: s.combatants.map((c) => (c.id === id ? updater(c) : c)),
		});
	},
}));
