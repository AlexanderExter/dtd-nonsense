import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { showToast, Toast } from "@/components/react/ui/Toast";
import { useAllData } from "@/hooks/use-data";
import { cn } from "@/lib/utils";
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
	const ship = useShipStore((s) => s.ship);
	const shipList = useShipStore((s) => s.shipList);
	const mode = useShipStore((s) => s.mode);
	const dataLoaded = useShipStore((s) => s.dataLoaded);
	const setShip = useShipStore((s) => s.setShip);
	const setMode = useShipStore((s) => s.setMode);
	const setShipList = useShipStore((s) => s.setShipList);
	const setDataLoaded = useShipStore((s) => s.setDataLoaded);
	const setShipData = useShipStore((s) => s.setShipData);
	const updateShip = useShipStore((s) => s.updateShip);

	const { data: rawData, error } = useAllData(["ships.json"]);

	// -----------------------------------------------------------------------
	// Initialization — sync fetched data into store + hydrate from localStorage
	// -----------------------------------------------------------------------

	useEffect(() => {
		if (!rawData) return;
		const data = rawData.ships as ShipData;
		setShipData(data);

		const list = loadShipListFromStorage();
		setShipList(list);

		if (list.length > 0) {
			const loaded = loadShipFromStorage(list.at(-1).id);
			if (loaded) {
				setShip(loaded);
				setMode(loaded.mode || "builder");
			}
		}
		setDataLoaded(true);
	}, [rawData, setDataLoaded, setMode, setShip, setShipData, setShipList]);

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
			const loaded = loadShipFromStorage(list.at(-1).id);
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
				showToast("Invalid JSON file");
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
			});
		},
		[setMode, updateShip],
	);

	// -----------------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------------

	if (error) {
		return (
			<div className="loading-state">
				<p>Failed to load ship data: {error}</p>
			</div>
		);
	}

	if (!dataLoaded) {
		return (
			<div className="loading-state">
				<p>Loading ship data…</p>
			</div>
		);
	}

	return (
		<div>
			<div className="no-print sticky top-0 z-[100] flex items-center justify-between gap-md border-border border-b bg-surface px-lg py-sm max-tool-lg:flex-wrap max-tool-lg:gap-xs">
				<div className="flex items-center gap-sm">
					<GameSelect
						className="min-w-[180px]"
						onChange={handleShipSwitch}
						title="Switch ship"
						value={ship.id}
					>
						{shipList.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name || "Unnamed Ship"}
							</option>
						))}
					</GameSelect>
					<Button onClick={handleNew} size="sm" title="New ship" variant="primary">
						+ New
					</Button>
					<Button onClick={handleDelete} size="sm" title="Delete ship" variant="ghost">
						Delete
					</Button>
				</div>
				<div className="flex overflow-hidden rounded-md border border-border bg-bg">
					<button
						className={cn(
							"cursor-pointer border-none bg-transparent px-lg py-sm font-semibold text-text-muted transition-all duration-150 hover:bg-surface-raised hover:text-text-primary",
							mode === "builder" && "bg-accent text-bg",
						)}
						onClick={() => handleSetMode("builder")}
						type="button"
					>
						Builder
					</button>
					<button
						className={cn(
							"cursor-pointer border-none bg-transparent px-lg py-sm font-semibold text-text-muted transition-all duration-150 hover:bg-surface-raised hover:text-text-primary",
							mode === "sheet" && "bg-accent text-bg",
						)}
						onClick={() => handleSetMode("sheet")}
						type="button"
					>
						Sheet
					</button>
				</div>
				<div className="flex items-center gap-sm">
					<Button onClick={() => fileRef.current?.click()} size="sm">
						Import
					</Button>
					<Button onClick={handleExport} size="sm">
						Export
					</Button>
					<input
						accept=".json"
						aria-label="Import ship file"
						hidden
						onChange={handleImport}
						ref={fileRef}
						type="file"
					/>
				</div>
			</div>

			{mode === "builder" ? <BuilderPanel /> : <SheetPanel />}
			<Toast />
		</div>
	);
}
