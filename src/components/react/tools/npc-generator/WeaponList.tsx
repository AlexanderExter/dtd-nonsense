import { useCallback } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { NumberInput } from "@/components/react/ui/NumberInput";
import type { NPCWeapon } from "./constants";

interface WeaponListProps {
	onChange: (weapons: NPCWeapon[]) => void;
	weapons: NPCWeapon[];
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
		<div className="mb-lg border-border border-b pb-md last:border-b-0">
			<div className="mb-sm flex items-center justify-between">
				<h2 className="m-0 text-accent text-sm uppercase tracking-wide-px">Weapons</h2>
				<Button onClick={addWeapon} size="sm" variant="ghost">
					+ Add
				</Button>
			</div>
			<div className="flex flex-col gap-xs">
				{weapons.map((w, i) => (
					<div
						className="flex flex-col items-stretch gap-xs rounded-sm border border-border bg-surface p-sm"
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
						key={`weapon-${i}`}
					>
						{/* Row 1: core fields */}
						<div className="flex flex-wrap items-center gap-xs">
							<GameSelect
								className="w-[50px] flex-none"
								onChange={(e) =>
									updateWeapon(i, {
										type: (e.target as HTMLSelectElement).value as "melee" | "ranged",
									})
								}
								value={w.type}
							>
								<option value="melee">Melee</option>
								<option value="ranged">Ranged</option>
							</GameSelect>
							<GameInput
								className="min-w-[100px] flex-1"
								onInput={(e) =>
									updateWeapon(i, {
										name: (e.target as HTMLInputElement).value,
									})
								}
								placeholder="Weapon name"
								value={w.name}
							/>
							<GameInput
								className="w-[60px] flex-none"
								onInput={(e) =>
									updateWeapon(i, {
										damage: (e.target as HTMLInputElement).value,
									})
								}
								placeholder="XkY"
								value={w.damage}
							/>
							<GameInput
								className="w-[55px] flex-none"
								onInput={(e) =>
									updateWeapon(i, {
										damageType: (e.target as HTMLInputElement).value,
									})
								}
								placeholder="E/I/R/X"
								value={w.damageType}
							/>
							<span className="text-text-muted text-xs">Pen</span>
							<NumberInput min={0} onChange={(v) => updateWeapon(i, { pen: v })} value={w.pen} />
							<span className="text-text-muted text-xs">+Atk</span>
							<NumberInput
								min={0}
								onChange={(v) => updateWeapon(i, { fixedAttackBonus: v })}
								value={w.fixedAttackBonus || 0}
							/>
							<span className="text-text-muted text-xs">+Dmg</span>
							<NumberInput
								min={0}
								onChange={(v) => updateWeapon(i, { fixedDamageBonus: v })}
								value={w.fixedDamageBonus || 0}
							/>
							<button
								className="cursor-pointer border-none bg-transparent px-[4px] py-[2px] text-base text-text-dim leading-none hover:text-error"
								onClick={() => removeWeapon(i)}
								title="Remove"
								type="button"
							>
								×
							</button>
						</div>

						{/* Row 2: ranged-only fields */}
						{w.type === "ranged" && (
							<div className="flex flex-wrap items-center gap-xs">
								<GameInput
									className="w-[55px] flex-none"
									onInput={(e) =>
										updateWeapon(i, {
											range:
												Number.parseInt((e.target as HTMLInputElement).value, 10) || undefined,
										})
									}
									placeholder="Range"
									type="number"
									value={w.range ?? ""}
								/>
								<GameInput
									className="w-[60px] flex-none"
									onInput={(e) =>
										updateWeapon(i, {
											rof: (e.target as HTMLInputElement).value || undefined,
										})
									}
									placeholder="ROF"
									value={w.rof ?? ""}
								/>
								<GameInput
									className="w-[50px] flex-none"
									onInput={(e) =>
										updateWeapon(i, {
											clip: (e.target as HTMLInputElement).value || undefined,
										})
									}
									placeholder="Clip"
									value={w.clip ?? ""}
								/>
								<GameInput
									className="w-[60px] flex-none"
									onInput={(e) =>
										updateWeapon(i, {
											reload: (e.target as HTMLInputElement).value || undefined,
										})
									}
									placeholder="Reload"
									value={w.reload ?? ""}
								/>
							</div>
						)}

						{/* Row 3: special */}
						<div className="flex flex-wrap items-center gap-xs">
							<GameInput
								className="min-w-[80px] flex-1"
								onInput={(e) =>
									updateWeapon(i, {
										special: (e.target as HTMLInputElement).value,
									})
								}
								placeholder="Special properties"
								value={w.special}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
