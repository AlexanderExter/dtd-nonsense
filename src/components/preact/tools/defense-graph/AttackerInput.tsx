import type { Signal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import { ATTACKER_PRESETS, type AttackerConfig } from "./constants";

interface AttackerInputProps {
	attacker: Signal<AttackerConfig>;
	onPresetApply: (key: string) => void;
}

export function AttackerInput({ attacker, onPresetApply }: AttackerInputProps) {
	const a = attacker.value;

	const update = useCallback(
		(partial: Partial<AttackerConfig>) => {
			attacker.value = { ...attacker.value, ...partial };
		},
		[attacker],
	);

	const handleNumInput = useCallback(
		(field: keyof AttackerConfig, value: string) => {
			const n = parseInt(value, 10);
			if (!Number.isNaN(n)) update({ [field]: n });
		},
		[update],
	);

	const handleCheckbox = useCallback(
		(field: keyof AttackerConfig, checked: boolean) => {
			update({ [field]: checked });
		},
		[update],
	);

	return (
		<fieldset class="panel">
			<legend>Attacker</legend>

			{/* Attack pool */}
			<div class="flex flex-wrap items-center gap-sm max-[600px]:flex-col max-[600px]:items-stretch">
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
						Attack Rolled
					</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={15}
						value={a.atkRolled}
						onInput={(e) => handleNumInput("atkRolled", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<span class="text-[1.1rem] font-bold text-accent self-end pb-xs max-[600px]:self-center">k</span>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Kept</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={10}
						value={a.atkKept}
						onInput={(e) => handleNumInput("atkKept", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Level</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={0}
						max={5}
						value={a.atkLevel}
						onInput={(e) => handleNumInput("atkLevel", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
						Modifier
					</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={-20}
						max={20}
						value={a.atkMod}
						onInput={(e) => handleNumInput("atkMod", (e.target as HTMLInputElement).value)}
					/>
				</label>
			</div>

			{/* Damage pool */}
			<div class="flex flex-wrap items-center gap-sm max-[600px]:flex-col max-[600px]:items-stretch">
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
						Dmg Rolled
					</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={15}
						value={a.dmgRolled}
						onInput={(e) => handleNumInput("dmgRolled", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<span class="text-[1.1rem] font-bold text-accent self-end pb-xs max-[600px]:self-center">k</span>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Kept</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={10}
						value={a.dmgKept}
						onInput={(e) => handleNumInput("dmgKept", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">+ Flat</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={0}
						max={20}
						value={a.dmgFlat}
						onInput={(e) => handleNumInput("dmgFlat", (e.target as HTMLInputElement).value)}
					/>
				</label>
			</div>

			{/* Type and Penetration */}
			<div class="flex flex-wrap items-center gap-sm max-[600px]:flex-col max-[600px]:items-stretch">
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Type</span>
					<select
						class="w-auto min-w-[4.5rem] text-left px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						value={a.dmgType}
						onChange={(e) => update({ dmgType: (e.target as HTMLSelectElement).value })}
					>
						<option value="E">E (Energy)</option>
						<option value="I">I (Impact)</option>
						<option value="R">R (Rending)</option>
						<option value="X">X (Explosive)</option>
					</select>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
						Penetration
					</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={0}
						max={20}
						value={a.pen}
						onInput={(e) => handleNumInput("pen", (e.target as HTMLInputElement).value)}
					/>
				</label>
			</div>

			{/* Special properties */}
			<div class="flex flex-wrap items-center gap-sm max-[600px]:flex-col max-[600px]:items-stretch">
				<label class="inline-flex items-center gap-xs text-[0.85rem] text-text-muted cursor-pointer m-0 font-normal">
					<input
						class="w-auto accent-accent"
						type="checkbox"
						checked={a.tearing}
						onChange={(e) => handleCheckbox("tearing", (e.target as HTMLInputElement).checked)}
					/>
					<span>Tearing</span>
				</label>
				<label class="inline-flex items-center gap-xs text-[0.85rem] text-text-muted cursor-pointer m-0 font-normal">
					<input
						class="w-auto accent-accent"
						type="checkbox"
						checked={a.blast}
						onChange={(e) => handleCheckbox("blast", (e.target as HTMLInputElement).checked)}
					/>
					<span>Blast</span>
				</label>
				<label class="inline-flex items-center gap-xs text-[0.85rem] text-text-muted cursor-pointer m-0 font-normal">
					<input
						class="w-auto accent-accent"
						type="checkbox"
						checked={a.scatter}
						onChange={(e) => handleCheckbox("scatter", (e.target as HTMLInputElement).checked)}
					/>
					<span>Scatter</span>
				</label>
				<label class="inline-flex items-center gap-xs text-[0.85rem] text-text-muted cursor-pointer m-0 font-normal">
					<input
						class="w-auto accent-accent"
						type="checkbox"
						checked={a.powerField}
						onChange={(e) => handleCheckbox("powerField", (e.target as HTMLInputElement).checked)}
					/>
					<span>Power Field</span>
				</label>
			</div>

			{/* Presets */}
			<div class="flex flex-col gap-xs pt-sm border-t border-border">
				<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0">Presets:</span>
				<div class="flex flex-wrap gap-xs">
					{Object.keys(ATTACKER_PRESETS).map((key) => (
						<button key={key} type="button" class="btn btn-ghost btn-sm" onClick={() => onPresetApply(key)}>
							{key.charAt(0).toUpperCase() + key.slice(1)}
						</button>
					))}
				</div>
			</div>
		</fieldset>
	);
}
