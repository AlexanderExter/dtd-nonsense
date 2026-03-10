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
			<div class="field-row">
				<label class="compact-field">
					<span class="field-label">Dex</span>
					<input
						type="number"
						min={1}
						max={10}
						value={d.dex}
						onInput={(e) => handleNumInput("dex", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="compact-field">
					<span class="field-label">Wis</span>
					<input
						type="number"
						min={1}
						max={10}
						value={d.wis}
						onInput={(e) => handleNumInput("wis", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="compact-field">
					<span class="field-label">Size</span>
					<input
						type="number"
						min={1}
						max={10}
						value={d.size}
						onInput={(e) => handleNumInput("size", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="compact-field">
					<span class="field-label">Con</span>
					<input
						type="number"
						min={1}
						max={10}
						value={d.con}
						onInput={(e) => handleNumInput("con", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="compact-field">
					<span class="field-label">Wil</span>
					<input
						type="number"
						min={1}
						max={10}
						value={d.wil}
						onInput={(e) => handleNumInput("wil", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="compact-field">
					<span class="field-label">Composure</span>
					<input
						type="number"
						min={1}
						max={10}
						value={d.composure}
						onInput={(e) => handleNumInput("composure", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="compact-field">
					<span class="field-label">Level</span>
					<input
						type="number"
						min={1}
						max={5}
						value={d.level}
						onInput={(e) => handleNumInput("level", (e.target as HTMLInputElement).value)}
					/>
				</label>
			</div>

			{/* Derived stats */}
			<div class="derived-row">
				<span class="derived-stat">
					SD: <strong>{sdOverride.value != null ? sdOverride.value : sd}</strong>
				</span>
				<span class="derived-stat">
					HP: <strong>{hp}</strong>
				</span>
				<span class="derived-stat">
					Resilience: <strong>{resilience}</strong>
				</span>
				<span class="derived-stat">
					Mental Def: <strong>{mentalDef}</strong>
				</span>
			</div>

			{/* SD Override */}
			<div class="field-row">
				<label class="override-toggle">
					<input type="checkbox" checked={sdOverride.value != null} onChange={toggleSDOverride} />
					<span>SD Override</span>
				</label>
				{sdOverride.value != null && (
					<input
						type="number"
						class="override-input"
						min={1}
						max={60}
						value={sdOverride.value}
						onInput={(e) => handleSDOverrideInput((e.target as HTMLInputElement).value)}
					/>
				)}
			</div>

			{/* Halfling toggle */}
			<div class="field-row">
				<label class="toggle-field">
					<input
						type="checkbox"
						checked={d.halfling}
						onChange={(e) => update({ halfling: (e.target as HTMLInputElement).checked })}
					/>
					<span>Halfling (Dex×6 SD formula)</span>
				</label>
			</div>

			{/* Armor section */}
			<div class="sub-section">
				<div class="field-row">
					<label class="compact-field">
						<span class="field-label">AP</span>
						<input
							type="number"
							min={0}
							max={20}
							value={d.ap}
							onInput={(e) => handleNumInput("ap", (e.target as HTMLInputElement).value)}
						/>
					</label>
					<label class="compact-field">
						<span class="field-label">Weight</span>
						<select
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
					<label class="compact-field">
						<span class="field-label">Max Dex</span>
						<input
							type="number"
							min={0}
							max={99}
							value={d.maxDex}
							onInput={(e) => handleNumInput("maxDex", (e.target as HTMLInputElement).value)}
						/>
					</label>
				</div>

				{/* Per-location AP */}
				<details class="location-details">
					<summary>Per-Location AP</summary>
					<div class="location-grid">
						{Object.entries(HIT_LOCATIONS).map(([loc, info]) => (
							<label key={loc} class="compact-field">
								<span class="field-label">{info.label}</span>
								<input
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
			<div class="field-row">
				<label class="compact-field">
					<span class="field-label">Cover</span>
					<input
						type="number"
						min={0}
						max={20}
						value={d.cover}
						onInput={(e) => handleNumInput("cover", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="compact-field">
					<span class="field-label">Aura</span>
					<input
						type="number"
						min={0}
						max={20}
						value={d.aura}
						onInput={(e) => handleNumInput("aura", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="compact-field">
					<span class="field-label">Dodge (Acrobatics)</span>
					<input
						type="number"
						min={0}
						max={10}
						value={d.dodge}
						onInput={(e) => handleNumInput("dodge", (e.target as HTMLInputElement).value)}
					/>
				</label>
				<label class="compact-field">
					<span class="field-label">Parry (Weaponry)</span>
					<input
						type="number"
						min={0}
						max={10}
						value={d.parry}
						onInput={(e) => handleNumInput("parry", (e.target as HTMLInputElement).value)}
					/>
				</label>
			</div>

			{/* Presets */}
			<div class="preset-row">
				<span class="field-label">Presets:</span>
				<div class="preset-buttons">
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
