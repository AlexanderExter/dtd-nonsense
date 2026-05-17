import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import {
	computeStyleCost,
	getAllAvailableTechniques,
	getAvailableActions,
	getAvailableWeapons,
	MELEE_SCHOOLS,
	RANGED_SCHOOLS,
	type SchoolTechnique,
	UNIVERSAL_ADVANTAGES,
	UNIVERSAL_RESTRICTIONS,
} from "@/lib/dtd/attacks-data";
import type { SpecialAttackEntry } from "@/lib/dtd/types";
import { useCharSheetStore } from "../store";

interface DraftAttack {
	action: string;
	attackType: "melee" | "ranged";
	name: string;
	notes: string;
	selectedTechniques: SchoolTechnique[];
	weapon: string;
}

function emptyDraft(type: "melee" | "ranged"): DraftAttack {
	return { attackType: type, name: "", notes: "", action: "", weapon: "", selectedTechniques: [] };
}

const XP_PER_STYLE_POINT = 50;

// =============================================================================
// Technique row (reused in both builders)
// =============================================================================

function TechniqueRow({
	tech,
	isSelected,
	count,
	onToggle,
	onStack,
	schoolName,
}: {
	count: number;
	isSelected: boolean;
	onStack: () => void;
	onToggle: (checked: boolean) => void;
	schoolName?: string;
	tech: SchoolTechnique;
}) {
	const isRestriction = tech.type === "restriction";
	return (
		<div className="flex items-center gap-sm rounded-sm border border-border bg-bg px-sm py-xs text-xs">
			<GameCheckbox checked={isSelected} onChange={(e) => onToggle((e.target as HTMLInputElement).checked)} />
			<span className={`min-w-0 flex-1 ${isRestriction ? "text-error" : "text-text-primary"}`}>
				{tech.name}
				{schoolName && <span className="ml-1 text-text-dim text-xs">[{schoolName}]</span>}
				<span className={`ml-1 ${isRestriction ? "text-error/60" : "text-text-muted"}`}>— {tech.effect}</span>
			</span>
			<span className={`font-mono text-xs ${isRestriction ? "text-error" : "text-accent"}`}>
				{tech.cost > 0 ? `+${tech.cost}` : tech.cost} SP
			</span>
			{tech.stackable && isSelected && (
				<button
					className={`cursor-pointer rounded border px-1.5 py-0.5 text-xs ${isRestriction ? "border-error/30 bg-error/10 text-error" : "border-accent/30 bg-accent/10 text-accent"}`}
					onClick={onStack}
					title="Add another stack"
					type="button"
				>
					+Stack ({count})
				</button>
			)}
		</div>
	);
}

// =============================================================================
// Builder Panel (reused for both Special Attacks and Trick Shots)
// =============================================================================

function AttackBuilder({
	attackType,
	label,
	savedAttacks,
	onSave,
	onDelete,
	weapons,
	actions,
	techniques,
}: {
	actions: string[];
	attackType: "melee" | "ranged";
	label: string;
	onDelete: (idx: number) => void;
	onSave: (entry: SpecialAttackEntry, editIdx: number | null) => void;
	savedAttacks: SpecialAttackEntry[];
	techniques: Array<SchoolTechnique & { schoolName: string }>;
	weapons: string[];
}) {
	const [draft, setDraft] = useState<DraftAttack>(emptyDraft(attackType));
	const [editIdx, setEditIdx] = useState<number | null>(null);

	const totalCost = useMemo(() => computeStyleCost(draft.selectedTechniques), [draft.selectedTechniques]);
	const xpCost = totalCost * XP_PER_STYLE_POINT;

	const toggleTechnique = useCallback((tech: SchoolTechnique, checked: boolean) => {
		setDraft((d) => {
			const filtered = d.selectedTechniques.filter((t) => t.name !== tech.name);
			return { ...d, selectedTechniques: checked ? [...filtered, tech] : filtered };
		});
	}, []);

	const addStack = useCallback((tech: SchoolTechnique) => {
		setDraft((d) => ({ ...d, selectedTechniques: [...d.selectedTechniques, { ...tech }] }));
	}, []);

	const saveAttack = useCallback(() => {
		if (!(draft.name.trim() && draft.weapon && draft.action)) return;
		const entry: SpecialAttackEntry = {
			action: draft.action,
			attackType,
			id: editIdx !== null ? savedAttacks[editIdx]?.id || crypto.randomUUID() : crypto.randomUUID(),
			name: draft.name.trim(),
			notes: draft.notes.trim() || undefined,
			styleCost: totalCost,
			techniques: draft.selectedTechniques.map((t) => ({
				cost: t.cost,
				name: t.name,
				type: t.type === "base" ? "advantage" : t.type,
			})),
			weapon: draft.weapon,
		};
		onSave(entry, editIdx);
		setDraft(emptyDraft(attackType));
		setEditIdx(null);
	}, [draft, editIdx, savedAttacks, totalCost, attackType, onSave]);

	const startEdit = useCallback(
		(idx: number) => {
			const attack = savedAttacks[idx];
			if (!attack) return;
			setDraft({
				attackType,
				name: attack.name,
				notes: attack.notes || "",
				action: attack.action || "",
				weapon: attack.weapon || "",
				selectedTechniques: attack.techniques.map((t) => {
					const found =
						techniques.find((st) => st.name === t.name) ||
						UNIVERSAL_ADVANTAGES.find((u) => u.name === t.name) ||
						UNIVERSAL_RESTRICTIONS.find((u) => u.name === t.name);
					return found || { name: t.name, cost: t.cost, rank: 0, type: t.type, effect: "" };
				}),
			});
			setEditIdx(idx);
		},
		[savedAttacks, techniques, attackType],
	);

	const cancelEdit = useCallback(() => {
		setDraft(emptyDraft(attackType));
		setEditIdx(null);
	}, [attackType]);

	const hasSchools = weapons.length > 0;

	return (
		<>
			{/* Saved List */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">
					{label} ({savedAttacks.length})
				</h3>
				{savedAttacks.length === 0 && (
					<p className="text-sm text-text-muted italic">
						{hasSchools
							? `No ${label.toLowerCase()} yet. Use the builder below.`
							: `Learn ${attackType === "melee" ? "Sword Schools" : "Gun Kata"} in the Powers tab to unlock the builder.`}
					</p>
				)}
				<div className="space-y-sm">
					{savedAttacks.map((attack, idx) => (
						<div
							className="flex flex-wrap items-start gap-sm rounded-sm border border-border bg-bg p-md"
							key={attack.id}
						>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-sm">
									<strong className="text-sm text-text-primary">{attack.name}</strong>
									<span className="rounded-sm bg-accent/10 px-xs py-0.5 text-accent text-xs">
										{attack.weapon} — {attack.action}
									</span>
									<span className="text-text-muted text-xs">
										{attack.styleCost} SP · {attack.styleCost * XP_PER_STYLE_POINT} XP
									</span>
								</div>
								{attack.techniques.length > 0 && (
									<div className="mt-xs flex flex-wrap gap-1">
										{attack.techniques.map((t, ti) => (
											<span
												className={`rounded px-1.5 py-0.5 text-xs ${
													t.type === "restriction"
														? "bg-error/10 text-error"
														: "bg-success/10 text-success"
												}`}
												// biome-ignore lint/suspicious/noArrayIndexKey: stacked techniques share name+cost
												key={`${t.name}:${t.cost}:${ti}`}
											>
												{t.name} ({t.cost > 0 ? `+${t.cost}` : t.cost})
											</span>
										))}
									</div>
								)}
								{attack.notes && <p className="mt-xs text-text-muted text-xs">{attack.notes}</p>}
							</div>
							<div className="flex gap-xs">
								<Button onClick={() => startEdit(idx)} size="sm" variant="secondary">
									Edit
								</Button>
								<Button onClick={() => onDelete(idx)} size="sm" variant="ghost">
									×
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Builder */}
			{hasSchools && (
				<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
					<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">
						{editIdx !== null ? `Edit ${label.replace(/s$/, "")}` : `${label.replace(/s$/, "")} Builder`}
					</h3>

					{/* Name + Weapon + Action + Notes */}
					<div className="mb-md flex flex-wrap gap-md">
						<label className="flex min-w-[140px] flex-1 flex-col text-xs uppercase tracking-tight-px">
							Name
							<GameInput
								onInput={(e) => setDraft((d) => ({ ...d, name: (e.target as HTMLInputElement).value }))}
								placeholder={`${label.replace(/s$/, "")} name`}
								type="text"
								value={draft.name}
							/>
						</label>
						<label className="flex flex-col text-xs uppercase tracking-tight-px">
							Weapon
							<GameSelect
								onChange={(e) =>
									setDraft((d) => ({ ...d, weapon: (e.target as HTMLSelectElement).value }))
								}
								value={draft.weapon}
							>
								<option value="">— Weapon —</option>
								{weapons.map((w) => (
									<option key={w} value={w}>
										{w}
									</option>
								))}
							</GameSelect>
						</label>
						<label className="flex flex-col text-xs uppercase tracking-tight-px">
							Action
							<GameSelect
								onChange={(e) =>
									setDraft((d) => ({ ...d, action: (e.target as HTMLSelectElement).value }))
								}
								value={draft.action}
							>
								<option value="">— Action —</option>
								{actions.map((a) => (
									<option key={a} value={a}>
										{a}
									</option>
								))}
							</GameSelect>
						</label>
						<label className="flex min-w-[100px] flex-1 flex-col text-xs uppercase tracking-tight-px">
							Notes
							<GameInput
								onInput={(e) =>
									setDraft((d) => ({ ...d, notes: (e.target as HTMLInputElement).value }))
								}
								placeholder="Optional notes"
								type="text"
								value={draft.notes}
							/>
						</label>
					</div>

					{/* Technique Pickers */}
					<div className="mb-md space-y-md">
						{/* School Techniques */}
						{techniques.length > 0 && (
							<div>
								<h4 className="m-0 mb-sm text-sm text-text-primary">
									{attackType === "melee" ? "Sword School" : "Gun Kata"} Techniques
								</h4>
								<div className="space-y-1">
									{techniques.map((tech) => {
										const isSelected = draft.selectedTechniques.some((t) => t.name === tech.name);
										const count = draft.selectedTechniques.filter(
											(t) => t.name === tech.name,
										).length;
										return (
											<TechniqueRow
												count={count}
												isSelected={isSelected}
												key={`${tech.schoolName}:${tech.name}`}
												onStack={() => addStack(tech)}
												onToggle={(c) => toggleTechnique(tech, c)}
												schoolName={tech.schoolName}
												tech={tech}
											/>
										);
									})}
								</div>
							</div>
						)}

						{/* Universal Advantages */}
						<div>
							<h4 className="m-0 mb-sm text-sm text-text-primary">Universal Advantages</h4>
							<div className="space-y-1">
								{UNIVERSAL_ADVANTAGES.map((tech) => {
									const isSelected = draft.selectedTechniques.some((t) => t.name === tech.name);
									const count = draft.selectedTechniques.filter((t) => t.name === tech.name).length;
									return (
										<TechniqueRow
											count={count}
											isSelected={isSelected}
											key={tech.name}
											onStack={() => addStack(tech)}
											onToggle={(c) => toggleTechnique(tech, c)}
											tech={tech}
										/>
									);
								})}
							</div>
						</div>

						{/* Universal Restrictions */}
						<div>
							<h4 className="m-0 mb-sm text-error/80 text-sm">Universal Restrictions</h4>
							<div className="space-y-1">
								{UNIVERSAL_RESTRICTIONS.map((tech) => {
									const isSelected = draft.selectedTechniques.some((t) => t.name === tech.name);
									const count = draft.selectedTechniques.filter((t) => t.name === tech.name).length;
									return (
										<TechniqueRow
											count={count}
											isSelected={isSelected}
											key={tech.name}
											onStack={() => addStack(tech)}
											onToggle={(c) => toggleTechnique(tech, c)}
											tech={tech}
										/>
									);
								})}
							</div>
						</div>
					</div>

					{/* Budget summary + Save */}
					<div className="flex flex-wrap items-center gap-md border-border border-t pt-md">
						<div className="space-y-0.5">
							<span className="font-semibold text-sm">
								Style Point Budget:{" "}
								<span className={totalCost < 0 ? "text-error" : "text-accent"}>{totalCost} SP</span>
							</span>
							<div className="text-text-muted text-xs">
								XP Cost: <strong>{xpCost} XP</strong>{" "}
								<span className="text-text-dim">
									({XP_PER_STYLE_POINT} XP × {totalCost} SP)
								</span>
							</div>
						</div>
						{totalCost < 0 && (
							<span className="text-error text-xs">Net cost must be ≥ 0 (add more advantages)</span>
						)}
						<div className="ml-auto flex gap-sm">
							{editIdx !== null && (
								<Button onClick={cancelEdit} size="sm" variant="secondary">
									Cancel
								</Button>
							)}
							<Button
								disabled={!(draft.name.trim() && draft.weapon && draft.action) || totalCost < 0}
								onClick={saveAttack}
								size="sm"
								variant="primary"
							>
								{editIdx !== null ? "Update" : "Save"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

// =============================================================================
// Main Tab
// =============================================================================

export function AttacksTab() {
	const char = useCharSheetStore((s) => s.char);
	const updateChar = useCharSheetStore((s) => s.updateChar);

	const meleeRanks = char.swordSchools || {};
	const rangedRanks = char.gunKata || {};

	const meleeWeapons = useMemo(() => getAvailableWeapons(MELEE_SCHOOLS, meleeRanks), [meleeRanks]);
	const meleeActions = useMemo(() => getAvailableActions(MELEE_SCHOOLS, meleeRanks), [meleeRanks]);
	const meleeTechniques = useMemo(() => getAllAvailableTechniques(MELEE_SCHOOLS, meleeRanks), [meleeRanks]);

	const rangedWeapons = useMemo(() => getAvailableWeapons(RANGED_SCHOOLS, rangedRanks), [rangedRanks]);
	const rangedActions = useMemo(() => getAvailableActions(RANGED_SCHOOLS, rangedRanks), [rangedRanks]);
	const rangedTechniques = useMemo(() => getAllAvailableTechniques(RANGED_SCHOOLS, rangedRanks), [rangedRanks]);

	const allConstructed = useMemo(
		() =>
			(char.specialAttacks || []).filter(
				(a): a is SpecialAttackEntry => typeof a === "object" && "techniques" in a,
			),
		[char.specialAttacks],
	);
	const meleeAttacks = useMemo(() => allConstructed.filter((a) => a.attackType === "melee"), [allConstructed]);
	const rangedAttacks = useMemo(() => allConstructed.filter((a) => a.attackType === "ranged"), [allConstructed]);

	const handleSave = useCallback(
		(entry: SpecialAttackEntry, editIdx: number | null) => {
			updateChar((c) => {
				if (!c.specialAttacks) c.specialAttacks = [];
				if (editIdx !== null) {
					let typeCount = -1;
					for (let i = 0; i < c.specialAttacks.length; i++) {
						const a = c.specialAttacks[i];
						if (typeof a === "object" && "techniques" in a && a.attackType === entry.attackType) {
							typeCount++;
							if (typeCount === editIdx) {
								c.specialAttacks[i] = entry;
								return;
							}
						}
					}
				}
				c.specialAttacks.push(entry);
			});
		},
		[updateChar],
	);

	const handleDelete = useCallback(
		(attackType: "melee" | "ranged", idx: number) => {
			updateChar((c) => {
				let typeCount = -1;
				c.specialAttacks = c.specialAttacks.filter((a) => {
					if (typeof a === "object" && "techniques" in a && a.attackType === attackType) {
						typeCount++;
						return typeCount !== idx;
					}
					return true;
				});
			});
		},
		[updateChar],
	);

	return (
		<section className="tab-panel panel-attacks">
			<AttackBuilder
				actions={meleeActions}
				attackType="melee"
				label="Special Attacks"
				onDelete={(idx) => handleDelete("melee", idx)}
				onSave={handleSave}
				savedAttacks={meleeAttacks}
				techniques={meleeTechniques}
				weapons={meleeWeapons}
			/>
			<AttackBuilder
				actions={rangedActions}
				attackType="ranged"
				label="Trick Shots"
				onDelete={(idx) => handleDelete("ranged", idx)}
				onSave={handleSave}
				savedAttacks={rangedAttacks}
				techniques={rangedTechniques}
				weapons={rangedWeapons}
			/>
		</section>
	);
}
