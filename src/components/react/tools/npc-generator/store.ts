import { create } from "zustand";
import { createDefaultNPC, type NPCData, type TemplateDef, type TraitDef } from "./constants";

// =========================================================================
// Store types
// =========================================================================

interface NPCStore {
	dataLoaded: boolean;
	npcState: NPCData;
	savedList: string[];
	setDataLoaded: (v: boolean) => void;

	setNpcState: (npc: NPCData) => void;
	setSavedList: (list: string[]) => void;
	setSkillNames: (names: string[]) => void;
	setTemplatesList: (list: TemplateDef[]) => void;
	setTraitsData: (data: TraitDef[]) => void;
	skillNames: string[];
	templatesList: TemplateDef[];
	traitsData: TraitDef[];
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
