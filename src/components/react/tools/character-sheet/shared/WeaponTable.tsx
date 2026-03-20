import { AddButton } from "@/components/react/ui/AddButton";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { SectionHeading } from "@/components/react/ui/SectionHeading";
import type { MeleeWeapon, RangedWeapon } from "@/lib/dtd/types";
import { DAMAGE_TYPES, PROFICIENCY_MELEE, PROFICIENCY_RANGED } from "../constants";
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

export function WeaponTable({ type }: WeaponTableProps) {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);
	const isMelee = type === "melee";
	const weapons = isMelee ? char.meleeWeapons || [] : char.rangedWeapons || [];
	const profList = isMelee ? PROFICIENCY_MELEE : PROFICIENCY_RANGED;

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

	const thClass =
		"text-[0.72rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap";
	const tdClass = "py-[3px] px-sm border-b border-border align-middle";
	return (
		<div>
			<SectionHeading>{isMelee ? "Melee Weapons" : "Ranged Weapons"}</SectionHeading>
			<datalist id={datalistId}>
				{weaponOptions.map((n) => (
					<option key={n} value={n} />
				))}
			</datalist>
			<table className="w-full border-collapse text-[0.8rem]">
				<thead>
					<tr>
						<th className={thClass}>Name</th>
						<th className={thClass}>Class</th>
						{!isMelee && <th className={thClass}>Range</th>}
						<th className={thClass}>Damage</th>
						<th className={thClass}>Pen</th>
						<th className={thClass}>Type</th>
						{!isMelee && <th className={thClass}>RoF</th>}
						{!isMelee && <th className={thClass}>Clip</th>}
						{!isMelee && <th className={thClass}>Reload</th>}
						<th className={thClass}>Special</th>
						<th className={thClass}>Notes</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{weapons.map((w, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list items identified by position
						<tr key={`weapon-${idx}`}>
							<td className={tdClass}>
								<GameInput
									list={datalistId}
									onInput={(e) =>
										handleFieldChange(idx, "name", (e.target as HTMLInputElement).value)
									}
									value={w.name}
								/>
							</td>
							<td className={tdClass}>
								<GameSelect
									className="max-w-[100px] px-0.5 py-[1px] text-[0.78rem]"
									onChange={(e) =>
										handleFieldChange(idx, "proficiency", (e.target as HTMLSelectElement).value)
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
							</td>
							{!isMelee && (
								<td className={tdClass}>
									<GameInput
										onInput={(e) =>
											handleFieldChange(idx, "range", (e.target as HTMLInputElement).value)
										}
										value={(w as RangedWeapon).range || ""}
									/>
								</td>
							)}
							<td className={tdClass}>
								<GameInput
									onInput={(e) =>
										handleFieldChange(idx, "damage", (e.target as HTMLInputElement).value)
									}
									value={w.damage}
								/>
							</td>
							<td className={tdClass}>
								<GameInput
									onInput={(e) => handleFieldChange(idx, "pen", (e.target as HTMLInputElement).value)}
									value={w.pen || ""}
								/>
							</td>
							<td className={tdClass}>
								<GameSelect
									className="max-w-[100px] px-0.5 py-[1px] text-[0.78rem]"
									onChange={(e) =>
										handleFieldChange(idx, "damageType", (e.target as HTMLSelectElement).value)
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
							</td>
							{!isMelee && (
								<td className={tdClass}>
									<GameInput
										onInput={(e) =>
											handleFieldChange(idx, "rof", (e.target as HTMLInputElement).value)
										}
										value={(w as RangedWeapon).rof || ""}
									/>
								</td>
							)}
							{!isMelee && (
								<td className={tdClass}>
									<GameInput
										onInput={(e) =>
											handleFieldChange(idx, "clip", (e.target as HTMLInputElement).value)
										}
										value={(w as RangedWeapon).clip || ""}
									/>
								</td>
							)}
							{!isMelee && (
								<td className={tdClass}>
									<GameInput
										onInput={(e) =>
											handleFieldChange(idx, "reload", (e.target as HTMLInputElement).value)
										}
										value={(w as RangedWeapon).reload || ""}
									/>
								</td>
							)}
							<td className={tdClass}>
								<GameInput
									onInput={(e) =>
										handleFieldChange(idx, "special", (e.target as HTMLInputElement).value)
									}
									value={w.special || w.qualities || ""}
								/>
							</td>
							<td className={tdClass}>
								<GameInput
									onInput={(e) =>
										handleFieldChange(idx, "notes", (e.target as HTMLInputElement).value)
									}
									value={w.notes}
								/>
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
					))}
				</tbody>
			</table>
			<AddButton label={isMelee ? "Melee Weapon" : "Ranged Weapon"} onClick={handleAdd} />
		</div>
	);
}
