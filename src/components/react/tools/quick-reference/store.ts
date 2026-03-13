import { create } from "zustand";

const SECTION_IDS = [
	"actions",
	"conditions",
	"modifiers",
	"magic",
	"swords",
	"gunkata",
	"properties",
	"formulas",
] as const;

interface QuickRefState {
	searchQuery: string;
	activeTypeFilters: Set<string>;
	activeSubtypeFilters: Set<string>;
	openSections: Set<string>;

	setSearchQuery: (q: string) => void;
	toggleTypeFilter: (type: string) => void;
	toggleSubtypeFilter: (subtype: string) => void;
	setOpenSections: (sections: Set<string>) => void;
	toggleSection: (id: string) => void;
	expandAll: (allIds?: string[]) => void;
	collapseAll: () => void;
}

export const useQuickRefStore = create<QuickRefState>((set) => ({
	searchQuery: "",
	activeTypeFilters: new Set<string>(),
	activeSubtypeFilters: new Set<string>(),
	openSections: new Set<string>(),

	setSearchQuery: (q) => set({ searchQuery: q }),

	toggleTypeFilter: (type) =>
		set((state) => {
			const next = new Set(state.activeTypeFilters);
			if (next.has(type)) next.delete(type);
			else next.add(type);
			return { activeTypeFilters: next };
		}),

	toggleSubtypeFilter: (subtype) =>
		set((state) => {
			const next = new Set(state.activeSubtypeFilters);
			if (next.has(subtype)) next.delete(subtype);
			else next.add(subtype);
			return { activeSubtypeFilters: next };
		}),

	setOpenSections: (sections) => set({ openSections: sections }),

	toggleSection: (id) =>
		set((state) => {
			const next = new Set(state.openSections);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return { openSections: next };
		}),

	expandAll: (allIds) => set({ openSections: new Set(allIds ?? SECTION_IDS) }),

	collapseAll: () => set({ openSections: new Set<string>() }),
}));
