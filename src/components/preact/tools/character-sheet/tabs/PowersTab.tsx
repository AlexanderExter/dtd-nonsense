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
			<div class="card">
				<h3>Hero Points</h3>
				<div class="form-row">
					<label>
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
					<label>
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
					<label>
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
					<label class="field-inline">
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
					<label>
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
			<div class="card">
				<h3>Power Stat &amp; Resource</h3>
				<div class="form-row">
					<label>
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
					<label>
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
					<label>
						Resource Max
						<output>{stats.resourceMax}</output>
					</label>
				</div>
				{selectedExalt && (
					<div class="info-box">
						<h4>Exaltation Powers</h4>
						{selectedExalt.staticPowers && selectedExalt.staticPowers.length > 0 && (
							<ul>
								{selectedExalt.staticPowers.map((p: any, i: number) => (
									<li key={i}>{typeof p === "string" ? p : `${p.name}: ${p.description}`}</li>
								))}
							</ul>
						)}
						{selectedExalt.progression && selectedExalt.progression.length > 0 && (
							<div>
								<strong>Progression:</strong>
								<ul>
									{selectedExalt.progression.map((p: any, i: number) => (
										<li key={i}>
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
			<div class="card">
				<h3>Magic Schools</h3>
				<div class="form-row">
					<label class="field-inline">
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
					<label>
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
					<span class="stat-badge">Caster Level: {casterLevel}</span>
				</div>
				<div class="school-grid">
					{MAGIC_SCHOOLS.map((school) => {
						const base = char.magicSchools?.[school.id] || 0;
						const bonus = char.bonusSchoolLevels?.[school.id] || 0;
						const eff = base + bonus;
						const charAbbrev = CHAR_ABBREV[school.char] || school.char;
						return (
							<div key={school.id} class="school-row">
								<span class="school-name">
									{school.name} <small>({charAbbrev})</small>
								</span>
								<input
									type="number"
									class="school-dots"
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
									class="school-bonus"
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
								<span class="school-eff" title="Effective level">
									= {eff}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Spells ---------- */}
			<div class="card">
				<h3>Spells</h3>
				<table class="spell-table">
					<thead>
						<tr>
							<th>School</th>
							<th>Name</th>
							<th>Level</th>
							<th>Notes</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{spells.map((sp, idx) => (
							<tr key={idx}>
								<td>
									<select
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
								<td>
									<input
										type="text"
										value={sp.name}
										onInput={(e) =>
											handleSpellField(idx, "name", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
								<td>
									<input
										type="number"
										value={sp.level}
										min={0}
										onInput={(e) =>
											handleSpellField(idx, "level", Number((e.target as HTMLInputElement).value))
										}
									/>
								</td>
								<td>
									<input
										type="text"
										value={sp.notes}
										onInput={(e) =>
											handleSpellField(idx, "notes", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
								<td>
									<button type="button" class="btn-remove" onClick={() => handleRemoveSpell(idx)}>
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
			<div class="card">
				<h3>Sword Schools</h3>
				<span class="stat-badge">Martial Level: {martialLevel}</span>
				<div class="school-grid">
					{SWORD_SCHOOLS.map((school) => {
						const dots = char.swordSchools?.[school.id] || 0;
						return (
							<div key={school.id} class="school-row">
								<span class="school-name">{school.name}</span>
								<input
									type="number"
									class="school-dots"
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
			<div class="card">
				<h3>Special Attacks</h3>
				<table class="special-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{specials.map((sa, idx) => (
							<tr key={idx}>
								<td>
									<input
										type="text"
										value={sa.name}
										onInput={(e) =>
											handleSpecialField(idx, "name", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
								<td>
									<input
										type="text"
										value={sa.description}
										onInput={(e) =>
											handleSpecialField(idx, "description", (e.target as HTMLInputElement).value)
										}
									/>
								</td>
								<td>
									<button type="button" class="btn-remove" onClick={() => handleRemoveSpecial(idx)}>
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
			<div class="card">
				<h3>Gun Kata</h3>
				<span class="stat-badge">Gunslinger Level: {gunslingerLevel}</span>
				<div class="school-grid">
					{GUN_KATA.map((kata) => {
						const dots = char.gunKata?.[kata.id] || 0;
						return (
							<div key={kata.id} class="school-row">
								<span class="school-name">{kata.name}</span>
								<input
									type="number"
									class="school-dots"
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
			<div class="card">
				<h3>Trick Shots</h3>
				<ul class="trick-shots-list">
					{trickShots.map((ts, idx) => (
						<li key={idx}>
							<input
								type="text"
								value={ts}
								onInput={(e) => handleTrickShotChange(idx, (e.target as HTMLInputElement).value)}
							/>
							<button type="button" class="btn-remove" onClick={() => handleRemoveTrickShot(idx)}>
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
