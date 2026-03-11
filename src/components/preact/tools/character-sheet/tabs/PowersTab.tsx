import type { SpecialAttackEntry, SpellEntry } from "@/lib/dtd/types";
import { charSignal, derivedStats, gameData, updateChar } from "../CharacterSheetApp";
import {
	CHAR_ABBREV,
	GUN_KATA,
	getGunslingerLevel,
	getLevel,
	getMartialLevel,
	MAGIC_SCHOOLS,
	SWORD_SCHOOLS,
} from "../constants";

export function PowersTab() {
	const char = charSignal.value;
	const stats = derivedStats.value;
	const data = gameData.value;
	const level = getLevel(char);

	// Exaltation data for powers info
	const exaltations = data?.exaltations?.exaltations || [];
	const selectedExalt = exaltations.find((e: any) => e.id === char.exaltation);

	// Caster level = highest magic school
	const schoolVals = Object.values(char.magicSchools || {});
	const casterLevel = schoolVals.length > 0 ? Math.max(0, ...schoolVals) : 0;

	const martialLevel = getMartialLevel(char.swordSchools || {});
	const gunslingerLevel = getGunslingerLevel(char.gunKata || {});

	// ---------- Spell helpers ----------
	const spells = (char.spells || []).map((s) =>
		typeof s === "string" ? { school: "", level: 0, name: s, notes: "" } : s,
	) as SpellEntry[];

	const handleSpellField = (idx: number, field: string, value: any) => {
		updateChar((c) => {
			if (!c.spells) c.spells = [];
			const entry = c.spells[idx];
			if (typeof entry === "object") (entry as any)[field] = value;
		});
	};

	const handleAddSpell = () => {
		updateChar((c) => {
			if (!c.spells) c.spells = [];
			c.spells.push({ school: "", level: 0, name: "", notes: "" });
		});
	};

	const handleRemoveSpell = (idx: number) => {
		updateChar((c) => {
			c.spells = c.spells.filter((_, i) => i !== idx);
		});
	};

	// ---------- Special Attack helpers ----------
	const specials = (char.specialAttacks || []).map((s) =>
		typeof s === "string" ? { name: s, description: "" } : s,
	) as SpecialAttackEntry[];

	const handleSpecialField = (idx: number, field: string, value: string) => {
		updateChar((c) => {
			if (!c.specialAttacks) c.specialAttacks = [];
			const entry = c.specialAttacks[idx];
			if (typeof entry === "object") (entry as any)[field] = value;
		});
	};

	const handleAddSpecial = () => {
		updateChar((c) => {
			if (!c.specialAttacks) c.specialAttacks = [];
			c.specialAttacks.push({ name: "", description: "" });
		});
	};

	const handleRemoveSpecial = (idx: number) => {
		updateChar((c) => {
			c.specialAttacks = c.specialAttacks.filter((_, i) => i !== idx);
		});
	};

	// ---------- Trick Shot helpers ----------
	const trickShots = char.trickShots || [];

	const handleTrickShotChange = (idx: number, value: string) => {
		updateChar((c) => {
			if (!c.trickShots) c.trickShots = [];
			c.trickShots[idx] = value;
		});
	};

	const handleAddTrickShot = () => {
		updateChar((c) => {
			if (!c.trickShots) c.trickShots = [];
			c.trickShots.push("");
		});
	};

	const handleRemoveTrickShot = (idx: number) => {
		updateChar((c) => {
			c.trickShots = (c.trickShots || []).filter((_, i) => i !== idx);
		});
	};

	return (
		<section class="tab-panel panel-powers">
			{/* ---------- Hero Points ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Hero Points</h3>
				<div class="flex gap-md mb-md flex-wrap">
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Max
						<input
							type="number"
							value={char.heroPointsMax || 2}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.heroPointsMax = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Current
						<input
							type="number"
							value={char.heroPointsCurrent ?? 0}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.heroPointsCurrent = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Burnt
						<input
							type="number"
							value={char.heroPointsBurnt || 0}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.heroPointsBurnt = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<label class="flex items-center gap-sm text-[0.85rem]">
						<input
							type="checkbox"
							checked={char.fettered || false}
							onChange={(e) =>
								updateChar((c) => {
									c.fettered = (e.target as HTMLInputElement).checked;
								})
							}
						/>
						Fettered
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Push Amount
						<input
							type="number"
							value={char.pushAmount || 0}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.pushAmount = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
				</div>
			</div>

			{/* ---------- Power Stat & Resource ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">
					Power Stat &amp; Resource
				</h3>
				<div class="flex gap-md mb-md flex-wrap">
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Power Stat
						<input
							type="number"
							value={char.powerStat || 1}
							min={1}
							onInput={(e) =>
								updateChar((c) => {
									c.powerStat = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Resource Current
						<input
							type="number"
							value={char.resourceCurrent ?? 0}
							min={0}
							max={stats.resourceMax}
							onInput={(e) =>
								updateChar((c) => {
									c.resourceCurrent = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Resource Max
						<output class="font-bold text-[1.2rem] text-accent py-xs">{stats.resourceMax}</output>
					</label>
				</div>
				{selectedExalt && (
					<div class="bg-bg border border-border rounded-sm p-md mt-sm text-[0.85rem] text-text-muted space-y-xs">
						<h4 class="m-0 mb-xs text-text-primary text-[0.9rem]">Exaltation Powers</h4>
						{selectedExalt.staticPowers && selectedExalt.staticPowers.length > 0 && (
							<ul class="my-xs pl-lg">
								{selectedExalt.staticPowers.map((p: any, i: number) => (
									<li key={i} class="mb-0.5">
										{typeof p === "string" ? p : `${p.name}: ${p.description}`}
									</li>
								))}
							</ul>
						)}
						{selectedExalt.progression && selectedExalt.progression.length > 0 && (
							<div>
								<strong>Progression:</strong>
								<ul class="my-xs pl-lg">
									{selectedExalt.progression.map((p: any, i: number) => (
										<li key={i} class="mb-0.5">
											{typeof p === "string" ? p : `Level ${p.level}: ${p.description || p.name}`}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}
			</div>

			{/* ---------- Magic Schools ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Magic Schools</h3>
				<div class="flex gap-md mb-md flex-wrap">
					<label class="flex items-center gap-sm text-[0.85rem]">
						<input
							type="checkbox"
							checked={char.sanctioned || false}
							onChange={(e) =>
								updateChar((c) => {
									c.sanctioned = (e.target as HTMLInputElement).checked;
								})
							}
						/>
						Sanctioned
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Extra School Levels
						<input
							type="number"
							value={char.extraSchoolLevels || 0}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.extraSchoolLevels = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<span class="inline-flex items-center px-sm py-xs bg-accent/10 text-accent text-[0.85rem] font-semibold rounded-sm">
						Caster Level: {casterLevel}
					</span>
				</div>
				<div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-sm">
					{MAGIC_SCHOOLS.map((school) => {
						const base = char.magicSchools?.[school.id] || 0;
						const bonus = char.bonusSchoolLevels?.[school.id] || 0;
						const eff = base + bonus;
						const charAbbrev = CHAR_ABBREV[school.char] || school.char;
						return (
							<div
								key={school.id}
								class="flex items-center gap-sm px-sm py-xs bg-bg border border-border rounded-sm"
							>
								<span class="flex-1 font-medium text-[0.85rem]">
									{school.name} <small>({charAbbrev})</small>
								</span>
								<input
									type="number"
									class="w-11 py-0.5 px-1 text-center font-semibold text-[0.9rem] bg-bg border border-border rounded-[3px] focus:border-accent"
									value={base}
									min={0}
									max={level}
									title="Base dots"
									onInput={(e) =>
										updateChar((c) => {
											if (!c.magicSchools) c.magicSchools = {};
											c.magicSchools[school.id] = Number((e.target as HTMLInputElement).value);
										})
									}
								/>
								<input
									type="number"
									class="w-11 py-0.5 px-1 text-center font-semibold text-[0.9rem] bg-bg border border-border rounded-[3px] text-info focus:border-accent"
									value={bonus}
									min={0}
									title="Bonus levels"
									onInput={(e) =>
										updateChar((c) => {
											if (!c.bonusSchoolLevels) c.bonusSchoolLevels = {};
											c.bonusSchoolLevels[school.id] = Number(
												(e.target as HTMLInputElement).value,
											);
										})
									}
								/>
								<span class="font-bold text-accent min-w-5 text-center" title="Effective level">
									= {eff}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Spells ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Spells</h3>
				<table class="w-full border-collapse text-[0.85rem]">
					<thead>
						<tr>
							<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
								School
							</th>
							<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
								Name
							</th>
							<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
								Level
							</th>
							<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
								Notes
							</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{spells.map((sp, idx) => (
							<tr key={idx}>
								<td class="py-[3px] px-sm border-b border-border align-middle">
									<select
										class="w-full text-[0.82rem] py-0.5 px-1 bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
										value={sp.school}
										onChange={(e) =>
											handleSpellField(idx, "school", (e.target as HTMLSelectElement).value)
										}
									>
										<option value="">—</option>
										{MAGIC_SCHOOLS.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</select>
								</td>
								<td class="py-[3px] px-sm border-b border-border align-middle">
									<input
										type="text"
										class="w-full text-[0.82rem] py-0.5 px-1 bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
										value={sp.name}
										onInput={(e) =>
											handleSpellField(idx, "name", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
								<td class="py-[3px] px-sm border-b border-border align-middle">
									<input
										type="number"
										class="w-full text-[0.82rem] py-0.5 px-1 bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
										value={sp.level}
										min={0}
										onInput={(e) =>
											handleSpellField(idx, "level", Number((e.target as HTMLInputElement).value))
										}
									/>
								</td>
								<td class="py-[3px] px-sm border-b border-border align-middle">
									<input
										type="text"
										class="w-full text-[0.82rem] py-0.5 px-1 bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
										value={sp.notes}
										onInput={(e) =>
											handleSpellField(idx, "notes", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
								<td class="py-[3px] px-sm border-b border-border align-middle">
									<button
										type="button"
										class="bg-transparent border-none text-error cursor-pointer text-base p-0.5 leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
										onClick={() => handleRemoveSpell(idx)}
									>
										×
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<button type="button" class="btn btn-sm" onClick={handleAddSpell}>
					+ Add Spell
				</button>
			</div>

			{/* ---------- Sword Schools ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Sword Schools</h3>
				<span class="inline-flex items-center px-sm py-xs bg-accent/10 text-accent text-[0.85rem] font-semibold rounded-sm mb-sm">
					Martial Level: {martialLevel}
				</span>
				<div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-sm">
					{SWORD_SCHOOLS.map((school) => {
						const dots = char.swordSchools?.[school.id] || 0;
						return (
							<div
								key={school.id}
								class="flex items-center gap-sm px-sm py-xs bg-bg border border-border rounded-sm"
							>
								<span class="flex-1 font-medium text-[0.85rem]">{school.name}</span>
								<input
									type="number"
									class="w-11 py-0.5 px-1 text-center font-semibold text-[0.9rem] bg-bg border border-border rounded-[3px] focus:border-accent"
									value={dots}
									min={0}
									max={5}
									onInput={(e) =>
										updateChar((c) => {
											if (!c.swordSchools) c.swordSchools = {};
											c.swordSchools[school.id] = Number((e.target as HTMLInputElement).value);
										})
									}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Special Attacks ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Special Attacks</h3>
				<table class="w-full border-collapse text-[0.85rem]">
					<thead>
						<tr>
							<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
								Name
							</th>
							<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
								Description
							</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{specials.map((sa, idx) => (
							<tr key={idx}>
								<td class="py-[3px] px-sm border-b border-border align-middle">
									<input
										type="text"
										class="w-full text-[0.82rem] py-0.5 px-1 bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
										value={sa.name}
										onInput={(e) =>
											handleSpecialField(idx, "name", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
								<td class="py-[3px] px-sm border-b border-border align-middle">
									<input
										type="text"
										class="w-full text-[0.82rem] py-0.5 px-1 bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
										value={sa.description}
										onInput={(e) =>
											handleSpecialField(idx, "description", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
								<td class="py-[3px] px-sm border-b border-border align-middle">
									<button
										type="button"
										class="bg-transparent border-none text-error cursor-pointer text-base p-0.5 leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
										onClick={() => handleRemoveSpecial(idx)}
									>
										×
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<button type="button" class="btn btn-sm" onClick={handleAddSpecial}>
					+ Add Special Attack
				</button>
			</div>

			{/* ---------- Gun Kata ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Gun Kata</h3>
				<span class="inline-flex items-center px-sm py-xs bg-accent/10 text-accent text-[0.85rem] font-semibold rounded-sm mb-sm">
					Gunslinger Level: {gunslingerLevel}
				</span>
				<div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-sm">
					{GUN_KATA.map((kata) => {
						const dots = char.gunKata?.[kata.id] || 0;
						return (
							<div
								key={kata.id}
								class="flex items-center gap-sm px-sm py-xs bg-bg border border-border rounded-sm"
							>
								<span class="flex-1 font-medium text-[0.85rem]">{kata.name}</span>
								<input
									type="number"
									class="w-11 py-0.5 px-1 text-center font-semibold text-[0.9rem] bg-bg border border-border rounded-[3px] focus:border-accent"
									value={dots}
									min={0}
									max={5}
									onInput={(e) =>
										updateChar((c) => {
											if (!c.gunKata) c.gunKata = {};
											c.gunKata[kata.id] = Number((e.target as HTMLInputElement).value);
										})
									}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Trick Shots ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Trick Shots</h3>
				<ul class="list-none p-0 m-0">
					{trickShots.map((ts, idx) => (
						<li key={idx} class="flex items-center gap-sm mb-1">
							<input
								type="text"
								class="flex-1 py-0.5 px-1 text-[0.85rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
								value={ts}
								onInput={(e) => handleTrickShotChange(idx, (e.target as HTMLInputElement).value)}
							/>
							<button
								type="button"
								class="bg-transparent border-none text-error cursor-pointer text-base p-0.5 leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
								onClick={() => handleRemoveTrickShot(idx)}
							>
								×
							</button>
						</li>
					))}
				</ul>
				<button type="button" class="btn btn-sm" onClick={handleAddTrickShot}>
					+ Add Trick Shot
				</button>
			</div>
		</section>
	);
}
