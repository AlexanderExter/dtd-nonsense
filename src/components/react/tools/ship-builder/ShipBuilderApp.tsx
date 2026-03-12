import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/react/ui";
import { loadData } from "@/lib/dtd/core.ts";
import { BuilderPanel } from "./BuilderPanel";
import {
	createDefaultShip,
	generateId,
	type ShipData,
	type ShipState,
	STORAGE_LIST_KEY,
	STORAGE_PREFIX,
} from "./constants";
import { SheetPanel } from "./SheetPanel";
import { saveShipNow, useShipStore } from "./store";

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
	const { ship, shipList, mode, dataLoaded, setShip, setMode, setShipList, setDataLoaded, setShipData, updateShip } =
		useShipStore();

	// -----------------------------------------------------------------------
	// Initialization
	// -----------------------------------------------------------------------

	useEffect(() => {
		let cancelled = false;
		loadData("ships.json").then((raw: unknown) => {
			if (cancelled) return;
			const data = raw as ShipData;
			setShipData(data);

			const list = loadShipListFromStorage();
			setShipList(list);

			if (list.length > 0) {
				const loaded = loadShipFromStorage(list[list.length - 1].id);
				if (loaded) {
					setShip(loaded);
					setMode(loaded.mode || "builder");
				}
			}
			setDataLoaded(true);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// -----------------------------------------------------------------------
	// Ship management
	// -----------------------------------------------------------------------

	const handleShipSwitch = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const id = (e.target as HTMLSelectElement).value;
			const loaded = loadShipFromStorage(id);
			if (loaded) {
				setShip(loaded);
				setMode(loaded.mode || "builder");
			}
		},
		[setShip, setMode],
	);

	const handleNew = useCallback(() => {
		const newShip = createDefaultShip();
		setShip(newShip);
		setMode("builder");
		saveShipNow();
	}, [setShip, setMode]);

	const handleDelete = useCallback(() => {
		const s = ship;
		const name = s.name || "Unnamed Ship";
		if (!confirm(`Delete "${name}"?`)) return;

		localStorage.removeItem(STORAGE_PREFIX + s.id);
		const list = shipList.filter((e) => e.id !== s.id);
		localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(list));
		setShipList(list);

		if (list.length > 0) {
			const loaded = loadShipFromStorage(list[list.length - 1].id);
			if (loaded) {
				setShip(loaded);
				setMode(loaded.mode || "builder");
			}
		} else {
			const newShip = createDefaultShip();
			setShip(newShip);
			setMode("builder");
			saveShipNow();
		}
	}, [ship, shipList, setShip, setMode, setShipList]);

	const handleExport = useCallback(() => {
		const s = ship;
		const json = JSON.stringify(s, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${s.name || "ship"}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}, [ship]);

	const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
				useShipStore.getState().setShip(imported);
				useShipStore.getState().setMode(imported.mode || "builder");
				saveShipNow();
			} catch {
				alert("Invalid JSON file");
			}
		};
		reader.readAsText(file);
		input.value = "";
	}, []);

	const handleSetMode = useCallback(
		(m: "builder" | "sheet") => {
			setMode(m);
			updateShip((s) => {
				s.mode = m;
				return s;
			});
		},
		[setMode, updateShip],
	);

	// -----------------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------------

	if (!dataLoaded) {
		return (
			<div className="loading-state">
				<p>Loading ship data…</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between gap-md px-lg py-sm bg-surface border-b border-border sticky top-0 z-[100] max-[900px]:flex-wrap max-[900px]:gap-xs no-print">
				<div className="flex items-center gap-sm">
					<select value={ship.id} onChange={handleShipSwitch} title="Switch ship" className="min-w-[180px]">
						{shipList.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name || "Unnamed Ship"}
							</option>
						))}
					</select>
					<Button variant="primary" size="sm" onClick={handleNew} title="New ship">
						+ New
					</Button>
					<Button variant="ghost" size="sm" onClick={handleDelete} title="Delete ship">
						Delete
					</Button>
				</div>
				<div className="flex bg-bg border border-border rounded-md overflow-hidden">
					<button
						type="button"
						className={[
							"px-lg py-sm bg-transparent border-none text-text-muted font-semibold cursor-pointer transition-all duration-150 hover:text-text-primary hover:bg-surface-raised",
							mode === "builder" && "bg-accent text-bg",
						]
							.filter(Boolean)
							.join(" ")}
						onClick={() => handleSetMode("builder")}
					>
						Builder
					</button>
					<button
						type="button"
						className={[
							"px-lg py-sm bg-transparent border-none text-text-muted font-semibold cursor-pointer transition-all duration-150 hover:text-text-primary hover:bg-surface-raised",
							mode === "sheet" && "bg-accent text-bg",
						]
							.filter(Boolean)
							.join(" ")}
						onClick={() => handleSetMode("sheet")}
					>
						Sheet
					</button>
				</div>
				<div className="flex items-center gap-sm">
					<Button size="sm" onClick={() => fileRef.current?.click()}>
						Import
					</Button>
					<Button size="sm" onClick={handleExport}>
						Export
					</Button>
					<input type="file" ref={fileRef} accept=".json" hidden onChange={handleImport} />
				</div>
			</div>

			{mode === "builder" ? <BuilderPanel /> : <SheetPanel />}
		</div>
	);
}
