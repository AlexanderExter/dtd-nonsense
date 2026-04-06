import { create } from "zustand";
import { createDefaultNPC, type NPCData, type TemplateDef, type TraitDef } from "./constants";

// =========================================================================
// Store types
// =========================================================================

interface NPCStore {
	dataLoaded: boolean;
	featNames: string[];
	npcState: NPCData;
	savedList: string[];
	setDataLoaded: (v: boolean) => void;
	setFeatNames: (names: string[]) => void;

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
	featNames: [],
	dataLoaded: false,

	setNpcState: (npc) => set({ npcState: npc }),
	setSavedList: (list) => set({ savedList: list }),
	setTraitsData: (data) => set({ traitsData: data }),
	setTemplatesList: (list) => set({ templatesList: list }),
	setSkillNames: (names) => set({ skillNames: names }),
	setFeatNames: (names) => set({ featNames: names }),
	setDataLoaded: (v) => set({ dataLoaded: v }),

	updateNpc: (fn) => {
		set({ npcState: fn(get().npcState) });
	},
}));
