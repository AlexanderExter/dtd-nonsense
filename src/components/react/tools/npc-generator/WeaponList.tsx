import { useCallback } from "react";
import { Button } from "@/components/react/ui/Button";
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
		<div className="mb-lg pb-md border-b border-border last:border-b-0">
			<div className="flex items-center justify-between mb-sm">
				<h2 className="text-[0.9rem] uppercase tracking-[0.5px] text-accent m-0">Weapons</h2>
				<Button variant="ghost" size="sm" onClick={addWeapon}>
					+ Add
				</Button>
			</div>
			<div className="flex flex-col gap-xs">
				{weapons.map((w, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
						key={`weapon-${i}`}
						className="flex flex-col items-stretch gap-xs p-sm bg-surface border border-border rounded-sm"
					>
						{/* Row 1: core fields */}
						<div className="flex items-center gap-xs flex-wrap">
							<select
								className="w-[50px] flex-none py-[2px] px-xs text-[0.85rem]"
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
								className="flex-1 min-w-[100px] py-[2px] px-xs text-[0.85rem]"
								placeholder="Weapon name"
								value={w.name}
								onInput={(e) =>
									updateWeapon(i, {
										name: (e.target as HTMLInputElement).value,
									})
								}
							/>
							<input
								type="text"
								className="w-[60px] flex-none py-[2px] px-xs text-[0.85rem]"
								placeholder="XkY"
								value={w.damage}
								onInput={(e) =>
									updateWeapon(i, {
										damage: (e.target as HTMLInputElement).value,
									})
								}
							/>
							<input
								type="text"
								className="w-[55px] flex-none py-[2px] px-xs text-[0.85rem]"
								placeholder="E/I/R/X"
								value={w.damageType}
								onInput={(e) =>
									updateWeapon(i, {
										damageType: (e.target as HTMLInputElement).value,
									})
								}
							/>
							<span className="text-[0.8rem] text-text-muted">Pen</span>
							<input
								type="number"
								className="w-[50px] flex-none py-[2px] px-xs text-[0.85rem]"
								min={0}
								value={w.pen}
								onInput={(e) =>
									updateWeapon(i, {
										pen: Number.parseInt((e.target as HTMLInputElement).value, 10) || 0,
									})
								}
							/>
							<button
								type="button"
								className="bg-transparent border-none text-text-dim cursor-pointer px-[4px] py-[2px] text-base leading-none hover:text-error"
								title="Remove"
								onClick={() => removeWeapon(i)}
							>
								×
							</button>
						</div>

						{/* Row 2: ranged-only fields */}
						{w.type === "ranged" && (
							<div className="flex items-center gap-xs flex-wrap">
								<input
									type="number"
									className="w-[55px] flex-none py-[2px] px-xs text-[0.85rem]"
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
									className="w-[60px] flex-none py-[2px] px-xs text-[0.85rem]"
									placeholder="ROF"
									value={w.rof ?? ""}
									onInput={(e) =>
										updateWeapon(i, {
											rof: (e.target as HTMLInputElement).value || undefined,
										})
									}
								/>
								<input
									type="text"
									className="w-[50px] flex-none py-[2px] px-xs text-[0.85rem]"
									placeholder="Clip"
									value={w.clip ?? ""}
									onInput={(e) =>
										updateWeapon(i, {
											clip: (e.target as HTMLInputElement).value || undefined,
										})
									}
								/>
								<input
									type="text"
									className="w-[60px] flex-none py-[2px] px-xs text-[0.85rem]"
									placeholder="Reload"
									value={w.reload ?? ""}
									onInput={(e) =>
										updateWeapon(i, {
											reload: (e.target as HTMLInputElement).value || undefined,
										})
									}
								/>
							</div>
						)}

						{/* Row 3: special */}
						<div className="flex items-center gap-xs flex-wrap">
							<input
								type="text"
								className="flex-1 min-w-[80px] py-[2px] px-xs text-[0.85rem]"
								placeholder="Special properties"
								value={w.special}
								onInput={(e) =>
									updateWeapon(i, {
										special: (e.target as HTMLInputElement).value,
									})
								}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
