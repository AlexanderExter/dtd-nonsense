import type { Signal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import { derived } from "@/lib/dtd/derived";
import { ARMOR_WEIGHTS, DEFENDER_PRESETS, type DefenderPreset, HIT_LOCATIONS } from "./constants";

interface DefenderInputProps {
	defender: Signal<DefenderPreset>;
	locationAP: Signal<Record<string, number>>;
	sdOverride: Signal<number | null>;
	onPresetApply: (key: string) => void;
}

export function DefenderInput({ defender, locationAP, sdOverride, onPresetApply }: DefenderInputProps) {
	const d = defender.value;

	const effectiveDex = Math.min(d.dex, d.maxDex);
	const sd = derived.calculateSD(effectiveDex, d.wis, d.size, d.halfling);
	const hp = derived.calculateHP(d.con, d.wil);
	const resilience = derived.calculateResilience(d.size, d.level);
	const mentalDef = derived.calculateMentalDefense(d.composure);

	const update = useCallback(
		(partial: Partial<DefenderPreset>) => {
			defender.value = { ...defender.value, ...partial };
		},
		[defender],
	);

	const handleNumInput = useCallback(
		(field: keyof DefenderPreset, value: string) => {
			const n = parseInt(value, 10);
			if (!Number.isNaN(n)) update({ [field]: n });
		},
		[update],
	);

	const handleWeightChange = useCallback(
		(weight: string) => {
			const info = ARMOR_WEIGHTS[weight];
			if (info) {
				update({ weight, maxDex: info.maxDex });
			}
		},
		[update],
	);

	const handleSyncAll = useCallback(() => {
		const ap = defender.value.ap;
		const synced: Record<string, number> = {};
		for (const loc of Object.keys(HIT_LOCATIONS)) {
			synced[loc] = ap;
		}
		locationAP.value = synced;
	}, [defender, locationAP]);

	const handleLocationAPChange = useCallback(
		(loc: string, value: string) => {
			const n = parseInt(value, 10);
			if (!Number.isNaN(n)) {
				locationAP.value = { ...locationAP.value, [loc]: n };
			}
		},
		[locationAP],
	);

	const toggleSDOverride = useCallback(() => {
		sdOverride.value = sdOverride.value != null ? null : sd;
	}, [sdOverride, sd]);

	const handleSDOverrideInput = useCallback(
		(value: string) => {
			const n = parseInt(value, 10);
			if (!Number.isNaN(n)) sdOverride.value = n;
		},
		[sdOverride],
	);

	return (
		<fieldset class="panel">
			<legend>Defender</legend>

			{/* Characteristics */}
			<div class="flex flex-wrap items-center gap-sm max-[600px]:flex-col max-[600px]:items-stretch">
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Dex</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={10}
						value={d.dex}
						onInput={(e) => handleNumInput("dex", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Wis</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={10}
						value={d.wis}
						onInput={(e) => handleNumInput("wis", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Size</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={10}
						value={d.size}
						onInput={(e) => handleNumInput("size", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Con</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={10}
						value={d.con}
						onInput={(e) => handleNumInput("con", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Wil</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={10}
						value={d.wil}
						onInput={(e) => handleNumInput("wil", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
						Composure
					</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={10}
						value={d.composure}
						onInput={(e) => handleNumInput("composure", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Level</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={1}
						max={5}
						value={d.level}
						onInput={(e) => handleNumInput("level", (e.target as HTMLInputElement).value)}
					/>
				</label>
			</div>

			{/* Derived stats */}
			<div class="flex flex-wrap gap-md px-0 py-sm text-[0.85rem] text-text-muted">
				<span class="flex items-center gap-xs">
					SD:{" "}
					<strong class="text-accent font-mono text-base">
						{sdOverride.value != null ? sdOverride.value : sd}
					</strong>
				</span>
				<span class="flex items-center gap-xs">
					HP: <strong class="text-accent font-mono text-base">{hp}</strong>
				</span>
				<span class="flex items-center gap-xs">
					Resilience: <strong class="text-accent font-mono text-base">{resilience}</strong>
				</span>
				<span class="flex items-center gap-xs">
					Mental Def: <strong class="text-accent font-mono text-base">{mentalDef}</strong>
				</span>
			</div>

			{/* SD Override */}
			<div class="flex flex-wrap items-center gap-sm max-[600px]:flex-col max-[600px]:items-stretch">
				<label class="inline-flex items-center gap-[2px] text-[0.7rem] text-text-dim m-0 cursor-pointer font-normal">
					<input
						class="w-auto m-0"
						type="checkbox"
						checked={sdOverride.value != null}
						onChange={toggleSDOverride}
					/>
					<span>SD Override</span>
				</label>
				{sdOverride.value != null && (
					<input
						type="number"
						class="w-14! text-center px-sm py-xs text-[0.85rem] disabled:opacity-30"
						min={1}
						max={60}
						value={sdOverride.value}
						onInput={(e) => handleSDOverrideInput((e.target as HTMLInputElement).value)}
					/>
				)}
			</div>

			{/* Halfling toggle */}
			<div class="flex flex-wrap items-center gap-sm max-[600px]:flex-col max-[600px]:items-stretch">
				<label class="inline-flex items-center gap-xs text-[0.85rem] text-text-muted cursor-pointer m-0 font-normal">
					<input
						class="w-auto accent-accent"
						type="checkbox"
						checked={d.halfling}
						onChange={(e) => update({ halfling: (e.target as HTMLInputElement).checked })}
					/>
					<span>Halfling (Dex×6 SD formula)</span>
				</label>
			</div>

			{/* Armor section */}
			<div class="flex flex-col gap-sm">
				<div class="flex flex-wrap items-center gap-sm max-[600px]:flex-col max-[600px]:items-stretch">
					<label class="flex flex-col gap-[2px] m-0">
						<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">AP</span>
						<input
							class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
							type="number"
							min={0}
							max={20}
							value={d.ap}
							onInput={(e) => handleNumInput("ap", (e.target as HTMLInputElement).value)}
						/>
					</label>
					<label class="flex flex-col gap-[2px] m-0">
						<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
							Weight
						</span>
						<select
							class="w-auto min-w-[4.5rem] text-left px-sm py-xs text-[0.9rem] max-[600px]:w-full"
							value={d.weight}
							onChange={(e) => handleWeightChange((e.target as HTMLSelectElement).value)}
						>
							{Object.keys(ARMOR_WEIGHTS).map((w) => (
								<option key={w} value={w}>
									{w.charAt(0).toUpperCase() + w.slice(1)}
								</option>
							))}
						</select>
					</label>
					<label class="flex flex-col gap-[2px] m-0">
						<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
							Max Dex
						</span>
						<input
							class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
							type="number"
							min={0}
							max={99}
							value={d.maxDex}
							onInput={(e) => handleNumInput("maxDex", (e.target as HTMLInputElement).value)}
						/>
					</label>
				</div>

				{/* Per-location AP */}
				<details class="border border-border rounded-sm p-sm bg-bg">
					<summary class="text-[0.8rem] text-text-muted cursor-pointer font-semibold">
						Per-Location AP
					</summary>
					<div class="flex flex-wrap gap-xs mt-sm">
						{Object.entries(HIT_LOCATIONS).map(([loc, info]) => (
							<label key={loc} class="flex flex-col gap-[2px] m-0">
								<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
									{info.label}
								</span>
								<input
									class="w-14 text-center px-sm py-xs text-[0.9rem]"
									type="number"
									min={0}
									max={20}
									value={locationAP.value[loc] ?? d.ap}
									onInput={(e) => handleLocationAPChange(loc, (e.target as HTMLInputElement).value)}
								/>
							</label>
						))}
					</div>
					<button type="button" class="btn btn-ghost btn-sm" onClick={handleSyncAll}>
						Sync All
					</button>
				</details>
			</div>

			{/* Defensive modifiers */}
			<div class="flex flex-wrap items-center gap-sm max-[600px]:flex-col max-[600px]:items-stretch">
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Cover</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={0}
						max={20}
						value={d.cover}
						onInput={(e) => handleNumInput("cover", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">Aura</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={0}
						max={20}
						value={d.aura}
						onInput={(e) => handleNumInput("aura", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
						Dodge (Acrobatics)
					</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={0}
						max={10}
						value={d.dodge}
						onInput={(e) => handleNumInput("dodge", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="flex flex-col gap-[2px] m-0">
					<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0 font-semibold">
						Parry (Weaponry)
					</span>
					<input
						class="w-[4.5rem] text-center px-sm py-xs text-[0.9rem] max-[600px]:w-full"
						type="number"
						min={0}
						max={10}
						value={d.parry}
						onInput={(e) => handleNumInput("parry", (e.target as HTMLInputElement).value)}
					/>
				</label>
			</div>

			{/* Presets */}
			<div class="flex flex-col gap-xs pt-sm border-t border-border">
				<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim m-0">Presets:</span>
				<div class="flex flex-wrap gap-xs">
					{Object.keys(DEFENDER_PRESETS).map((key) => (
						<button key={key} type="button" class="btn btn-ghost btn-sm" onClick={() => onPresetApply(key)}>
							{key.charAt(0).toUpperCase() + key.slice(1)}
						</button>
					))}
				</div>
			</div>
		</fieldset>
	);
}
