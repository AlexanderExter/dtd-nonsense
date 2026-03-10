import { useCallback } from "preact/hooks";
import type { NPCWeapon } from "./constants";

interface WeaponListProps {
	weapons: NPCWeapon[];
	onChange: (weapons: NPCWeapon[]) => void;
}

function createDefaultWeapon(): NPCWeapon {
	return {
		name: "",
		type: "melee",
		damage: "",
		damageType: "",
		pen: 0,
		special: "",
	};
}

export function WeaponList({ weapons, onChange }: WeaponListProps) {
	const addWeapon = useCallback(() => {
		onChange([...weapons, createDefaultWeapon()]);
	}, [weapons, onChange]);

	const removeWeapon = useCallback(
		(index: number) => {
			onChange(weapons.filter((_, i) => i !== index));
		},
		[weapons, onChange],
	);

	const updateWeapon = useCallback(
		(index: number, patch: Partial<NPCWeapon>) => {
			const updated = weapons.map((w, i) => (i === index ? { ...w, ...patch } : w));
			onChange(updated);
		},
		[weapons, onChange],
	);

	return (
		<div class="input-section">
			<div class="section-header">
				<h2 class="section-title">Weapons</h2>
				<button type="button" class="btn btn-ghost btn-sm" onClick={addWeapon}>
					+ Add
				</button>
			</div>
			<div class="list-entries">
				{weapons.map((w, i) => (
					<div class="list-entry weapon-entry" key={i}>
						{/* Row 1: core fields */}
						<div class="weapon-row">
							<select
								class="weapon-type-sel"
								value={w.type}
								onChange={(e) =>
									updateWeapon(i, {
										type: (e.target as HTMLSelectElement).value as "melee" | "ranged",
									})
								}
							>
								<option value="melee">Melee</option>
								<option value="ranged">Ranged</option>
							</select>
							<input
								type="text"
								class="weapon-name"
								placeholder="Weapon name"
								value={w.name}
								onInput={(e) => updateWeapon(i, { name: (e.target as HTMLInputElement).value })}
							/>
							<input
								type="text"
								class="weapon-damage"
								placeholder="XkY"
								value={w.damage}
								onInput={(e) => updateWeapon(i, { damage: (e.target as HTMLInputElement).value })}
							/>
							<input
								type="text"
								class="weapon-dtype"
								placeholder="E/I/R/X"
								value={w.damageType}
								style={{ width: "55px" }}
								onInput={(e) => updateWeapon(i, { damageType: (e.target as HTMLInputElement).value })}
							/>
							<span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Pen</span>
							<input
								type="number"
								class="weapon-pen"
								min={0}
								value={w.pen}
								onInput={(e) =>
									updateWeapon(i, {
										pen: Number.parseInt((e.target as HTMLInputElement).value, 10) || 0,
									})
								}
							/>
							<button type="button" class="entry-remove" title="Remove" onClick={() => removeWeapon(i)}>
								×
							</button>
						</div>

						{/* Row 2: ranged-only fields */}
						{w.type === "ranged" && (
							<div class="weapon-row weapon-ranged-fields">
								<input
									type="number"
									class="weapon-range"
									placeholder="Range"
									value={w.range ?? ""}
									onInput={(e) =>
										updateWeapon(i, {
											range:
												Number.parseInt((e.target as HTMLInputElement).value, 10) || undefined,
										})
									}
								/>
								<input
									type="text"
									class="weapon-rof"
									placeholder="ROF"
									value={w.rof ?? ""}
									onInput={(e) =>
										updateWeapon(i, { rof: (e.target as HTMLInputElement).value || undefined })
									}
								/>
								<input
									type="text"
									class="weapon-clip"
									placeholder="Clip"
									value={w.clip ?? ""}
									onInput={(e) =>
										updateWeapon(i, { clip: (e.target as HTMLInputElement).value || undefined })
									}
								/>
								<input
									type="text"
									class="weapon-reload"
									placeholder="Reload"
									value={w.reload ?? ""}
									onInput={(e) =>
										updateWeapon(i, { reload: (e.target as HTMLInputElement).value || undefined })
									}
								/>
							</div>
						)}

						{/* Row 3: special */}
						<div class="weapon-row">
							<input
								type="text"
								class="weapon-special"
								placeholder="Special properties"
								value={w.special}
								onInput={(e) => updateWeapon(i, { special: (e.target as HTMLInputElement).value })}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
