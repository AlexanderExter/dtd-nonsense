import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { NumberInput } from "@/components/react/ui/NumberInput";
import { CHAR_NAMES } from "@/lib/dtd/constants";
import type { SavedPool } from "@/lib/dtd/types";
import type { DerivedStats } from "../constants";
import { CHAR_ABBREV, getEffChars } from "../constants";
import { CharGrid } from "../shared/CharGrid";
import { DerivedStatEntry } from "../shared/DerivedStatEntry";
import { SkillGrid } from "../shared/SkillGrid";
import { useCharSheetStore } from "../store";

export function StatsTab({ derivedStats }: { derivedStats: DerivedStats }) {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);
	const stats = derivedStats;
	const effChars = getEffChars(char, data?.races);
	const isHalfling = char.race === "halfling";

	// Pool calculator local state
	const [poolChar, setPoolChar] = useState("");
	const [poolSkill, setPoolSkill] = useState("");
	const [poolSpec, setPoolSpec] = useState(false);
	const [poolLabel, setPoolLabel] = useState("");
	const [extraRolled, setExtraRolled] = useState(0);
	const [extraKept, setExtraKept] = useState(0);
	const [extraFlat, setExtraFlat] = useState(0);

	const handleModChange = (field: string, value: number) => {
		updateChar((c) => {
			if (!c.modifiers) c.modifiers = {} as any;
			(c.modifiers as any)[field] = value;
		});
	};

	// Pool calculator
	const charVal = poolChar ? effChars[poolChar] || 0 : 0;
	const skillVal = poolSkill ? char.skills[poolSkill] || 0 : 0;
	const poolDice = charVal + skillVal + extraRolled;
	const poolKeep = Math.max(1, Math.ceil(charVal / 2)) + extraKept;
	const poolFlat = extraFlat;
	const poolNotation =
		poolDice > 0
			? `${poolDice}k${poolKeep}${poolFlat > 0 ? ` +${poolFlat}` : poolFlat < 0 ? ` ${poolFlat}` : ""}`
			: "—";

	const handleSavePool = () => {
		const lbl = poolLabel.trim();
		if (!lbl || poolNotation === "—") return;
		const parts: string[] = [];
		if (poolChar) parts.push(CHAR_NAMES[poolChar] || poolChar);
		if (poolSkill) parts.push(poolSkill);
		if (extraRolled) parts.push(`+${extraRolled}k0`);
		if (extraKept) parts.push(`+0k${extraKept}`);
		if (extraFlat) parts.push(extraFlat > 0 ? `+${extraFlat} flat` : `${extraFlat} flat`);
		const pool: SavedPool = {
			label: lbl,
			notation: poolNotation,
			formula: parts.join(" + "),
			extraRolled: extraRolled || undefined,
			extraKept: extraKept || undefined,
			extraFlat: extraFlat || undefined,
			specialization: poolSpec || undefined,
		};
		updateChar((c) => {
			if (!c.savedPools) c.savedPools = [];
			c.savedPools.push(pool);
		});
		setPoolLabel("");
	};

	const handleRemovePool = (idx: number) => {
		updateChar((c) => {
			c.savedPools = (c.savedPools || []).filter((_, i) => i !== idx);
		});
	};

	// Skill list for pool dropdown
	const skillOptions: Array<{ id: string; name: string }> = [];
	if (data?.skills) {
		const groups = data.skills.skills || {};
		for (const cat of Object.values(groups) as Array<Array<{ id: string; name: string }>>) {
			for (const sk of cat) {
				skillOptions.push(sk);
			}
		}
	}

	return (
		<section className="tab-panel">
			{/* ---------- Derived Stats ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Derived Stats</h3>
				<div className="mb-sm grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-md">
					<DerivedStatEntry
						baseValue={stats.sdBase}
						effValue={stats.sd}
						formulaText={isHalfling ? "10 + Dex×6 − Size×2" : "10 + (Dex+Wis)×3 − Size×2"}
						label="Static Defense"
						modField="staticDefense"
						modValue={stats.sdMod}
						onModChange={(v) => handleModChange("staticDefense", v)}
					/>
					<DerivedStatEntry
						baseValue={stats.hpBase}
						effValue={stats.hp}
						formulaText="(Con + Wil) × 2"
						label="Hit Points"
						modField="hitPoints"
						modValue={stats.hpMod}
						onModChange={(v) => handleModChange("hitPoints", v)}
					/>
					<DerivedStatEntry
						baseValue={stats.mdBase}
						effValue={stats.md}
						formulaText="5 + Composure × 5"
						label="Mental Defense"
						modField="mentalDefense"
						modValue={stats.mdMod}
						onModChange={(v) => handleModChange("mentalDefense", v)}
					/>
					<DerivedStatEntry
						baseValue={stats.resolveBase}
						effValue={stats.resolve}
						formulaText="Willpower + Composure"
						label="Resolve"
						modField="resolve"
						modValue={stats.resolveMod}
						onModChange={(v) => handleModChange("resolve", v)}
					/>
					<DerivedStatEntry
						baseValue={stats.speedBase}
						effValue={stats.speed}
						formulaText="Strength + Dexterity"
						label="Speed"
						modField="speed"
						modValue={stats.speedMod}
						onModChange={(v) => handleModChange("speed", v)}
					>
						<span className="mt-0.5 text-[0.78rem] text-text-muted">Run: {stats.runSpeed}m</span>
					</DerivedStatEntry>
					<DerivedStatEntry
						baseValue={stats.resilienceBase}
						effValue={stats.resilience}
						formulaText="⌈(Size + Level) / 2⌉ + 1"
						label="Resilience"
						modField="resilience"
						modValue={stats.resilienceMod}
						onModChange={(v) => handleModChange("resilience", v)}
					/>
					<DerivedStatEntry
						baseValue={stats.initBase}
						effValue={stats.init}
						formulaText="Dexterity + Composure"
						label="Initiative"
						modField="initiative"
						modValue={stats.initMod}
						onModChange={(v) => handleModChange("initiative", v)}
					/>
				</div>
			</div>

			{/* ---------- Characteristics ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Characteristics</h3>
				<CharGrid />
			</div>

			{/* ---------- Skills ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Skills</h3>
				<SkillGrid />
			</div>

			{/* ---------- Pool Calculator ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Pool Calculator</h3>
				<div>
					<div className="flex flex-wrap items-center gap-xs">
						<GameSelect
							className="min-w-[120px] flex-1"
							onChange={(e) => {
								setPoolChar((e.target as HTMLSelectElement).value);
							}}
							value={poolChar}
						>
							<option value="">— Characteristic —</option>
							{Object.entries(CHAR_ABBREV).map(([id, abbrev]) => (
								<option key={id} value={id}>
									{CHAR_NAMES[id] || id} ({abbrev}) [{effChars[id] || 0}]
								</option>
							))}
						</GameSelect>
						<span className="font-semibold text-[0.9rem] text-text-muted">+</span>
						<GameSelect
							className="min-w-[120px] flex-1"
							onChange={(e) => {
								setPoolSkill((e.target as HTMLSelectElement).value);
							}}
							value={poolSkill}
						>
							<option value="">— Skill —</option>
							{skillOptions.map((sk) => (
								<option key={sk.id} value={sk.id}>
									{sk.name} [{char.skills[sk.id] || 0}]
								</option>
							))}
						</GameSelect>
						<span className="font-semibold text-[0.9rem] text-text-muted">+</span>
						{/* biome-ignore lint/a11y/noLabelWithoutControl: NumberInput renders <input> */}
						<label className="flex items-center gap-1 text-[0.78rem] text-text-muted">
							<NumberInput min={0} onChange={setExtraRolled} value={extraRolled} />
							<span>+Xk0</span>
						</label>
						{/* biome-ignore lint/a11y/noLabelWithoutControl: NumberInput renders <input> */}
						<label className="flex items-center gap-1 text-[0.78rem] text-text-muted">
							<NumberInput min={0} onChange={setExtraKept} value={extraKept} />
							<span>+0kX</span>
						</label>
						{/* biome-ignore lint/a11y/noLabelWithoutControl: NumberInput renders <input> */}
						<label className="flex items-center gap-1 text-[0.78rem] text-text-muted">
							<NumberInput onChange={setExtraFlat} value={extraFlat} />
							<span>Flat</span>
						</label>
					</div>
					<div className="mt-xs rounded-sm bg-bg px-sm py-xs text-center font-bold text-[1.1rem] text-accent">
						<strong>Pool: {poolNotation}</strong>
						<label className="mt-xs flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap text-[0.78rem]">
							<GameCheckbox
								checked={poolSpec}
								onChange={(e) => {
									setPoolSpec((e.target as HTMLInputElement).checked);
								}}
							/>
							Specialization (reroll 1s)
						</label>
					</div>
					<div className="mt-sm flex items-center gap-xs">
						<GameInput
							className="w-[120px]"
							onInput={(e) => {
								setPoolLabel((e.target as HTMLInputElement).value);
							}}
							placeholder="Pool label"
							type="text"
							value={poolLabel}
						/>
						<Button onClick={handleSavePool} size="sm">
							Save Pool
						</Button>
					</div>
				</div>
				{(char.savedPools || []).length > 0 && (
					<div className="mt-sm flex flex-col gap-1">
						<h4 className="m-0 mb-sm text-[0.85rem] text-accent uppercase tracking-[0.5px]">Saved Pools</h4>
						<ul className="m-0 list-none p-0">
							{(char.savedPools || []).map((p, idx) => (
								<li
									className="mb-1 flex items-center gap-sm rounded-sm border border-border bg-bg px-sm py-1 text-[0.85rem]"
									// biome-ignore lint/suspicious/noArrayIndexKey: editable pool list identified by position
									key={`pool-${p.label}-${idx}`}
								>
									<strong className="flex-1 text-text-primary">{p.label}:</strong>{" "}
									<span className="font-bold text-accent">{p.notation || p.pool || p.formula}</span>
									{p.formula && (
										<span
											className="rounded-sm bg-bg px-1 py-0.5 text-[0.72rem] text-text-muted"
											title={p.formula}
										>
											({p.formula})
										</span>
									)}
									{p.specialization && (
										<span
											className="rounded-sm bg-info/15 px-1 py-0.5 text-[0.72rem] text-info"
											title="Specialization: reroll 1s"
										>
											Spec
										</span>
									)}
									<button
										className="cursor-pointer border-none bg-transparent p-0.5 text-base text-error leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
										onClick={() => handleRemovePool(idx)}
										type="button"
									>
										×
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</section>
	);
}
