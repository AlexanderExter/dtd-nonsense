import { create } from "zustand";
import {
	AUTOSAVE_DELAY,
	createDefaultShip,
	type ShipData,
	type ShipState,
	STORAGE_LIST_KEY,
	STORAGE_PREFIX,
} from "./constants";

// =========================================================================
// Store types
// =========================================================================

interface ShipStore {
	dataLoaded: boolean;
	mode: "builder" | "sheet";
	setDataLoaded: (v: boolean) => void;
	setMode: (mode: "builder" | "sheet") => void;
	setShip: (ship: ShipState) => void;

	setShipData: (data: ShipData) => void;
	setShipList: (list: Array<{ id: string; name: string }>) => void;
	ship: ShipState;
	shipData: ShipData | null;
	shipList: Array<{ id: string; name: string }>;
	updateShip: (updater: (s: ShipState) => ShipState) => void;
}

// =========================================================================
// Save helpers (module-level, use getState)
// =========================================================================

let _saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveShipNow(): void {
	const { ship: s, shipData: data, shipList } = useShipStore.getState();
	if (!data) return;

	localStorage.setItem(STORAGE_PREFIX + s.id, JSON.stringify(s));

	const list = [...shipList];
	const idx = list.findIndex((e) => e.id === s.id);
	const entry = { id: s.id, name: s.name || "Unnamed Ship" };
	if (idx >= 0) {
		list[idx] = entry;
	} else {
		list.push(entry);
	}
	localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(list));
	useShipStore.getState().setShipList(list);
}

function scheduleSave(): void {
	if (_saveTimer) clearTimeout(_saveTimer);
	_saveTimer = setTimeout(() => saveShipNow(), AUTOSAVE_DELAY);
}

// =========================================================================
// Zustand store
// =========================================================================

export const useShipStore = create<ShipStore>((set, get) => ({
	shipData: null,
	ship: createDefaultShip(),
	shipList: [],
	mode: "builder",
	dataLoaded: false,

	setShipData: (data) => set({ shipData: data }),
	setShip: (ship) => set({ ship }),
	setShipList: (list) => set({ shipList: list }),
	setMode: (mode) => set({ mode }),
	setDataLoaded: (v) => set({ dataLoaded: v }),

	updateShip: (updater) => {
		const newShip = updater({ ...get().ship });
		set({ ship: newShip });
		scheduleSave();
	},
}));
