import type { MeleeWeapon, RangedWeapon } from "@/lib/dtd/types";
import { charSignal, gameData, updateChar } from "../CharacterSheetApp";
import { DAMAGE_TYPES, PROFICIENCY_MELEE, PROFICIENCY_RANGED } from "../constants";

interface WeaponTableProps {
	type: "melee" | "ranged";
}

function emptyMelee(): MeleeWeapon {
	return { name: "", damage: "", damageType: "", proficiency: "", qualities: "", notes: "", pen: "" };
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
	const char = charSignal.value;
	const data = gameData.value;
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

	return (
		<div class="weapon-table-section">
			<h4>{isMelee ? "Melee Weapons" : "Ranged Weapons"}</h4>
			<datalist id={datalistId}>
				{weaponOptions.map((n) => (
					<option key={n} value={n} />
				))}
			</datalist>
			<table class="weapon-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Class</th>
						{!isMelee && <th>Range</th>}
						<th>Damage</th>
						<th>Pen</th>
						<th>Type</th>
						{!isMelee && <th>RoF</th>}
						{!isMelee && <th>Clip</th>}
						{!isMelee && <th>Reload</th>}
						<th>Special</th>
						<th>Notes</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{weapons.map((w, idx) => (
						<tr key={idx}>
							<td>
								<input
									type="text"
									list={datalistId}
									value={w.name}
									onInput={(e) =>
										handleFieldChange(idx, "name", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td>
								<select
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
								<td>
									<input
										type="text"
										value={(w as RangedWeapon).range || ""}
										onInput={(e) =>
											handleFieldChange(idx, "range", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
							)}
							<td>
								<input
									type="text"
									value={w.damage}
									onInput={(e) =>
										handleFieldChange(idx, "damage", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td>
								<input
									type="text"
									value={w.pen || ""}
									onInput={(e) => handleFieldChange(idx, "pen", (e.target as HTMLInputElement).value)}
								/>
							</td>
							<td>
								<select
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
								<td>
									<input
										type="text"
										value={(w as RangedWeapon).rof || ""}
										onInput={(e) =>
											handleFieldChange(idx, "rof", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
							)}
							{!isMelee && (
								<td>
									<input
										type="text"
										value={(w as RangedWeapon).clip || ""}
										onInput={(e) =>
											handleFieldChange(idx, "clip", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
							)}
							{!isMelee && (
								<td>
									<input
										type="text"
										value={(w as RangedWeapon).reload || ""}
										onInput={(e) =>
											handleFieldChange(idx, "reload", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
							)}
							<td>
								<input
									type="text"
									value={w.special || w.qualities || ""}
									onInput={(e) =>
										handleFieldChange(idx, "special", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td>
								<input
									type="text"
									value={w.notes}
									onInput={(e) =>
										handleFieldChange(idx, "notes", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td>
								<button
									type="button"
									class="btn-remove"
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
			<button type="button" class="btn btn-sm" onClick={handleAdd}>
				+ Add {isMelee ? "Melee" : "Ranged"} Weapon
			</button>
		</div>
	);
}
