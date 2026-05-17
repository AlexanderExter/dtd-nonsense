import { useState } from "react";
import { AddButton } from "@/components/react/ui/AddButton";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { NumberInput } from "@/components/react/ui/NumberInput";
import { SectionHeading } from "@/components/react/ui/SectionHeading";
import type { MeleeWeapon, RangedWeapon } from "@/lib/dtd/types";
import { DAMAGE_TYPES, getEffChars, getLevel, PROFICIENCY_MELEE, PROFICIENCY_RANGED } from "../constants";
import { useCharSheetStore } from "../store";

interface WeaponTableProps {
	type: "melee" | "ranged";
}

function emptyMelee(): MeleeWeapon {
	return {
		name: "",
		damage: "",
		damageType: "",
		proficiency: "",
		qualities: "",
		notes: "",
		pen: "",
	};
}

function emptyRanged(): RangedWeapon {
	return {
		name: "",
		damage: "",
		damageType: "",
		range: "",
		proficiency: "",
		qualities: "",
		notes: "",
		pen: "",
		rof: "",
		clip: "",
		reload: "",
	};
}

/**
 * Compute final attack notation.
 * Skill provides the baseline dice/keep. Additional inputs add on top.
 */
function computeAttack(
	skillDice: number,
	skillKeep: number,
	extraDice: number,
	extraKeep: number,
	fixed: number,
	level: number,
	w: MeleeWeapon | RangedWeapon,
): { rolled: number; kept: number; fixed: number; parts: string[] } {
	const parts: string[] = [];
	let rolled = skillDice;
	let kept = skillKeep;
	if (skillDice) parts.push(`Skill ${skillDice}k${skillKeep}`);
	if (extraDice || extraKeep) {
		rolled += extraDice;
		kept += extraKeep;
		parts.push(`+${extraDice}k${extraKeep}`);
	}
	if (w.proficient && level) {
		rolled += level;
		parts.push(`Prof +${level}`);
	}
	if (w.hasWeaponFocus) {
		rolled += 2;
		parts.push("WF +2");
	}
	if (w.hasImprovedWeaponFocus) {
		kept += 1;
		parts.push("IWF +0k1");
	}
	if (fixed) parts.push(`Fixed +${fixed}`);
	return { rolled, kept, fixed, parts };
}

/**
 * Compute final damage notation from base dice/keep + modifier bonuses.
 */
function computeDamage(
	baseDice: number,
	baseKeep: number,
	fixed: number,
	strVal: number,
	isMelee: boolean,
	w: MeleeWeapon | RangedWeapon,
): { rolled: number; kept: number; flat: number; parts: string[] } {
	const parts: string[] = [];
	let rolled = baseDice;
	let kept = baseKeep;
	let flat = fixed;
	if (baseDice) parts.push(`Base ${baseDice}k${baseKeep}`);
	if (isMelee && strVal > 0) {
		rolled += strVal;
		parts.push(`Str +${strVal}`);
	}
	if (w.hasSpecialization) {
		rolled += 2;
		parts.push("Spec +2");
	}
	if (w.hasImprovedWeaponSpec) {
		kept += 1;
		parts.push("IWS +0k1");
	}
	if (isMelee && (w as MeleeWeapon).hasCrushingBlow) {
		flat += 2;
		parts.push("CB +2♭");
	}
	if (!isMelee && (w as RangedWeapon).hasMightyShot) {
		flat += 2;
		parts.push("MS +2♭");
	}
	if (fixed) parts.push(`Fixed +${fixed}♭`);
	return { rolled, kept, flat, parts };
}

function formatNotation(rolled: number, kept: number, flat?: number): string {
	if (!(rolled || kept)) return "—";
	let result = `${rolled}k${kept}`;
	if (flat && flat > 0) result += ` +${flat}`;
	else if (flat && flat < 0) result += ` ${flat}`;
	return result;
}

/** Parse legacy "XkY" damage string into dice/keep. */
function parseDkNotation(s: string): { dice: number; keep: number } | null {
	const m = s.match(/(\d+)k(\d+)/);
	if (!m) return null;
	return { dice: Number(m[1]), keep: Number(m[2]) };
}

export function WeaponTable({ type }: WeaponTableProps) {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);
	const isMelee = type === "melee";
	const weapons = isMelee ? char.meleeWeapons || [] : char.rangedWeapons || [];
	const profList = isMelee ? PROFICIENCY_MELEE : PROFICIENCY_RANGED;
	const effChars = getEffChars(char, data?.races);
	const level = getLevel(char);
	const [expanded, setExpanded] = useState<Record<number, boolean>>({});

	// Skill options for attack roll dropdown
	const skillOptions: Array<{ id: string; name: string }> = [];
	if (data?.skills) {
		const groups = data.skills.skills || {};
		for (const cat of Object.values(groups) as Array<Array<{ id: string; name: string }>>) {
			for (const sk of cat) skillOptions.push(sk);
		}
	}

	// Build datalist options from weapon data
	const weaponOptions: string[] = [];
	if (data?.weapons) {
		const wList = isMelee ? data.weapons.melee || [] : data.weapons.ranged || [];
		for (const w of wList) {
			if (w.name) weaponOptions.push(w.name);
		}
	}
	const datalistId = `dl-${type}-weapons`;

	const handleFieldChange = (idx: number, field: string, value: string) => {
		updateChar((c) => {
			const list = isMelee ? c.meleeWeapons : c.rangedWeapons;
			if (list[idx]) (list[idx] as any)[field] = value;
		});
	};

	const handleBoolChange = (idx: number, field: string, value: boolean) => {
		updateChar((c) => {
			const list = isMelee ? c.meleeWeapons : c.rangedWeapons;
			if (list[idx]) (list[idx] as any)[field] = value;
		});
	};

	const handleNumChange = (idx: number, field: string, value: number) => {
		updateChar((c) => {
			const list = isMelee ? c.meleeWeapons : c.rangedWeapons;
			if (list[idx]) (list[idx] as any)[field] = value;
		});
	};

	const handleAdd = () => {
		updateChar((c) => {
			if (isMelee) {
				c.meleeWeapons = [...c.meleeWeapons, emptyMelee()];
			} else {
				c.rangedWeapons = [...c.rangedWeapons, emptyRanged()];
			}
		});
	};

	const handleRemove = (idx: number) => {
		updateChar((c) => {
			if (isMelee) {
				c.meleeWeapons = c.meleeWeapons.filter((_, i) => i !== idx);
			} else {
				c.rangedWeapons = c.rangedWeapons.filter((_, i) => i !== idx);
			}
		});
	};

	const toggleExpanded = (idx: number) => {
		setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
	};

	const colCount = isMelee ? 8 : 8;
	const thClass =
		"text-xs uppercase tracking-wide-px px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap";
	const tdClass = "py-2xs px-sm border-b border-border align-middle";
	return (
		<div>
			<SectionHeading>{isMelee ? "Melee Weapons" : "Ranged Weapons"}</SectionHeading>
			<datalist id={datalistId}>
				{weaponOptions.map((n) => (
					<option key={n} value={n} />
				))}
			</datalist>
			<table className="w-full border-collapse text-xs">
				<thead>
					<tr>
						<th className={thClass} />
						<th className={thClass}>Name</th>
						<th className={thClass}>Attack</th>
						<th className={thClass}>Damage</th>
						<th className={thClass}>Pen</th>
						<th className={thClass}>Type</th>
						<th className={thClass}>Special</th>
						<th className={thClass}>Notes</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{weapons.map((w, idx) => {
						// Attack: skill provides baseline, attackDice/attackKeep are additional
						const atkSkillVal = w.attackSkill ? char.skills[w.attackSkill] || 0 : 0;
						const skillDice = atkSkillVal;
						const skillKeep = atkSkillVal ? Math.max(1, Math.ceil(atkSkillVal / 2)) : 0;
						const extraAtkDice = w.attackDice || 0;
						const extraAtkKeep = w.attackKeep || 0;
						const atk = computeAttack(
							skillDice,
							skillKeep,
							extraAtkDice,
							extraAtkKeep,
							w.fixedAttackBonus || 0,
							level,
							w,
						);
						const attackNotation =
							skillDice || extraAtkDice ? formatNotation(atk.rolled, atk.kept, atk.fixed) : "—";

						// Resolve base damage dice/keep — from explicit fields, or parse legacy "XkY" string
						const legacyDmg = w.damage ? parseDkNotation(w.damage) : null;
						const baseDmgDice = w.damageDice ?? legacyDmg?.dice ?? 0;
						const baseDmgKeep = w.damageKeep ?? legacyDmg?.keep ?? 0;
						const dmg = computeDamage(
							baseDmgDice,
							baseDmgKeep,
							w.fixedDamageBonus || 0,
							effChars.strength || 0,
							isMelee,
							w,
						);
						const damageNotation = baseDmgDice ? formatNotation(dmg.rolled, dmg.kept, dmg.flat) : "—";

						const isOpen = expanded[idx];

						/** When skill dropdown changes, just update the skill reference */
						const handleSkillChange = (skillId: string) => {
							handleFieldChange(idx, "attackSkill", skillId);
						};
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: editable list items identified by position
							<WeaponRow key={`weapon-${idx}`}>
								{/* ── Collapsed summary row ── */}
								<tr className={isOpen ? "bg-bg/50" : undefined}>
									<td className={`${tdClass} w-7 text-center`}>
										<button
											className="cursor-pointer border-none bg-transparent p-0 text-text-muted text-xs leading-none"
											onClick={() => toggleExpanded(idx)}
											title={isOpen ? "Collapse" : "Expand weapon details"}
											type="button"
										>
											{isOpen ? "▾" : "▸"}
										</button>
									</td>
									<td className={tdClass}>
										<GameInput
											list={datalistId}
											onInput={(e) =>
												handleFieldChange(idx, "name", (e.target as HTMLInputElement).value)
											}
											value={w.name}
										/>
									</td>
									<td className={`${tdClass} whitespace-nowrap`}>
										<span className="font-bold text-accent text-sm">{attackNotation}</span>
									</td>
									<td className={`${tdClass} whitespace-nowrap`}>
										<span className="font-bold text-accent text-sm">{damageNotation}</span>
									</td>
									<td className={`${tdClass} text-center`}>
										<span className="text-xs">{w.pen || "—"}</span>
									</td>
									<td className={tdClass}>
										<span className="text-xs">{w.damageType || "—"}</span>
									</td>
									<td className={tdClass}>
										<span className="text-text-muted text-xs">
											{w.special || w.qualities || "—"}
										</span>
									</td>
									<td className={tdClass}>
										<span className="text-text-muted text-xs">{w.notes || "—"}</span>
									</td>
									<td className={`${tdClass} w-9 text-center`}>
										<button
											className="cursor-pointer border-none bg-transparent p-0.5 text-base text-error leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
											onClick={() => handleRemove(idx)}
											title="Remove"
											type="button"
										>
											×
										</button>
									</td>
								</tr>

								{/* ── Expanded detail area ── */}
								{isOpen && (
									<tr>
										<td className="border-border border-b bg-bg px-md py-sm" colSpan={colCount + 1}>
											<div className="@container grid grid-cols-2 gap-md">
												{/* ── Attack Roll ── */}
												<div className="flex flex-col gap-xs rounded border border-border/50 bg-surface/50 p-sm">
													<span className="font-semibold text-text-muted text-xs uppercase tracking-wide-px">
														Attack Roll
													</span>
													<div className="flex flex-wrap items-center gap-sm">
														<GameSelect
															className="min-w-[120px] text-xs"
															onChange={(e) =>
																handleSkillChange((e.target as HTMLSelectElement).value)
															}
															value={w.attackSkill || ""}
														>
															<option value="">— Skill —</option>
															{skillOptions.map((sk) => (
																<option key={sk.id} value={sk.id}>
																	{sk.name} [{char.skills[sk.id] || 0}]
																</option>
															))}
														</GameSelect>
														{atkSkillVal > 0 && (
															<span className="text-text-muted text-xs">
																→ {skillDice}k{skillKeep}
															</span>
														)}
													</div>
													<div className="flex items-center gap-sm text-xs">
														{/* biome-ignore lint/a11y/noLabelWithoutControl: NumberInput wraps input in div */}
														<label className="flex items-center gap-1 text-text-muted">
															+Dice
															<NumberInput
																min={0}
																onChange={(v) => handleNumChange(idx, "attackDice", v)}
																value={extraAtkDice}
															/>
														</label>
														{/* biome-ignore lint/a11y/noLabelWithoutControl: NumberInput wraps input in div */}
														<label className="flex items-center gap-1 text-text-muted">
															+Keep
															<NumberInput
																min={0}
																onChange={(v) => handleNumChange(idx, "attackKeep", v)}
																value={extraAtkKeep}
															/>
														</label>
														{/* biome-ignore lint/a11y/noLabelWithoutControl: NumberInput wraps input in div */}
														<label className="flex items-center gap-1 text-text-muted">
															+Fixed
															<NumberInput
																min={0}
																onChange={(v) =>
																	handleNumChange(idx, "fixedAttackBonus", v)
																}
																value={w.fixedAttackBonus || 0}
															/>
														</label>
														{(skillDice > 0 || extraAtkDice > 0) && (
															<span className="ml-auto font-bold text-accent">
																= {attackNotation}
															</span>
														)}
													</div>
													{atk.parts.length > 1 && (
														<span className="text-text-dim text-xs">
															{atk.parts.join(" → ")}
														</span>
													)}
												</div>

												{/* ── Damage Roll ── */}
												<div className="flex flex-col gap-xs rounded border border-border/50 bg-surface/50 p-sm">
													<span className="font-semibold text-text-muted text-xs uppercase tracking-wide-px">
														Damage Roll
													</span>
													<div className="flex items-center gap-sm text-xs">
														{/* biome-ignore lint/a11y/noLabelWithoutControl: NumberInput wraps input in div */}
														<label className="flex items-center gap-1 text-text-muted">
															Dice
															<NumberInput
																min={0}
																onChange={(v) => handleNumChange(idx, "damageDice", v)}
																value={baseDmgDice}
															/>
														</label>
														{/* biome-ignore lint/a11y/noLabelWithoutControl: NumberInput wraps input in div */}
														<label className="flex items-center gap-1 text-text-muted">
															Keep
															<NumberInput
																min={0}
																onChange={(v) => handleNumChange(idx, "damageKeep", v)}
																value={baseDmgKeep}
															/>
														</label>
														{/* biome-ignore lint/a11y/noLabelWithoutControl: NumberInput wraps input in div */}
														<label className="flex items-center gap-1 text-text-muted">
															Fixed
															<NumberInput
																onChange={(v) =>
																	handleNumChange(idx, "fixedDamageBonus", v)
																}
																value={w.fixedDamageBonus || 0}
															/>
														</label>
														{baseDmgDice > 0 && (
															<span className="ml-auto font-bold text-accent">
																= {damageNotation}
															</span>
														)}
													</div>
													{dmg.parts.length > 1 && (
														<span className="text-text-dim text-xs">
															{dmg.parts.join(" → ")}
														</span>
													)}
												</div>

												{/* ── Weapon Info ── */}
												<div className="flex flex-col gap-xs rounded border border-border/50 bg-surface/50 p-sm">
													<span className="font-semibold text-text-muted text-xs uppercase tracking-wide-px">
														Weapon Info
													</span>
													<div className="flex flex-wrap items-center gap-sm">
														<label className="flex items-center gap-1 text-text-muted text-xs">
															Class
															<GameSelect
																className="max-w-[110px] px-0.5 py-[1px] text-xs"
																onChange={(e) =>
																	handleFieldChange(
																		idx,
																		"proficiency",
																		(e.target as HTMLSelectElement).value,
																	)
																}
																value={w.proficiency}
															>
																<option value="">—</option>
																{profList.map((p) => (
																	<option key={p} value={p}>
																		{p}
																	</option>
																))}
															</GameSelect>
														</label>
														<label className="flex items-center gap-1 text-text-muted text-xs">
															Pen
															<GameInput
																className="w-12"
																onInput={(e) =>
																	handleFieldChange(
																		idx,
																		"pen",
																		(e.target as HTMLInputElement).value,
																	)
																}
																value={w.pen || ""}
															/>
														</label>
														<label className="flex items-center gap-1 text-text-muted text-xs">
															Type
															<GameSelect
																className="max-w-[100px] px-0.5 py-[1px] text-xs"
																onChange={(e) =>
																	handleFieldChange(
																		idx,
																		"damageType",
																		(e.target as HTMLSelectElement).value,
																	)
																}
																value={w.damageType}
															>
																<option value="">—</option>
																{DAMAGE_TYPES.map((t) => (
																	<option key={t} value={t}>
																		{t}
																	</option>
																))}
															</GameSelect>
														</label>
														{!isMelee && (
															<>
																<label className="flex items-center gap-1 text-text-muted text-xs">
																	Range
																	<GameInput
																		className="w-14"
																		onInput={(e) =>
																			handleFieldChange(
																				idx,
																				"range",
																				(e.target as HTMLInputElement).value,
																			)
																		}
																		value={(w as RangedWeapon).range || ""}
																	/>
																</label>
																<label className="flex items-center gap-1 text-text-muted text-xs">
																	RoF
																	<GameInput
																		className="w-10"
																		onInput={(e) =>
																			handleFieldChange(
																				idx,
																				"rof",
																				(e.target as HTMLInputElement).value,
																			)
																		}
																		value={(w as RangedWeapon).rof || ""}
																	/>
																</label>
																<label className="flex items-center gap-1 text-text-muted text-xs">
																	Clip
																	<GameInput
																		className="w-10"
																		onInput={(e) =>
																			handleFieldChange(
																				idx,
																				"clip",
																				(e.target as HTMLInputElement).value,
																			)
																		}
																		value={(w as RangedWeapon).clip || ""}
																	/>
																</label>
																<label className="flex items-center gap-1 text-text-muted text-xs">
																	Reload
																	<GameInput
																		className="w-10"
																		onInput={(e) =>
																			handleFieldChange(
																				idx,
																				"reload",
																				(e.target as HTMLInputElement).value,
																			)
																		}
																		value={(w as RangedWeapon).reload || ""}
																	/>
																</label>
															</>
														)}
													</div>
													<div className="flex gap-sm">
														<label className="flex flex-1 items-center gap-1 text-text-muted text-xs">
															Special
															<GameInput
																className="flex-1"
																onInput={(e) =>
																	handleFieldChange(
																		idx,
																		"special",
																		(e.target as HTMLInputElement).value,
																	)
																}
																value={w.special || w.qualities || ""}
															/>
														</label>
														<label className="flex flex-1 items-center gap-1 text-text-muted text-xs">
															Notes
															<GameInput
																className="flex-1"
																onInput={(e) =>
																	handleFieldChange(
																		idx,
																		"notes",
																		(e.target as HTMLInputElement).value,
																	)
																}
																value={w.notes}
															/>
														</label>
													</div>
												</div>

												{/* ── Modifiers ── */}
												<div className="flex flex-col gap-xs rounded border border-border/50 bg-surface/50 p-sm">
													<span className="font-semibold text-text-muted text-xs uppercase tracking-wide-px">
														Modifiers
													</span>
													<div className="flex flex-wrap gap-sm text-xs">
														<GameCheckbox
															checked={w.proficient}
															label={`Proficient (+${level} dice)`}
															onChange={(e) =>
																handleBoolChange(
																	idx,
																	"proficient",
																	(e.target as HTMLInputElement).checked,
																)
															}
														/>
														<GameCheckbox
															checked={w.hasWeaponFocus}
															label="Weapon Focus (+2k0 atk)"
															onChange={(e) =>
																handleBoolChange(
																	idx,
																	"hasWeaponFocus",
																	(e.target as HTMLInputElement).checked,
																)
															}
														/>
														<GameCheckbox
															checked={w.hasImprovedWeaponFocus}
															label="Imp. Weapon Focus (+0k1 atk)"
															onChange={(e) =>
																handleBoolChange(
																	idx,
																	"hasImprovedWeaponFocus",
																	(e.target as HTMLInputElement).checked,
																)
															}
														/>
														<GameCheckbox
															checked={w.hasSpecialization}
															label="Specialization (+2k0 dmg)"
															onChange={(e) =>
																handleBoolChange(
																	idx,
																	"hasSpecialization",
																	(e.target as HTMLInputElement).checked,
																)
															}
														/>
														<GameCheckbox
															checked={w.hasImprovedWeaponSpec}
															label="Imp. Weapon Spec (+0k1 dmg)"
															onChange={(e) =>
																handleBoolChange(
																	idx,
																	"hasImprovedWeaponSpec",
																	(e.target as HTMLInputElement).checked,
																)
															}
														/>
														{isMelee ? (
															<GameCheckbox
																checked={(w as MeleeWeapon).hasCrushingBlow}
																label="Crushing Blow (+2 flat dmg)"
																onChange={(e) =>
																	handleBoolChange(
																		idx,
																		"hasCrushingBlow",
																		(e.target as HTMLInputElement).checked,
																	)
																}
															/>
														) : (
															<GameCheckbox
																checked={(w as RangedWeapon).hasMightyShot}
																label="Mighty Shot (+2 flat dmg)"
																onChange={(e) =>
																	handleBoolChange(
																		idx,
																		"hasMightyShot",
																		(e.target as HTMLInputElement).checked,
																	)
																}
															/>
														)}
													</div>
												</div>
											</div>
										</td>
									</tr>
								)}
							</WeaponRow>
						);
					})}
				</tbody>
			</table>
			<AddButton label={isMelee ? "Melee Weapon" : "Ranged Weapon"} onClick={handleAdd} />
		</div>
	);
}

/** Fragment wrapper for weapon row + expandable details row */
function WeaponRow({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
