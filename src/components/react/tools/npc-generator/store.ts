import { create } from "zustand";
import { createDefaultNPC, type NPCData, type TemplateDef, type TraitDef } from "./constants";

// =========================================================================
// Store types
// =========================================================================

interface NPCStore {
	npcState: NPCData;
	savedList: string[];
	traitsData: TraitDef[];
	templatesList: TemplateDef[];
	skillNames: string[];
	dataLoaded: boolean;

	setNpcState: (npc: NPCData) => void;
	setSavedList: (list: string[]) => void;
	setTraitsData: (data: TraitDef[]) => void;
	setTemplatesList: (list: TemplateDef[]) => void;
	setSkillNames: (names: string[]) => void;
	setDataLoaded: (v: boolean) => void;
	updateNpc: (fn: (npc: NPCData) => NPCData) => void;
}

// =========================================================================
// Zustand store
// =========================================================================

export const useNPCStore = create<NPCStore>((set, get) => ({
	npcState: createDefaultNPC(),
	savedList: [],
	traitsData: [],
	templatesList: [],
	skillNames: [],
	dataLoaded: false,

	setNpcState: (npc) => set({ npcState: npc }),
	setSavedList: (list) => set({ savedList: list }),
	setTraitsData: (data) => set({ traitsData: data }),
	setTemplatesList: (list) => set({ templatesList: list }),
	setSkillNames: (names) => set({ skillNames: names }),
	setDataLoaded: (v) => set({ dataLoaded: v }),

	updateNpc: (fn) => {
		set({ npcState: fn(get().npcState) });
	},
}));
