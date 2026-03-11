import { signal } from "@preact/signals";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { loadData } from "@/lib/dtd/core.ts";
import { BuilderPanel } from "./BuilderPanel";
import {
	AUTOSAVE_DELAY,
	createDefaultShip,
	generateId,
	type ShipData,
	type ShipState,
	STORAGE_LIST_KEY,
	STORAGE_PREFIX,
} from "./constants";
import { SheetPanel } from "./SheetPanel";

// =========================================================================
// Module-level signals
// =========================================================================

export const shipData = signal<ShipData | null>(null);
export const ship = signal<ShipState>(createDefaultShip());
export const shipList = signal<Array<{ id: string; name: string }>>([]);
export const mode = signal<"builder" | "sheet">("builder");
const dataLoaded = signal(false);

// =========================================================================
// State mutation helper
// =========================================================================

let _saveTimer: ReturnType<typeof setTimeout> | null = null;

function saveShipNow(): void {
	const s = ship.value;
	const data = shipData.value;
	if (!data) return;

	localStorage.setItem(STORAGE_PREFIX + s.id, JSON.stringify(s));

	const list = [...shipList.value];
	const idx = list.findIndex((e) => e.id === s.id);
	const entry = { id: s.id, name: s.name || "Unnamed Ship" };
	if (idx >= 0) {
		list[idx] = entry;
	} else {
		list.push(entry);
	}
	localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(list));
	shipList.value = list;
}

function scheduleSave(): void {
	if (_saveTimer) clearTimeout(_saveTimer);
	_saveTimer = setTimeout(() => saveShipNow(), AUTOSAVE_DELAY);
}

export function updateShip(updater: (s: ShipState) => ShipState): void {
	ship.value = updater({ ...ship.value });
	scheduleSave();
}

// =========================================================================
// Persistence helpers
// =========================================================================

function loadShipListFromStorage(): Array<{ id: string; name: string }> {
	try {
		const raw = localStorage.getItem(STORAGE_LIST_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function loadShipFromStorage(id: string): ShipState | null {
	try {
		const raw = localStorage.getItem(STORAGE_PREFIX + id);
		if (raw) {
			const parsed = JSON.parse(raw) as ShipState;
			if (!parsed.combat) {
				parsed.combat = createDefaultShip().combat;
			}
			return parsed;
		}
	} catch {
		// fall through
	}
	return null;
}

// =========================================================================
// Root component
// =========================================================================

export function ShipBuilderApp() {
	const fileRef = useRef<HTMLInputElement>(null);

	// -----------------------------------------------------------------------
	// Initialization
	// -----------------------------------------------------------------------

	useEffect(() => {
		let cancelled = false;
		loadData("ships.json").then((raw: unknown) => {
			if (cancelled) return;
			const data = raw as ShipData;
			shipData.value = data;

			const list = loadShipListFromStorage();
			shipList.value = list;

			if (list.length > 0) {
				const loaded = loadShipFromStorage(list[list.length - 1].id);
				if (loaded) {
					ship.value = loaded;
					mode.value = loaded.mode || "builder";
				}
			}
			dataLoaded.value = true;
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// -----------------------------------------------------------------------
	// Ship management
	// -----------------------------------------------------------------------

	const handleShipSwitch = useCallback((e: Event) => {
		const id = (e.target as HTMLSelectElement).value;
		const loaded = loadShipFromStorage(id);
		if (loaded) {
			ship.value = loaded;
			mode.value = loaded.mode || "builder";
		}
	}, []);

	const handleNew = useCallback(() => {
		const newShip = createDefaultShip();
		ship.value = newShip;
		mode.value = "builder";
		saveShipNow();
	}, []);

	const handleDelete = useCallback(() => {
		const s = ship.value;
		const name = s.name || "Unnamed Ship";
		if (!confirm(`Delete "${name}"?`)) return;

		localStorage.removeItem(STORAGE_PREFIX + s.id);
		const list = shipList.value.filter((e) => e.id !== s.id);
		localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(list));
		shipList.value = list;

		if (list.length > 0) {
			const loaded = loadShipFromStorage(list[list.length - 1].id);
			if (loaded) {
				ship.value = loaded;
				mode.value = loaded.mode || "builder";
			}
		} else {
			const newShip = createDefaultShip();
			ship.value = newShip;
			mode.value = "builder";
			saveShipNow();
		}
	}, []);

	const handleExport = useCallback(() => {
		const s = ship.value;
		const json = JSON.stringify(s, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${s.name || "ship"}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}, []);

	const handleImport = useCallback((e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (ev) => {
			try {
				const imported = JSON.parse(ev.target?.result as string) as ShipState;
				imported.id = generateId();
				if (!imported.combat) {
					imported.combat = createDefaultShip().combat;
				}
				ship.value = imported;
				mode.value = imported.mode || "builder";
				saveShipNow();
			} catch {
				alert("Invalid JSON file");
			}
		};
		reader.readAsText(file);
		input.value = "";
	}, []);

	const setMode = useCallback((m: "builder" | "sheet") => {
		mode.value = m;
		updateShip((s) => {
			s.mode = m;
			return s;
		});
	}, []);

	// -----------------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------------

	if (!dataLoaded.value) {
		return (
			<div class="loading-state">
				<p>Loading ship data…</p>
			</div>
		);
	}

	return (
		<div>
			<div class="flex items-center justify-between gap-md px-lg py-sm bg-surface border-b border-border sticky top-0 z-[100] max-[900px]:flex-wrap max-[900px]:gap-xs no-print">
				<div class="flex items-center gap-sm">
					<select value={ship.value.id} onChange={handleShipSwitch} title="Switch ship" class="min-w-[180px]">
						{shipList.value.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name || "Unnamed Ship"}
							</option>
						))}
					</select>
					<button type="button" class="btn btn-primary btn-sm" onClick={handleNew} title="New ship">
						+ New
					</button>
					<button type="button" class="btn btn-ghost btn-sm" onClick={handleDelete} title="Delete ship">
						Delete
					</button>
				</div>
				<div class="flex bg-bg border border-border rounded-md overflow-hidden">
					<button
						type="button"
						class={[
							"px-lg py-sm bg-transparent border-none text-text-muted font-semibold cursor-pointer transition-all duration-150 hover:text-text-primary hover:bg-surface-raised",
							mode.value === "builder" && "bg-accent text-bg",
						]
							.filter(Boolean)
							.join(" ")}
						onClick={() => setMode("builder")}
					>
						Builder
					</button>
					<button
						type="button"
						class={[
							"px-lg py-sm bg-transparent border-none text-text-muted font-semibold cursor-pointer transition-all duration-150 hover:text-text-primary hover:bg-surface-raised",
							mode.value === "sheet" && "bg-accent text-bg",
						]
							.filter(Boolean)
							.join(" ")}
						onClick={() => setMode("sheet")}
					>
						Sheet
					</button>
				</div>
				<div class="flex items-center gap-sm">
					<button type="button" class="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
						Import
					</button>
					<button type="button" class="btn btn-secondary btn-sm" onClick={handleExport}>
						Export
					</button>
					<input type="file" ref={fileRef} accept=".json" hidden onChange={handleImport} />
				</div>
			</div>

			{mode.value === "builder" ? <BuilderPanel /> : <SheetPanel />}
		</div>
	);
}
