import { signal } from "@preact/signals";
import { CHAR_NAMES } from "@/lib/dtd/constants";
import type { SavedPool } from "@/lib/dtd/types";
import { charSignal, derivedStats, gameData, updateChar } from "../CharacterSheetApp";
import { CHAR_ABBREV, getEffChars } from "../constants";
import { CharGrid } from "../shared/CharGrid";
import { DerivedStatEntry } from "../shared/DerivedStatEntry";
import { SkillGrid } from "../shared/SkillGrid";

// Pool calculator local signals
const poolChar = signal("");
const poolSkill = signal("");
const poolSpec = signal(false);
const poolLabel = signal("");

export function StatsTab() {
	const char = charSignal.value;
	const stats = derivedStats.value;
	const data = gameData.value;
	const effChars = getEffChars(char, data?.races);
	const isHalfling = char.race === "halfling";

	const handleModChange = (field: string, value: number) => {
		updateChar((c) => {
			if (!c.modifiers) c.modifiers = {} as any;
			(c.modifiers as any)[field] = value;
		});
	};

	// Pool calculator
	const charVal = poolChar.value ? effChars[poolChar.value] || 0 : 0;
	const skillVal = poolSkill.value ? char.skills[poolSkill.value] || 0 : 0;
	const poolDice = charVal + skillVal;
	const poolKeep = charVal;
	const halfKeep = Math.max(1, Math.ceil(poolKeep / 2));
	const poolNotation = poolDice > 0 ? `${poolDice}k${halfKeep}` : "—";

	const handleSavePool = () => {
		const lbl = poolLabel.value.trim();
		if (!lbl || poolNotation === "—") return;
		const pool: SavedPool = {
			label: lbl,
			notation: poolNotation,
			formula: `${CHAR_NAMES[poolChar.value] || poolChar.value} + ${poolSkill.value}`,
		};
		updateChar((c) => {
			if (!c.savedPools) c.savedPools = [];
			c.savedPools.push(pool);
		});
		poolLabel.value = "";
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
		<section class="tab-panel panel-stats">
			{/* ---------- Derived Stats ---------- */}
			<div class="card">
				<h3>Derived Stats</h3>
				<div class="derived-grid">
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
				<div class="derived-extra">
					<span>Run Speed: {stats.runSpeed}m</span>
				</div>
			</div>

			{/* ---------- Characteristics ---------- */}
			<div class="card">
				<h3>Characteristics</h3>
				<CharGrid />
			</div>

			{/* ---------- Skills ---------- */}
			<div class="card">
				<h3>Skills</h3>
				<SkillGrid />
			</div>

			{/* ---------- Pool Calculator ---------- */}
			<div class="card">
				<h3>Pool Calculator</h3>
				<div class="pool-calc">
					<div class="pool-selectors">
						<select
							value={poolChar.value}
							onChange={(e) => {
								poolChar.value = (e.target as HTMLSelectElement).value;
							}}
						>
							<option value="">— Characteristic —</option>
							{Object.entries(CHAR_ABBREV).map(([id, abbrev]) => (
								<option key={id} value={id}>
									{CHAR_NAMES[id] || id} ({abbrev}) [{effChars[id] || 0}]
								</option>
							))}
						</select>
						<span>+</span>
						<select
							value={poolSkill.value}
							onChange={(e) => {
								poolSkill.value = (e.target as HTMLSelectElement).value;
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
					<div class="pool-result">
						<strong>Pool: {poolNotation}</strong>
						<label class="pool-spec">
							<input
								type="checkbox"
								checked={poolSpec.value}
								onChange={(e) => {
									poolSpec.value = (e.target as HTMLInputElement).checked;
								}}
							/>
							Specialization (reroll 1s)
						</label>
					</div>
					<div class="pool-save">
						<input
							type="text"
							placeholder="Pool label"
							value={poolLabel.value}
							onInput={(e) => {
								poolLabel.value = (e.target as HTMLInputElement).value;
							}}
						/>
						<button type="button" class="btn btn-sm" onClick={handleSavePool}>
							Save Pool
						</button>
					</div>
				</div>
				{(char.savedPools || []).length > 0 && (
					<div class="saved-pools">
						<h4>Saved Pools</h4>
						<ul>
							{(char.savedPools || []).map((p, idx) => (
								<li key={idx}>
									<strong>{p.label}:</strong> {p.notation || p.pool || p.formula}
									<button type="button" class="btn-remove" onClick={() => handleRemovePool(idx)}>
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
