import { computed, signal } from "@preact/signals";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { loadData } from "@/lib/dtd/core.ts";
import {
	calculateDerived,
	createDefaultNPC,
	type DerivedStats,
	extractSkillNames,
	generateMarkdown,
	type NPCData,
	STORAGE_LIST_KEY,
	STORAGE_PREFIX,
	type TemplateDef,
	type TraitDef,
} from "./constants";
import { DerivedStatsBar } from "./DerivedStatsBar";
import { NPCForm } from "./NPCForm";
import { StatCard } from "./StatCard";

// =========================================================================
// Module-level signals
// =========================================================================

const npcState = signal<NPCData>(createDefaultNPC());
const toastMessage = signal("");
const savedList = signal<string[]>([]);
const traitsData = signal<TraitDef[]>([]);
const templatesList = signal<TemplateDef[]>([]);
const skillNames = signal<string[]>([]);
const dataLoaded = signal(false);

const derivedStats = computed<DerivedStats>(() => calculateDerived(npcState.value, traitsData.value));

// =========================================================================
// Root component
// =========================================================================

export function NPCGeneratorApp() {
	const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Load data on mount
	useEffect(() => {
		Promise.all([loadData("traits.json"), loadData("npc-templates.json"), loadData("skills.json")])
			.then(([traits, templates, skills]) => {
				traitsData.value = traits as TraitDef[];
				templatesList.value = templates as TemplateDef[];
				skillNames.value = extractSkillNames(skills as { skills?: Record<string, Array<{ name: string }>> });
				loadSavedList();
				dataLoaded.value = true;
			})
			.catch((err) => {
				console.error("NPC Builder init failed:", err);
			});

		return () => {
			if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		};
	}, []);

	// =====================================================================
	// Toast
	// =====================================================================

	const showToast = useCallback((msg: string) => {
		toastMessage.value = msg;
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => {
			toastMessage.value = "";
		}, 2000);
	}, []);

	// =====================================================================
	// Persistence
	// =====================================================================

	const loadSavedList = () => {
		try {
			const raw = localStorage.getItem(STORAGE_LIST_KEY);
			savedList.value = raw ? JSON.parse(raw) : [];
		} catch {
			savedList.value = [];
		}
	};

	const saveSavedList = () => {
		localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(savedList.value));
	};

	const saveNPC = useCallback(() => {
		const npc = npcState.value;
		const id = npc.name
			? npc.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/-+$/, "")
			: `npc-${Date.now()}`;

		localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(npc));

		if (!savedList.value.includes(id)) {
			savedList.value = [...savedList.value, id];
			saveSavedList();
		}

		showToast(`Saved: ${npc.name || id}`);
	}, [showToast]);

	const loadSavedNPC = useCallback(
		(id: string) => {
			const raw = localStorage.getItem(STORAGE_PREFIX + id);
			if (!raw) return;
			try {
				const data = JSON.parse(raw) as Partial<NPCData>;
				npcState.value = { ...createDefaultNPC(), ...data };
				showToast(`Loaded: ${npcState.value.name || id}`);
			} catch {
				showToast("Failed to load NPC");
			}
		},
		[showToast],
	);

	const deleteSavedNPC = useCallback(
		(id: string) => {
			if (!id) {
				showToast("Select a saved NPC to delete");
				return;
			}
			localStorage.removeItem(STORAGE_PREFIX + id);
			savedList.value = savedList.value.filter((i) => i !== id);
			saveSavedList();
			showToast("Deleted saved NPC");
		},
		[showToast],
	);

	// =====================================================================
	// Template loading
	// =====================================================================

	const loadTemplate = useCallback(
		(templateId: string) => {
			const tpl = templatesList.value.find((t) => t.id === templateId);
			if (!tpl) return;

			npcState.value = {
				name: tpl.name,
				level: tpl.level,
				size: tpl.size,
				speed: tpl.speed,
				characteristics: { ...tpl.characteristics },
				skills: tpl.skills.map((s) => ({ ...s })),
				feats: [...tpl.feats],
				traits: (tpl.traits || []).map((t) => ({ ...t })),
				armor: (tpl.armor || []).map((a) => ({ ...a, locations: [...a.locations] })),
				weapons: (tpl.weapons || []).map((w) => ({ ...w })),
				abilities: (tpl.abilities || []).map((a) => ({ ...a })),
				gear: Array.isArray(tpl.gear) ? tpl.gear.join(", ") : tpl.gear || "",
			};
			showToast(`Loaded: ${tpl.name}`);
		},
		[showToast],
	);

	// =====================================================================
	// Actions
	// =====================================================================

	const handleClear = useCallback(() => {
		npcState.value = createDefaultNPC();
	}, []);

	const handleDuplicate = useCallback(() => {
		const current = npcState.value;
		npcState.value = { ...current, name: `${current.name || "NPC"} (Copy)` };
		showToast("Duplicated \u2014 edit and save as new");
	}, [showToast]);

	const handleCopyMarkdown = useCallback(async () => {
		const md = generateMarkdown(npcState.value, derivedStats.value, traitsData.value);
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
	}, [showToast]);

	const handlePrint = useCallback(() => {
		window.print();
	}, []);

	const handleNPCUpdate = useCallback((updated: NPCData) => {
		npcState.value = updated;
	}, []);

	// =====================================================================
	// Template dropdown categories
	// =====================================================================

	const templateCategories = (() => {
		const cats: Record<string, TemplateDef[]> = {};
		for (const t of templatesList.value) {
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
	if (!dataLoaded.value) {
		return (
			<div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
				Loading NPC Builder...
			</div>
		);
	}

	const npc = npcState.value;
	const stats = derivedStats.value;

	return (
		<>
			{/* Top Bar */}
			<header class="top-bar no-print">
				<div class="top-bar-left">
					<a href="/tools/" class="back-link">
						← Tools
					</a>
					<h1>NPC Stat Block Builder</h1>
				</div>
				<div class="top-bar-right">
					<select
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
						ref={savedSelectRef}
						title="Load saved NPC"
						onChange={(e) => {
							const val = (e.target as HTMLSelectElement).value;
							if (val) loadSavedNPC(val);
						}}
					>
						<option value="">— Saved —</option>
						{savedList.value.map((id) => {
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

					<button type="button" class="btn btn-primary btn-sm" title="Save NPC" onClick={saveNPC}>
						Save
					</button>
					<button
						type="button"
						class="btn btn-ghost btn-sm"
						title="Delete saved NPC"
						onClick={() => {
							const sel = savedSelectRef.current;
							if (sel) deleteSavedNPC(sel.value);
						}}
					>
						Delete
					</button>
					<button
						type="button"
						class="btn btn-secondary btn-sm"
						title="Clear all fields"
						onClick={handleClear}
					>
						Clear
					</button>
				</div>
			</header>

			{/* Main Layout */}
			<main class="builder-layout">
				{/* LEFT: Input Panel */}
				<section class="input-panel no-print">
					<NPCForm
						npc={npc}
						onUpdate={handleNPCUpdate}
						traitsData={traitsData.value}
						skillNames={skillNames.value}
					/>
				</section>

				{/* RIGHT: Preview Panel */}
				<section class="preview-panel">
					<DerivedStatsBar stats={stats} />
					<StatCard npc={npc} derivedStats={stats} traitsData={traitsData.value} />
					<div class="preview-actions no-print">
						<button
							type="button"
							class="btn btn-primary"
							title="Copy stat block as Markdown"
							onClick={handleCopyMarkdown}
						>
							Copy Markdown
						</button>
						<button type="button" class="btn btn-secondary" title="Print stat card" onClick={handlePrint}>
							Print Card
						</button>
						<button
							type="button"
							class="btn btn-secondary"
							title="Duplicate as new NPC"
							onClick={handleDuplicate}
						>
							Duplicate
						</button>
					</div>
				</section>
			</main>

			{/* Toast */}
			{toastMessage.value && <output class="toast show">{toastMessage.value}</output>}
		</>
	);
}
