import { create } from "zustand";
import { character as characterAPI } from "@/lib/dtd/character";
import type { CharacterData } from "@/lib/dtd/types";
import { AUTOSAVE_DELAY, ensureToolDefaults, type TabId } from "./constants";

// =========================================================================
// Store types
// =========================================================================

interface CharSheetStore {
	activeTab: TabId;
	char: CharacterData;
	charId: string | null;
	charList: Array<{ id: string; name: string }>;
	gameData: Record<string, any> | null;
	saveStatus: "saved" | "saving" | "error";
	setActiveTab: (tab: TabId) => void;

	setChar: (char: CharacterData) => void;
	setCharId: (id: string | null) => void;
	setCharList: (list: Array<{ id: string; name: string }>) => void;
	setGameData: (data: Record<string, any>) => void;
	setSaveStatus: (status: "saved" | "saving" | "error") => void;
	updateChar: (fn: (c: CharacterData) => void) => void;
}

// =========================================================================
// Save helpers (module-level, use getState)
// =========================================================================

let _saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleAutoSave(): void {
	useCharSheetStore.getState().setSaveStatus("saving");
	if (_saveTimer) clearTimeout(_saveTimer);
	_saveTimer = setTimeout(() => saveNow(), AUTOSAVE_DELAY);
}

function saveNow(): void {
	const { char: ch, charId: id, charList } = useCharSheetStore.getState();
	if (!id) return;
	try {
		characterAPI.save(id, ch);
		const list = [...charList];
		const entry = list.find((c) => c.id === id);
		if (entry) {
			entry.name = ch.name || "Unnamed";
			useCharSheetStore.getState().setCharList(list);
		}
		useCharSheetStore.getState().setSaveStatus("saved");
	} catch {
		useCharSheetStore.getState().setSaveStatus("error");
	}
}

// =========================================================================
// Character CRUD (module-level, use getState)
// =========================================================================

export function loadCharacter(id: string): void {
	const { gameData } = useCharSheetStore.getState();
	const ch = characterAPI.load(id);
	if (gameData?.skills) ensureToolDefaults(ch, gameData.skills);
	useCharSheetStore.getState().setChar(ch);
	useCharSheetStore.getState().setCharId(id);
}

export function createNewCharacter(): void {
	const { gameData, charList } = useCharSheetStore.getState();
	const ch = characterAPI.createDefault();
	if (gameData?.skills) ensureToolDefaults(ch, gameData.skills);
	useCharSheetStore.getState().setChar(ch);
	useCharSheetStore.getState().setCharId(ch.id);
	const list = [...charList, { id: ch.id, name: ch.name || "New Character" }];
	useCharSheetStore.getState().setCharList(list);
	characterAPI.save(ch.id, ch);
}

export function deleteCharacter(id: string): void {
	const { charList } = useCharSheetStore.getState();
	if (charList.length <= 1) return;
	characterAPI.remove(id);
	const list = charList.filter((c) => c.id !== id);
	useCharSheetStore.getState().setCharList(list);
	if (list.length > 0) loadCharacter(list[0].id);
}

export function importCharacter(file: File): void {
	characterAPI.importJSON(file).then((ch) => {
		const { gameData, charList } = useCharSheetStore.getState();
		if (gameData?.skills) ensureToolDefaults(ch, gameData.skills);
		useCharSheetStore.getState().setChar(ch);
		useCharSheetStore.getState().setCharId(ch.id);
		const list = [...charList, { id: ch.id, name: ch.name || "Imported" }];
		useCharSheetStore.getState().setCharList(list);
		characterAPI.save(ch.id, ch);
	});
}

export function exportCharacter(): void {
	const { char } = useCharSheetStore.getState();
	characterAPI.exportJSON(char);
}

// =========================================================================
// Zustand store
// =========================================================================

export const useCharSheetStore = create<CharSheetStore>((set, get) => ({
	char: characterAPI.createDefault(),
	charId: null,
	charList: [],
	activeTab: "identity",
	gameData: null,
	saveStatus: "saved",

	setChar: (char) => set({ char }),
	setCharId: (charId) => set({ charId }),
	setCharList: (charList) => set({ charList }),
	setActiveTab: (activeTab) => set({ activeTab }),
	setGameData: (gameData) => set({ gameData }),
	setSaveStatus: (saveStatus) => set({ saveStatus }),

	updateChar: (fn) => {
		const next = structuredClone(get().char);
		fn(next);
		set({ char: next });
		scheduleAutoSave();
	},
}));
