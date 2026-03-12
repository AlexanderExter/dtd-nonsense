import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/react/ui/Button";
import { showToast, Toast } from "@/components/react/ui/Toast";
import { character } from "@/lib/dtd/character";
import { derived } from "@/lib/dtd/derived";
import { roll } from "@/lib/dtd/dice";
import { AddCombatantForm } from "./AddCombatantForm";
import { CombatantCard } from "./CombatantCard";
import { ConditionPicker } from "./ConditionPicker";
import type { Combatant, EncounterState } from "./constants";
import {
	CONDITIONS,
	calculateDamage,
	createCombatant,
	defaultEncounterState,
	ENCOUNTER_LIST_KEY,
	ENCOUNTER_PREFIX,
	genId,
	HIT_LOCATIONS,
} from "./constants";
import { EncounterBar } from "./EncounterBar";
import { ImportModal } from "./ImportModal";
import { QuickAddRow } from "./QuickAddRow";
import { ReferenceSidebar } from "./ReferenceSidebar";
import { useCombatStore } from "./store";

// =========================================================================
// Helpers
// =========================================================================

function sortByInitiative(combatants: Combatant[]): Combatant[] {
	return [...combatants].sort((a, b) => {
		const initA = a.initiativeTotal ?? -Infinity;
		const initB = b.initiativeTotal ?? -Infinity;
		if (initB !== initA) return initB - initA;
		if (b.dexterity !== a.dexterity) return b.dexterity - a.dexterity;
		return b.composure - a.composure;
	});
}

function computeTieSet(combatants: Combatant[]): Set<string> {
	const ties = new Set<string>();
	for (let i = 0; i < combatants.length; i++) {
		for (let j = i + 1; j < combatants.length; j++) {
			if (
				combatants[i].initiativeTotal !== null &&
				combatants[i].initiativeTotal === combatants[j].initiativeTotal
			) {
				ties.add(combatants[i].id);
				ties.add(combatants[j].id);
			}
		}
	}
	return ties;
}

function loadEncounterList(): Array<{ id: string; name: string }> {
	try {
		const raw = localStorage.getItem(ENCOUNTER_LIST_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

// =========================================================================
// Root component
// =========================================================================

export function CombatTrackerApp() {
	const state = useCombatStore((s) => s.encounterState);
	const conditionPickerState = useCombatStore((s) => s.conditionPickerState);
	const importModalOpen = useCombatStore((s) => s.importModalOpen);
	const sidebarOpen = useCombatStore((s) => s.sidebarOpen);
	const hitLocationResult = useCombatStore((s) => s.hitLocationResult);
	const damageCalcResult = useCombatStore((s) => s.damageCalcResult);
	const roundAlerts = useCombatStore((s) => s.roundAlerts);
	const encounterList = useCombatStore((s) => s.encounterList);
	const importCharList = useCombatStore((s) => s.importCharList);
	const updateState = useCombatStore((s) => s.updateState);
	const updateCombatant = useCombatStore((s) => s.updateCombatant);
	const setEncounterState = useCombatStore((s) => s.setEncounterState);
	const setConditionPickerState = useCombatStore((s) => s.setConditionPickerState);
	const setImportModalOpen = useCombatStore((s) => s.setImportModalOpen);
	const setSidebarOpen = useCombatStore((s) => s.setSidebarOpen);
	const setHitLocationResult = useCombatStore((s) => s.setHitLocationResult);
	const setDamageCalcResult = useCombatStore((s) => s.setDamageCalcResult);
	const setRoundAlerts = useCombatStore((s) => s.setRoundAlerts);
	const setEncounterList = useCombatStore((s) => s.setEncounterList);
	const setImportCharList = useCombatStore((s) => s.setImportCharList);

	// Load encounter list on mount
	useEffect(() => {
		setEncounterList(loadEncounterList());
	}, [setEncounterList]);

	// -----------------------------------------------------------------------
	// Add / Remove combatants
	// -----------------------------------------------------------------------

	const addCombatant = useCallback(
		(data: Partial<Combatant>) => {
			const c = createCombatant(data);
			updateState({ combatants: [...useCombatStore.getState().encounterState.combatants, c] });
			showToast(`Added ${c.name}`);
		},
		[updateState],
	);

	const removeCombatant = useCallback(
		(id: string) => {
			const s = useCombatStore.getState().encounterState;
			const idx = s.combatants.findIndex((c) => c.id === id);
			const name = idx >= 0 ? s.combatants[idx].name : "combatant";
			const newCombatants = s.combatants.filter((c) => c.id !== id);
			let newIndex = s.activeTurnIndex;
			if (idx >= 0 && idx < s.activeTurnIndex) newIndex--;
			if (newIndex >= newCombatants.length) newIndex = newCombatants.length - 1;
			updateState({ combatants: newCombatants, activeTurnIndex: newIndex });
			showToast(`Removed ${name}`);
		},
		[updateState],
	);

	// -----------------------------------------------------------------------
	// Quick add
	// -----------------------------------------------------------------------

	const handleQuickAdd = useCallback(
		(name: string, initTotal: number) => {
			const c = createCombatant({ name });
			c.initiativeTotal = initTotal;
			const newCombatants = sortByInitiative([...useCombatStore.getState().encounterState.combatants, c]);
			updateState({ combatants: newCombatants });
			showToast(`Quick-added ${name}`);
		},
		[updateState],
	);

	// -----------------------------------------------------------------------
	// Initiative
	// -----------------------------------------------------------------------

	const rollAllInitiative = useCallback(() => {
		const s = useCombatStore.getState().encounterState;
		const updated = s.combatants.map((c) => {
			const dieResult = roll(1, 1, 0);
			const rollVal = c.heroPoint ? 10 : dieResult.total;
			const total = rollVal + c.dexterity + c.composure + c.modifier;
			return { ...c, initiativeRoll: rollVal, initiativeTotal: total };
		});
		const sorted = sortByInitiative(updated);
		// Find first non-surprised combatant for active turn
		let startIdx = 0;
		for (let i = 0; i < sorted.length; i++) {
			if (!sorted[i].surprised) {
				startIdx = i;
				break;
			}
		}
		updateState({
			combatants: sorted,
			round: 1,
			encounterStarted: true,
			activeTurnIndex: startIdx,
		});
		showToast("Initiative rolled!");
	}, [updateState]);

	const rollSingleInitiative = useCallback(
		(id: string) => {
			const s = useCombatStore.getState().encounterState;
			const c = s.combatants.find((x) => x.id === id);
			if (!c) return;
			const dieResult = roll(1, 1, 0);
			const rollVal = c.heroPoint ? 10 : dieResult.total;
			const total = rollVal + c.dexterity + c.composure + c.modifier;
			const newCombatants = s.combatants.map((x) =>
				x.id === id ? { ...x, initiativeRoll: rollVal, initiativeTotal: total } : x,
			);
			updateState({ combatants: sortByInitiative(newCombatants) });
			showToast(`Rerolled initiative for ${c.name}: ${total}`);
		},
		[updateState],
	);

	// -----------------------------------------------------------------------
	// Turn navigation
	// -----------------------------------------------------------------------

	const nextTurn = useCallback(() => {
		const s = useCombatStore.getState().encounterState;
		if (s.combatants.length === 0 || !s.encounterStarted) return;
		let next = s.activeTurnIndex + 1;
		if (next >= s.combatants.length) next = 0;
		// Skip surprised combatants on round 1
		if (s.round <= 1) {
			let attempts = 0;
			while (s.combatants[next]?.surprised && attempts < s.combatants.length) {
				next = (next + 1) % s.combatants.length;
				attempts++;
			}
		}
		updateState({ activeTurnIndex: next });
	}, [updateState]);

	const previousTurn = useCallback(() => {
		const s = useCombatStore.getState().encounterState;
		if (s.combatants.length === 0 || !s.encounterStarted) return;
		let prev = s.activeTurnIndex - 1;
		if (prev < 0) prev = s.combatants.length - 1;
		// Skip surprised combatants on round 1
		if (s.round <= 1) {
			let attempts = 0;
			while (s.combatants[prev]?.surprised && attempts < s.combatants.length) {
				prev = prev - 1 < 0 ? s.combatants.length - 1 : prev - 1;
				attempts++;
			}
		}
		updateState({ activeTurnIndex: prev });
	}, [updateState]);

	// -----------------------------------------------------------------------
	// End round
	// -----------------------------------------------------------------------

	const handleEndRound = useCallback(() => {
		const s = useCombatStore.getState().encounterState;
		if (s.combatants.length === 0) return;

		const alerts: ReactNode[] = [];
		const updatedCombatants = s.combatants.map((c) => {
			const updated = { ...c };

			// Process conditions
			for (const cond of c.conditions) {
				const def = CONDITIONS.find((d) => d.id === cond.conditionId);
				if (!def) continue;

				if (def.id === "burning") {
					alerts.push(
						<li key={`${c.id}-burning`}>
							<strong>{c.name}</strong>: Burning \u2014 takes 1d10 Energy damage
						</li>,
					);
				}
				if (def.id === "bloodLoss" && cond.level) {
					alerts.push(
						<li key={`${c.id}-bloodLoss`}>
							<strong>{c.name}</strong>: Blood Loss {cond.level} \u2014 Con Test or take {cond.level}{" "}
							damage
						</li>,
					);
				}
				if (def.id === "toxic" && cond.level) {
					alerts.push(
						<li key={`${c.id}-toxic`}>
							<strong>{c.name}</strong>: Toxic {cond.level} \u2014 takes {cond.level} damage
						</li>,
					);
				}
				if (def.id === "fatigue" && cond.level) {
					alerts.push(
						<li key={`${c.id}-fatigue`}>
							<strong>{c.name}</strong>: Fatigue {cond.level} \u2014 {"-"}
							{cond.level}k0 to all Tests
						</li>,
					);
				}
			}

			// Reset action budget
			updated.actionBudget = {
				half1: false,
				half2: false,
				fullAction: false,
				reaction: false,
			};

			// Clear surprised after round 1
			if (s.round >= 1) {
				updated.surprised = false;
			}

			return updated;
		});

		setRoundAlerts(alerts);
		updateState({
			combatants: updatedCombatants,
			round: s.round + 1,
			activeTurnIndex: 0,
		});
		showToast(`Round ${s.round} ended`);
	}, [updateState, setRoundAlerts]);

	// -----------------------------------------------------------------------
	// HP / Resource modification
	// -----------------------------------------------------------------------

	const modifyHP = useCallback(
		(id: string, delta: number) => {
			updateCombatant(id, (c) => ({
				...c,
				hpCurrent: Math.max(0, Math.min(c.hpMax, c.hpCurrent + delta)),
			}));
		},
		[updateCombatant],
	);

	const modifyResource = useCallback(
		(id: string, delta: number) => {
			updateCombatant(id, (c) => ({
				...c,
				resourceCurrent: Math.max(0, Math.min(c.resourceMax, c.resourceCurrent + delta)),
			}));
		},
		[updateCombatant],
	);

	// -----------------------------------------------------------------------
	// Conditions
	// -----------------------------------------------------------------------

	const openConditionPicker = useCallback(
		(id: string, rect: DOMRect) => {
			setConditionPickerState({ combatantId: id, rect });
		},
		[setConditionPickerState],
	);

	const addCondition = useCallback(
		(combatantId: string, conditionId: string) => {
			updateCombatant(combatantId, (c) => {
				const existing = c.conditions.find((x) => x.conditionId === conditionId);
				const def = CONDITIONS.find((d) => d.id === conditionId);

				if (existing) {
					if (def?.leveled) {
						return {
							...c,
							conditions: c.conditions.map((x) =>
								x.conditionId === conditionId ? { ...x, level: (x.level ?? 1) + 1 } : x,
							),
						};
					}
					return c; // Non-leveled, already applied
				}

				return {
					...c,
					conditions: [...c.conditions, { conditionId, level: def?.leveled ? 1 : undefined }],
				};
			});
		},
		[updateCombatant],
	);

	const removeCondition = useCallback(
		(combatantId: string, conditionId: string) => {
			updateCombatant(combatantId, (c) => ({
				...c,
				conditions: c.conditions.filter((x) => x.conditionId !== conditionId),
			}));
		},
		[updateCombatant],
	);

	// -----------------------------------------------------------------------
	// Action tokens
	// -----------------------------------------------------------------------

	const toggleActionToken = useCallback(
		(id: string, tokenType: string) => {
			updateCombatant(id, (c) => {
				const budget = { ...c.actionBudget };
				if (tokenType === "fullAction") {
					budget.fullAction = !budget.fullAction;
					if (budget.fullAction) {
						budget.half1 = false;
						budget.half2 = false;
					}
				} else if (tokenType === "half1" || tokenType === "half2") {
					budget[tokenType] = !budget[tokenType];
					if (budget[tokenType]) {
						budget.fullAction = false;
					}
				} else if (tokenType === "reaction") {
					budget.reaction = !budget.reaction;
				}
				return { ...c, actionBudget: budget };
			});
		},
		[updateCombatant],
	);

	// -----------------------------------------------------------------------
	// Notes
	// -----------------------------------------------------------------------

	const updateNotes = useCallback(
		(id: string, notes: string) => {
			updateCombatant(id, (c) => ({ ...c, notes }));
		},
		[updateCombatant],
	);

	// -----------------------------------------------------------------------
	// Import from sheet
	// -----------------------------------------------------------------------

	const openImportModal = useCallback(() => {
		setImportCharList(character.list());
		setImportModalOpen(true);
	}, [setImportCharList, setImportModalOpen]);

	const handleImportChar = useCallback(
		(charId: string) => {
			const data = character.load(charId);
			if (!data) {
				showToast("Failed to load character");
				return;
			}

			const chars = data.characteristics || {};
			const con = Number(chars.constitution) || 2;
			const wil = Number(chars.willpower) || 2;
			const dex = Number(chars.dexterity) || 2;
			const wis = Number(chars.wisdom) || 2;
			const composure = Number(chars.composure) || 2;
			// CharacterData has no size/level fields; use sensible defaults (matches original)
			const size = 4;
			const level = Number((data as unknown as Record<string, unknown>).level) || 1;

			const c = createCombatant({
				name: data.name || "Imported",
				dexterity: dex,
				composure,
				hpMax: derived.calculateHP(con, wil),
				willpower: wil,
				sd: derived.calculateSD(dex, wis, size),
				resilience: derived.calculateResilience(size, level),
				imported: true,
				importedData: data,
			});

			updateState({ combatants: [...useCombatStore.getState().encounterState.combatants, c] });
			setImportModalOpen(false);
			showToast(`Imported ${c.name}`);
		},
		[updateState, setImportModalOpen],
	);

	// -----------------------------------------------------------------------
	// Encounter persistence
	// -----------------------------------------------------------------------

	const saveEncounter = useCallback(() => {
		const s = useCombatStore.getState().encounterState;
		const id = s.encounterId || genId();
		const name =
			s.combatants.length > 0 ? `Encounter (${s.combatants.map((c) => c.name).join(", ")})` : `Empty Encounter`;
		const timestamp = new Date().toLocaleString();
		const displayName = `${name} - ${timestamp}`;

		localStorage.setItem(ENCOUNTER_PREFIX + id, JSON.stringify({ ...s, encounterId: id }));

		const list = loadEncounterList();
		const existingIdx = list.findIndex((e) => e.id === id);
		if (existingIdx >= 0) {
			list[existingIdx].name = displayName;
		} else {
			list.push({ id, name: displayName });
		}
		localStorage.setItem(ENCOUNTER_LIST_KEY, JSON.stringify(list));

		setEncounterState({ ...s, encounterId: id });
		setEncounterList(list);
		showToast("Encounter saved");
	}, [setEncounterState, setEncounterList]);

	const loadEncounter = useCallback(
		(id: string) => {
			try {
				const raw = localStorage.getItem(ENCOUNTER_PREFIX + id);
				if (!raw) {
					showToast("Encounter not found");
					return;
				}
				const loaded: EncounterState = JSON.parse(raw);
				setEncounterState(loaded);
				setRoundAlerts([]);
				showToast("Encounter loaded");
			} catch {
				showToast("Failed to load encounter");
			}
		},
		[setEncounterState, setRoundAlerts],
	);

	const exportEncounter = useCallback(() => {
		const s = useCombatStore.getState().encounterState;
		const blob = new Blob([JSON.stringify(s, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `encounter-${s.round}-${Date.now()}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showToast("Encounter exported");
	}, []);

	const clearEncounter = useCallback(() => {
		setEncounterState(defaultEncounterState());
		setRoundAlerts([]);
		showToast("Encounter cleared");
	}, [setEncounterState, setRoundAlerts]);

	// -----------------------------------------------------------------------
	// Reference sidebar actions
	// -----------------------------------------------------------------------

	const rollHitLocation = useCallback(() => {
		const result = roll(1, 1, 0);
		const val = Math.min(10, Math.max(1, result.total));
		const loc = HIT_LOCATIONS.find((h) => h.roll === val);
		setHitLocationResult(loc ? `Rolled ${val}: ${loc.location}` : `Rolled ${val}`);
	}, [setHitLocationResult]);

	const handleCalcDamage = useCallback(
		(raw: number, ap: number, pen: number, resilience: number) => {
			const wounds = calculateDamage(raw, ap, pen, resilience);
			setDamageCalcResult(
				`Raw ${raw} - AP ${ap} (pen ${pen}) = ${Math.max(0, raw - Math.max(0, ap - pen))} ` +
					`\u00f7 Res ${resilience} = ${wounds} wound${wounds !== 1 ? "s" : ""}`,
			);
		},
		[setDamageCalcResult],
	);

	// -----------------------------------------------------------------------
	// Computed values
	// -----------------------------------------------------------------------

	const tieSet = computeTieSet(state.combatants);

	// -----------------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------------

	return (
		<>
			<header className="sticky top-0 z-[100] flex items-center gap-md py-sm px-lg bg-surface border-b border-border max-[768px]:flex-wrap max-[768px]:p-sm">
				<h1 className="m-0 text-xl text-accent whitespace-nowrap max-[768px]:text-base">Combat Tracker</h1>
				<div className="flex items-center gap-sm ml-auto px-md py-xs bg-bg border border-border rounded-md max-[768px]:ml-0">
					<span className="text-xs uppercase tracking-[0.5px] text-text-muted">Round</span>
					<span className="text-[1.75rem] font-bold text-accent leading-none min-w-[2ch] text-center">
						{state.round}
					</span>
				</div>
				<Button variant="primary" onClick={handleEndRound}>
					End Round
				</Button>
			</header>

			{roundAlerts.length > 0 && (
				<div className="px-lg py-sm bg-warning-bg border-b border-warning text-warning text-[0.85rem]">
					<strong>End-of-Round Effects:</strong>
					<ul className="m-0 pl-lg">{roundAlerts}</ul>
				</div>
			)}

			<div className="flex gap-0 min-h-[calc(100vh-60px-48px)]">
				<main className="flex-1 min-w-0 p-lg max-[768px]:p-md">
					<AddCombatantForm onAdd={addCombatant} />
					<QuickAddRow
						onQuickAdd={handleQuickAdd}
						onImportSheet={openImportModal}
						onRollAll={rollAllInitiative}
					/>
					<div className="flex flex-col gap-md mb-lg">
						{state.combatants.length === 0 ? (
							<div className="text-center px-lg py-xl text-text-dim">
								<div className="text-[3rem] mb-md">\u2694\uFE0F</div>
								<p>No combatants yet. Add some above to begin.</p>
							</div>
						) : (
							state.combatants.map((c, i) => (
								<CombatantCard
									key={c.id}
									combatant={c}
									isActive={state.encounterStarted && i === state.activeTurnIndex}
									hasTie={tieSet.has(c.id)}
									roundNumber={state.round}
									onModifyHP={modifyHP}
									onModifyResource={modifyResource}
									onRemove={removeCombatant}
									onRerollInit={rollSingleInitiative}
									onToggleAction={toggleActionToken}
									onAddCondition={openConditionPicker}
									onRemoveCondition={removeCondition}
									onNotesChange={updateNotes}
								/>
							))
						)}
					</div>
					<div className="flex justify-center gap-md py-md max-[768px]:flex-col max-[768px]:items-stretch">
						<Button onClick={previousTurn}>&#x2190; Previous Turn</Button>
						<Button variant="primary" onClick={nextTurn}>
							Next Turn &#x2192;
						</Button>
					</div>
				</main>

				<ReferenceSidebar
					isOpen={sidebarOpen}
					onClose={() => {
						setSidebarOpen(false);
					}}
					onRollLocation={rollHitLocation}
					hitLocationResult={hitLocationResult}
					damageResult={damageCalcResult}
					onCalcDamage={handleCalcDamage}
				/>
			</div>

			<Button
				className="hidden max-[1099px]:flex fixed bottom-[60px] right-md z-[90]"
				onClick={() => {
					setSidebarOpen(!sidebarOpen);
				}}
			>
				&#x2630; Reference
			</Button>

			<EncounterBar
				encounters={encounterList}
				onSave={saveEncounter}
				onLoad={loadEncounter}
				onExport={exportEncounter}
				onClear={clearEncounter}
			/>

			<ImportModal
				isOpen={importModalOpen}
				characters={importCharList}
				onImport={handleImportChar}
				onClose={() => {
					setImportModalOpen(false);
				}}
			/>

			{conditionPickerState && (
				<ConditionPicker
					combatantId={conditionPickerState.combatantId}
					existingConditions={
						state.combatants.find((c) => c.id === conditionPickerState?.combatantId)?.conditions ?? []
					}
					anchorRect={conditionPickerState.rect}
					onPick={addCondition}
					onClose={() => {
						setConditionPickerState(null);
					}}
				/>
			)}

			<Toast />
		</>
	);
}
