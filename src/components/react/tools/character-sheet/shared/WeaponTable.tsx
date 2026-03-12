import { AddButton } from "@/components/react/ui/AddButton";
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
	const inputClass =
		"w-full py-0.5 px-1 text-[0.8rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none";
	const selectClass =
		"w-full text-[0.78rem] py-[1px] px-0.5 max-w-[100px] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none";

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
						<tr key={idx}>
							<td className={tdClass}>
								<input
									type="text"
									className={inputClass}
									list={datalistId}
									value={w.name}
									onInput={(e) =>
										handleFieldChange(idx, "name", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td className={tdClass}>
								<select
									className={selectClass}
									value={w.proficiency}
									onChange={(e) =>
										handleFieldChange(idx, "proficiency", (e.target as HTMLSelectElement).value)
									}
								>
									<option value="">—</option>
									{profList.map((p) => (
										<option key={p} value={p}>
											{p}
										</option>
									))}
								</select>
							</td>
							{!isMelee && (
								<td className={tdClass}>
									<input
										type="text"
										className={inputClass}
										value={(w as RangedWeapon).range || ""}
										onInput={(e) =>
											handleFieldChange(idx, "range", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
							)}
							<td className={tdClass}>
								<input
									type="text"
									className={inputClass}
									value={w.damage}
									onInput={(e) =>
										handleFieldChange(idx, "damage", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td className={tdClass}>
								<input
									type="text"
									className={inputClass}
									value={w.pen || ""}
									onInput={(e) => handleFieldChange(idx, "pen", (e.target as HTMLInputElement).value)}
								/>
							</td>
							<td className={tdClass}>
								<select
									className={selectClass}
									value={w.damageType}
									onChange={(e) =>
										handleFieldChange(idx, "damageType", (e.target as HTMLSelectElement).value)
									}
								>
									<option value="">—</option>
									{DAMAGE_TYPES.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</td>
							{!isMelee && (
								<td className={tdClass}>
									<input
										type="text"
										className={inputClass}
										value={(w as RangedWeapon).rof || ""}
										onInput={(e) =>
											handleFieldChange(idx, "rof", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
							)}
							{!isMelee && (
								<td className={tdClass}>
									<input
										type="text"
										className={inputClass}
										value={(w as RangedWeapon).clip || ""}
										onInput={(e) =>
											handleFieldChange(idx, "clip", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
							)}
							{!isMelee && (
								<td className={tdClass}>
									<input
										type="text"
										className={inputClass}
										value={(w as RangedWeapon).reload || ""}
										onInput={(e) =>
											handleFieldChange(idx, "reload", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
							)}
							<td className={tdClass}>
								<input
									type="text"
									className={inputClass}
									value={w.special || w.qualities || ""}
									onInput={(e) =>
										handleFieldChange(idx, "special", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td className={tdClass}>
								<input
									type="text"
									className={inputClass}
									value={w.notes}
									onInput={(e) =>
										handleFieldChange(idx, "notes", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td className={`${tdClass} text-center w-9`}>
								<button
									type="button"
									className="bg-transparent border-none text-error cursor-pointer text-base p-0.5 leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
									onClick={() => handleRemove(idx)}
									title="Remove"
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
