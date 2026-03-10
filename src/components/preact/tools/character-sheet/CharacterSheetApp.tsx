import { computed, signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { useAllData } from "@/hooks/use-data";
import { character as characterAPI } from "@/lib/dtd/character";
import type { CharacterData } from "@/lib/dtd/types";
import { CharacterManager } from "./CharacterManager";
import { AUTOSAVE_DELAY, calculateAllDerived, type DerivedStats, ensureToolDefaults, type TabId } from "./constants";
import { SheetHeader } from "./SheetHeader";
import { TabNav } from "./TabNav";
import { CombatTab } from "./tabs/CombatTab";
import { FeaturesTab } from "./tabs/FeaturesTab";
import { IdentityTab } from "./tabs/IdentityTab";
import { PowersTab } from "./tabs/PowersTab";
import { StatsTab } from "./tabs/StatsTab";

// =========================================================================
// Module-level signals
// =========================================================================

export const charSignal = signal<CharacterData>(characterAPI.createDefault());
export const charIdSignal = signal<string | null>(null);
export const charListSignal = signal<Array<{ id: string; name: string }>>([]);
export const activeTab = signal<TabId>("identity");
export const gameData = signal<Record<string, any> | null>(null);
export const saveStatus = signal<"saved" | "saving" | "error">("saved");

/** Computed derived stats — auto-updates when charSignal changes. */
export const derivedStats = computed<DerivedStats>(() => {
	const d = gameData.value;
	if (!d) return calculateAllDerived(charSignal.value, null, null);
	return calculateAllDerived(charSignal.value, d.races, d.exaltations);
});

// =========================================================================
// Mutation helpers
// =========================================================================

let _saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Deep-clone the character, apply `fn`, and trigger reactivity + auto-save. */
export function updateChar(fn: (c: CharacterData) => void): void {
	const next = JSON.parse(JSON.stringify(charSignal.value)) as CharacterData;
	fn(next);
	charSignal.value = next;
	scheduleAutoSave();
}

/** Convenience: set a single top-level field. */
export function setCharField(field: string, value: any): void {
	updateChar((c) => {
		(c as any)[field] = value;
	});
}

function scheduleAutoSave(): void {
	saveStatus.value = "saving";
	if (_saveTimer) clearTimeout(_saveTimer);
	_saveTimer = setTimeout(() => {
		saveNow();
	}, AUTOSAVE_DELAY);
}

function saveNow(): void {
	const ch = charSignal.value;
	const id = charIdSignal.value;
	if (!id) return;
	try {
		characterAPI.save(id, ch);
		const list = [...charListSignal.value];
		const entry = list.find((c) => c.id === id);
		if (entry) {
			entry.name = ch.name || "Unnamed";
			charListSignal.value = list;
		}
		saveStatus.value = "saved";
	} catch {
		saveStatus.value = "error";
	}
}

// =========================================================================
// Character CRUD
// =========================================================================

export function loadCharacter(id: string): void {
	const ch = characterAPI.load(id);
	const d = gameData.value;
	if (d?.skills) ensureToolDefaults(ch, d.skills);
	charSignal.value = ch;
	charIdSignal.value = id;
}

export function createNewCharacter(): void {
	const ch = characterAPI.createDefault();
	const d = gameData.value;
	if (d?.skills) ensureToolDefaults(ch, d.skills);
	charSignal.value = ch;
	charIdSignal.value = ch.id;
	const list = [...charListSignal.value, { id: ch.id, name: ch.name || "New Character" }];
	charListSignal.value = list;
	characterAPI.save(ch.id, ch);
}

export function deleteCharacter(id: string): void {
	if (charListSignal.value.length <= 1) return;
	characterAPI.remove(id);
	const list = charListSignal.value.filter((c) => c.id !== id);
	charListSignal.value = list;
	if (list.length > 0) loadCharacter(list[0].id);
}

export function importCharacter(file: File): void {
	characterAPI.importJSON(file).then((ch) => {
		const d = gameData.value;
		if (d?.skills) ensureToolDefaults(ch, d.skills);
		charSignal.value = ch;
		charIdSignal.value = ch.id;
		const list = [...charListSignal.value, { id: ch.id, name: ch.name || "Imported" }];
		charListSignal.value = list;
		characterAPI.save(ch.id, ch);
	});
}

export function exportCharacter(): void {
	characterAPI.exportJSON(charSignal.value);
}

// =========================================================================
// Root component
// =========================================================================

export function CharacterSheetApp() {
	const { data, loading, error } = useAllData([
		"races",
		"exaltations",
		"alignments",
		"classes",
		"feats",
		"skills",
		"weapons",
		"backgrounds",
	]);

	// Sync loaded data into module-level signal
	useEffect(() => {
		if (data.value && !gameData.value) {
			gameData.value = data.value as Record<string, any>;
		}
	}, [data.value]);

	// Initialize character list from localStorage on mount
	useEffect(() => {
		if (!gameData.value) return;
		const list = characterAPI.list();
		if (list.length === 0) {
			createNewCharacter();
		} else {
			charListSignal.value = list;
			// Check for ?id= param
			const params = new URLSearchParams(window.location.search);
			const requestedId = params.get("id");
			const target = requestedId && list.find((c) => c.id === requestedId) ? requestedId : list[0].id;
			loadCharacter(target);
		}
	}, [gameData.value]);

	if (loading.value) {
		return <div class="sheet-loading">Loading game data…</div>;
	}

	if (error.value) {
		return <div class="sheet-error">Failed to load data: {error.value}</div>;
	}

	const tab = activeTab.value;

	return (
		<div class="character-sheet-app">
			<CharacterManager />
			<SheetHeader />
			<TabNav />
			<div class="tab-panels">
				{tab === "identity" && <IdentityTab />}
				{tab === "stats" && <StatsTab />}
				{tab === "combat" && <CombatTab />}
				{tab === "powers" && <PowersTab />}
				{tab === "features" && <FeaturesTab />}
			</div>
			<div class={`save-status ${saveStatus.value}`}>
				{saveStatus.value === "saving" ? "Saving…" : saveStatus.value === "error" ? "Save error" : "Saved"}
			</div>
		</div>
	);
}
