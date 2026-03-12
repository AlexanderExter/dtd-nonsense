import { useCallback, useEffect, useMemo, useRef } from "react";
import { Button, showToast, Toast } from "@/components/react/ui";
import { loadData } from "@/lib/dtd/core.ts";
import {
	calculateDerived,
	createDefaultNPC,
	extractSkillNames,
	generateMarkdown,
	type NPCData,
	STORAGE_LIST_KEY,
	STORAGE_PREFIX,
} from "./constants";
import { DerivedStatsBar } from "./DerivedStatsBar";
import { NPCForm } from "./NPCForm";
import { StatCard } from "./StatCard";
import { useNPCStore } from "./store";

// =========================================================================
// Root component
// =========================================================================

export function NPCGeneratorApp() {
	const {
		npcState,
		savedList,
		traitsData,
		templatesList,
		skillNames,
		dataLoaded,
		setNpcState,
		setSavedList,
		setTraitsData,
		setTemplatesList,
		setSkillNames,
		setDataLoaded,
	} = useNPCStore();

	const derivedStats = useMemo(() => calculateDerived(npcState, traitsData), [npcState, traitsData]);

	// Load data on mount
	useEffect(() => {
		Promise.all([loadData("traits.json"), loadData("npc-templates.json"), loadData("skills.json")])
			.then(([traits, templates, skills]) => {
				setTraitsData(traits as import("./constants").TraitDef[]);
				setTemplatesList(templates as import("./constants").TemplateDef[]);
				setSkillNames(extractSkillNames(skills as { skills?: Record<string, Array<{ name: string }>> }));
				loadSavedList();
				setDataLoaded(true);
			})
			.catch((err) => {
				console.error("NPC Builder init failed:", err);
			});
	}, []);

	// =====================================================================
	// Persistence
	// =====================================================================

	const loadSavedList = () => {
		try {
			const raw = localStorage.getItem(STORAGE_LIST_KEY);
			setSavedList(raw ? JSON.parse(raw) : []);
		} catch {
			setSavedList([]);
		}
	};

	const saveSavedList = () => {
		const list = useNPCStore.getState().savedList;
		localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(list));
	};

	const saveNPC = useCallback(() => {
		const npc = useNPCStore.getState().npcState;
		const id = npc.name
			? npc.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/-+$/, "")
			: `npc-${Date.now()}`;

		localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(npc));

		const currentList = useNPCStore.getState().savedList;
		if (!currentList.includes(id)) {
			setSavedList([...currentList, id]);
			saveSavedList();
		}

		showToast(`Saved: ${npc.name || id}`);
	}, []);

	const loadSavedNPC = useCallback((id: string) => {
		const raw = localStorage.getItem(STORAGE_PREFIX + id);
		if (!raw) return;
		try {
			const data = JSON.parse(raw) as Partial<NPCData>;
			const loaded = { ...createDefaultNPC(), ...data };
			setNpcState(loaded);
			showToast(`Loaded: ${loaded.name || id}`);
		} catch {
			showToast("Failed to load NPC");
		}
	}, []);

	const deleteSavedNPC = useCallback((id: string) => {
		if (!id) {
			showToast("Select a saved NPC to delete");
			return;
		}
		localStorage.removeItem(STORAGE_PREFIX + id);
		const currentList = useNPCStore.getState().savedList;
		setSavedList(currentList.filter((i) => i !== id));
		saveSavedList();
		showToast("Deleted saved NPC");
	}, []);

	// =====================================================================
	// Template loading
	// =====================================================================

	const loadTemplate = useCallback((templateId: string) => {
		const tpl = useNPCStore.getState().templatesList.find((t) => t.id === templateId);
		if (!tpl) return;

		setNpcState({
			name: tpl.name,
			level: tpl.level,
			size: tpl.size,
			speed: tpl.speed,
			characteristics: { ...tpl.characteristics },
			skills: tpl.skills.map((s) => ({ ...s })),
			feats: [...tpl.feats],
			traits: (tpl.traits || []).map((t) => ({ ...t })),
			armor: (tpl.armor || []).map((a) => ({
				...a,
				locations: [...a.locations],
			})),
			weapons: (tpl.weapons || []).map((w) => ({ ...w })),
			abilities: (tpl.abilities || []).map((a) => ({ ...a })),
			gear: Array.isArray(tpl.gear) ? tpl.gear.join(", ") : tpl.gear || "",
		});
		showToast(`Loaded: ${tpl.name}`);
	}, []);

	// =====================================================================
	// Actions
	// =====================================================================

	const handleClear = useCallback(() => {
		setNpcState(createDefaultNPC());
	}, []);

	const handleDuplicate = useCallback(() => {
		const current = useNPCStore.getState().npcState;
		setNpcState({ ...current, name: `${current.name || "NPC"} (Copy)` });
		showToast("Duplicated \u2014 edit and save as new");
	}, []);

	const handleCopyMarkdown = useCallback(async () => {
		const state = useNPCStore.getState();
		const stats = calculateDerived(state.npcState, state.traitsData);
		const md = generateMarkdown(state.npcState, stats, state.traitsData);
		try {
			await navigator.clipboard.writeText(md);
			showToast("Markdown copied to clipboard");
		} catch {
			// Fallback for older browsers
			const ta = document.createElement("textarea");
			ta.value = md;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand("copy");
			ta.remove();
			showToast("Markdown copied to clipboard");
		}
	}, []);

	const handlePrint = useCallback(() => {
		window.print();
	}, []);

	const handleNPCUpdate = useCallback((updated: NPCData) => {
		setNpcState(updated);
	}, []);

	// =====================================================================
	// Template dropdown categories
	// =====================================================================

	const templateCategories = (() => {
		const cats: Record<string, import("./constants").TemplateDef[]> = {};
		for (const t of templatesList) {
			const cat = t.category || "other";
			if (!cats[cat]) cats[cat] = [];
			cats[cat].push(t);
		}
		return cats;
	})();

	const catOrder = ["mortal", "supernatural", "creature", "construct", "undead", "other"];

	// =====================================================================
	// Saved NPC select ref
	// =====================================================================

	const savedSelectRef = useRef<HTMLSelectElement>(null);

	// Loading state
	if (!dataLoaded) {
		return (
			<div
				style={{
					padding: "2rem",
					textAlign: "center",
					color: "var(--text-muted)",
				}}
			>
				Loading NPC Builder...
			</div>
		);
	}

	const npc = npcState;
	const stats = derivedStats;

	return (
		<>
			{/* Top Bar */}
			<header className="flex items-center justify-between gap-md px-lg py-sm bg-surface border-b border-border sticky top-0 z-[100] max-[800px]:flex-wrap no-print">
				<div className="flex items-center gap-sm">
					<a href="/tools/" className="text-[0.85rem] whitespace-nowrap">
						← Tools
					</a>
					<h1 className="text-[1.1rem] m-0 text-accent whitespace-nowrap">NPC Stat Block Builder</h1>
				</div>
				<div className="flex items-center gap-sm max-[800px]:flex-wrap">
					<select
						className="max-w-[180px] text-[0.85rem] px-sm py-xs"
						title="Load template"
						onChange={(e) => {
							const val = (e.target as HTMLSelectElement).value;
							if (val) {
								loadTemplate(val);
								(e.target as HTMLSelectElement).value = "";
							}
						}}
					>
						<option value="">— Templates —</option>
						{catOrder.map((cat) => {
							const items = templateCategories[cat];
							if (!items) return null;
							return (
								<optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
									{items.map((t) => (
										<option key={t.id} value={t.id}>
											{t.name} (Lvl {t.level})
										</option>
									))}
								</optgroup>
							);
						})}
					</select>

					<select
						className="max-w-[180px] text-[0.85rem] px-sm py-xs"
						ref={savedSelectRef}
						title="Load saved NPC"
						onChange={(e) => {
							const val = (e.target as HTMLSelectElement).value;
							if (val) loadSavedNPC(val);
						}}
					>
						<option value="">— Saved —</option>
						{savedList.map((id) => {
							let label = id;
							try {
								const raw = localStorage.getItem(STORAGE_PREFIX + id);
								if (raw) {
									const data = JSON.parse(raw);
									if (data.name) label = data.name;
								}
							} catch {
								// skip corrupt entries
							}
							return (
								<option key={id} value={id}>
									{label}
								</option>
							);
						})}
					</select>

					<Button variant="primary" size="sm" title="Save NPC" onClick={saveNPC}>
						Save
					</Button>
					<Button
						variant="ghost"
						size="sm"
						title="Delete saved NPC"
						onClick={() => {
							const sel = savedSelectRef.current;
							if (sel) deleteSavedNPC(sel.value);
						}}
					>
						Delete
					</Button>
					<Button size="sm" title="Clear all fields" onClick={handleClear}>
						Clear
					</Button>
				</div>
			</header>

			{/* Main Layout */}
			<main className="grid grid-cols-[minmax(320px,1fr)_minmax(360px,1.2fr)] min-h-[calc(100vh-50px)] max-[800px]:grid-cols-1">
				{/* LEFT: Input Panel */}
				<section className="px-lg py-md overflow-y-auto max-h-[calc(100vh-50px)] border-r border-border max-[800px]:max-h-none max-[800px]:border-r-0 max-[800px]:border-b max-[800px]:border-border no-print">
					<NPCForm npc={npc} onUpdate={handleNPCUpdate} traitsData={traitsData} skillNames={skillNames} />
				</section>

				{/* RIGHT: Preview Panel */}
				<section className="px-lg py-md overflow-y-auto max-h-[calc(100vh-50px)] flex flex-col gap-md max-[800px]:max-h-none">
					<DerivedStatsBar stats={stats} />
					<StatCard npc={npc} derivedStats={stats} traitsData={traitsData} />
					<div className="flex gap-sm pt-sm no-print">
						<Button variant="primary" title="Copy stat block as Markdown" onClick={handleCopyMarkdown}>
							Copy Markdown
						</Button>
						<Button title="Print stat card" onClick={handlePrint}>
							Print Card
						</Button>
						<Button title="Duplicate as new NPC" onClick={handleDuplicate}>
							Duplicate
						</Button>
					</div>
				</section>
			</main>

			{/* Toast */}
			<Toast />
		</>
	);
}
