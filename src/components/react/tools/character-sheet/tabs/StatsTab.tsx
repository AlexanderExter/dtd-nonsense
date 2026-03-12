import { useState } from "react";
import { Button } from "@/components/react/ui";
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

	const handleModChange = (field: string, value: number) => {
		updateChar((c) => {
			if (!c.modifiers) c.modifiers = {} as any;
			(c.modifiers as any)[field] = value;
		});
	};

	// Pool calculator
	const charVal = poolChar ? effChars[poolChar] || 0 : 0;
	const skillVal = poolSkill ? char.skills[poolSkill] || 0 : 0;
	const poolDice = charVal + skillVal;
	const poolKeep = charVal;
	const halfKeep = Math.max(1, Math.ceil(poolKeep / 2));
	const poolNotation = poolDice > 0 ? `${poolDice}k${halfKeep}` : "—";

	const handleSavePool = () => {
		const lbl = poolLabel.trim();
		if (!lbl || poolNotation === "—") return;
		const pool: SavedPool = {
			label: lbl,
			notation: poolNotation,
			formula: `${CHAR_NAMES[poolChar] || poolChar} + ${poolSkill}`,
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
			<div className="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 className="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Derived Stats</h3>
				<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-md mb-sm">
					<DerivedStatEntry
						label="Static Defense"
						formulaText={isHalfling ? "10 + Dex×6 − Size×2" : "10 + (Dex+Wis)×3 − Size×2"}
						baseValue={stats.sdBase}
						modValue={stats.sdMod}
						effValue={stats.sd}
						modField="staticDefense"
						onModChange={(v) => handleModChange("staticDefense", v)}
					/>
					<DerivedStatEntry
						label="Hit Points"
						formulaText="(Con + Wil) × 2"
						baseValue={stats.hpBase}
						modValue={stats.hpMod}
						effValue={stats.hp}
						modField="hitPoints"
						onModChange={(v) => handleModChange("hitPoints", v)}
					/>
					<DerivedStatEntry
						label="Mental Defense"
						formulaText="5 + Composure × 5"
						baseValue={stats.mdBase}
						modValue={stats.mdMod}
						effValue={stats.md}
						modField="mentalDefense"
						onModChange={(v) => handleModChange("mentalDefense", v)}
					/>
					<DerivedStatEntry
						label="Resolve"
						formulaText="Willpower + Composure"
						baseValue={stats.resolveBase}
						modValue={stats.resolveMod}
						effValue={stats.resolve}
						modField="resolve"
						onModChange={(v) => handleModChange("resolve", v)}
					/>
					<DerivedStatEntry
						label="Speed"
						formulaText="Strength + Dexterity"
						baseValue={stats.speedBase}
						modValue={stats.speedMod}
						effValue={stats.speed}
						modField="speed"
						onModChange={(v) => handleModChange("speed", v)}
					/>
					<DerivedStatEntry
						label="Resilience"
						formulaText="⌈(Size + Level) / 2⌉ + 1"
						baseValue={stats.resilienceBase}
						modValue={stats.resilienceMod}
						effValue={stats.resilience}
						modField="resilience"
						onModChange={(v) => handleModChange("resilience", v)}
					/>
					<DerivedStatEntry
						label="Initiative"
						formulaText="Dexterity + Composure"
						baseValue={stats.initBase}
						modValue={stats.initMod}
						effValue={stats.init}
						modField="initiative"
						onModChange={(v) => handleModChange("initiative", v)}
					/>
				</div>
				<div className="text-[0.85rem] text-text-muted mt-sm">
					<span>Run Speed: {stats.runSpeed}m</span>
				</div>
			</div>

			{/* ---------- Characteristics ---------- */}
			<div className="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 className="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Characteristics</h3>
				<CharGrid />
			</div>

			{/* ---------- Skills ---------- */}
			<div className="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 className="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Skills</h3>
				<SkillGrid />
			</div>

			{/* ---------- Pool Calculator ---------- */}
			<div className="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 className="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Pool Calculator</h3>
				<div>
					<div className="flex items-center gap-xs flex-wrap">
						<select
							className="flex-1 min-w-[120px] text-[0.85rem]"
							value={poolChar}
							onChange={(e) => {
								setPoolChar((e.target as HTMLSelectElement).value);
							}}
						>
							<option value="">— Characteristic —</option>
							{Object.entries(CHAR_ABBREV).map(([id, abbrev]) => (
								<option key={id} value={id}>
									{CHAR_NAMES[id] || id} ({abbrev}) [{effChars[id] || 0}]
								</option>
							))}
						</select>
						<span className="text-text-muted font-semibold text-[0.9rem]">+</span>
						<select
							className="flex-1 min-w-[120px] text-[0.85rem]"
							value={poolSkill}
							onChange={(e) => {
								setPoolSkill((e.target as HTMLSelectElement).value);
							}}
						>
							<option value="">— Skill —</option>
							{skillOptions.map((sk) => (
								<option key={sk.id} value={sk.id}>
									{sk.name} [{char.skills[sk.id] || 0}]
								</option>
							))}
						</select>
					</div>
					<div className="text-[1.1rem] font-bold text-accent mt-xs px-sm py-xs bg-bg rounded-sm text-center">
						<strong>Pool: {poolNotation}</strong>
						<label className="flex items-center gap-1 text-[0.78rem] whitespace-nowrap cursor-pointer mt-xs justify-center">
							<input
								type="checkbox"
								checked={poolSpec}
								onChange={(e) => {
									setPoolSpec((e.target as HTMLInputElement).checked);
								}}
							/>
							Specialization (reroll 1s)
						</label>
					</div>
					<div className="flex gap-xs items-center mt-sm">
						<input
							type="text"
							className="w-[120px] text-[0.82rem] px-sm py-0.5"
							placeholder="Pool label"
							value={poolLabel}
							onInput={(e) => {
								setPoolLabel((e.target as HTMLInputElement).value);
							}}
						/>
						<Button size="sm" onClick={handleSavePool}>
							Save Pool
						</Button>
					</div>
				</div>
				{(char.savedPools || []).length > 0 && (
					<div className="mt-sm flex flex-col gap-1">
						<h4 className="m-0 mb-sm text-accent text-[0.85rem] uppercase tracking-[0.5px]">Saved Pools</h4>
						<ul className="list-none p-0 m-0">
							{(char.savedPools || []).map((p, idx) => (
								<li
									key={idx}
									className="flex items-center gap-sm py-1 px-sm bg-bg border border-border rounded-sm text-[0.85rem] mb-1"
								>
									<strong className="flex-1 text-text-primary">{p.label}:</strong>{" "}
									<span className="font-bold text-accent">{p.notation || p.pool || p.formula}</span>
									<button
										type="button"
										className="bg-transparent border-none text-error cursor-pointer text-base p-0.5 leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
										onClick={() => handleRemovePool(idx)}
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
