import { AddButton } from "@/components/react/ui/AddButton";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { NumberInput } from "@/components/react/ui/NumberInput";
import type { SpecialAttackEntry, SpellEntry } from "@/lib/dtd/types";
import { CHAR_ABBREV, type DerivedStats, getGunslingerLevel, getLevel, getMartialLevel } from "../constants";
import { useCharSheetStore } from "../store";

export function PowersTab({ derivedStats }: { derivedStats: DerivedStats }) {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);
	const stats = derivedStats;
	const level = getLevel(char);

	// Schools data from JSON
	const magicSchools = data?.schools?.magicSchools ?? [];
	const swordSchools = data?.schools?.swordSchools ?? [];
	const gunKata = data?.schools?.gunKata ?? [];

	// Exaltation data for powers info
	const exaltations = data?.exaltations?.exaltations || [];
	const selectedExalt = exaltations.find((e) => e.id === char.exaltation);

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

	// Build spell name autocomplete from game data (if available)
	const spellOptions: string[] = [];
	if (data && (data as any).spells) {
		const spellList = (data as any).spells.spells || (data as any).spells || [];
		if (Array.isArray(spellList)) {
			for (const s of spellList) {
				if (s.name) spellOptions.push(s.name);
			}
		}
	}

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
		<section className="tab-panel panel-powers">
			{/* ---------- Hero Points ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">Hero Points</h3>
				<div className="mb-md flex flex-wrap gap-md">
					<label className="flex flex-col text-xs uppercase tracking-tight-px" htmlFor="powers-hp-max">
						Max
						<NumberInput
							id="powers-hp-max"
							min={0}
							onChange={(v) =>
								updateChar((c) => {
									c.heroPointsMax = v;
								})
							}
							value={char.heroPointsMax || 2}
						/>
					</label>
					<label className="flex flex-col text-xs uppercase tracking-tight-px" htmlFor="powers-hp-current">
						Current
						<NumberInput
							id="powers-hp-current"
							min={0}
							onChange={(v) =>
								updateChar((c) => {
									c.heroPointsCurrent = v;
								})
							}
							value={char.heroPointsCurrent ?? 0}
						/>
					</label>
					<label className="flex flex-col text-xs uppercase tracking-tight-px" htmlFor="powers-hp-burnt">
						Burnt
						<NumberInput
							id="powers-hp-burnt"
							min={0}
							onChange={(v) =>
								updateChar((c) => {
									c.heroPointsBurnt = v;
								})
							}
							value={char.heroPointsBurnt || 0}
						/>
					</label>
				</div>
				<details className="text-sm text-text-muted">
					<summary className="cursor-pointer font-semibold text-text-primary">Hero Point Uses</summary>
					<ul className="mt-xs list-disc pl-md text-xs">
						<li>Reroll a failed Test (final result stands)</li>
						<li>Reduce TN by 5 (before rolling)</li>
						<li>Add a Raise to a successful Test</li>
						<li>Count as 10 for Initiative</li>
						<li>Instantly recover from Stunned</li>
					</ul>
					<p className="mt-xs italic">
						<strong>Burn:</strong> Permanently lose 1 HP to survive what would have killed you.
					</p>
				</details>
			</div>

			{/* ---------- Power Stat & Resource ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">
					Power Stat &amp; Resource
				</h3>
				<div className="mb-md flex flex-wrap gap-md">
					<label className="flex flex-col text-xs uppercase tracking-tight-px" htmlFor="powers-power-stat">
						Power Stat
						<NumberInput
							id="powers-power-stat"
							min={1}
							onChange={(v) =>
								updateChar((c) => {
									c.powerStat = v;
								})
							}
							value={char.powerStat || 1}
						/>
					</label>
					<label
						className="flex flex-col text-xs uppercase tracking-tight-px"
						htmlFor="powers-resource-current"
					>
						Resource Current
						<NumberInput
							id="powers-resource-current"
							max={stats.resourceMax}
							min={0}
							onChange={(v) =>
								updateChar((c) => {
									c.resourceCurrent = v;
								})
							}
							value={char.resourceCurrent ?? 0}
						/>
					</label>
					<label className="flex flex-col text-xs uppercase tracking-tight-px">
						Resource Max
						<output className="py-xs font-bold text-[1.2rem] text-accent">{stats.resourceMax}</output>
					</label>
				</div>
				<p className="mt-sm text-text-muted text-xs italic">
					<strong>Healing Surge</strong> (Half Action): Spend Resource Points up to your Level to heal that
					many HP. Gain +5 Static Defense until next turn.
				</p>
				{selectedExalt && (
					<div className="mt-sm space-y-xs rounded-sm border border-border bg-bg p-md text-sm text-text-muted">
						<h4 className="m-0 mb-xs text-sm text-text-primary">Exaltation Powers</h4>
						{selectedExalt.staticPowers && selectedExalt.staticPowers.length > 0 && (
							<ul className="my-xs pl-lg">
								{selectedExalt.staticPowers.map((p: any, _i: number) => (
									<li className="mb-0.5" key={typeof p === "string" ? p : p.name}>
										{typeof p === "string" ? p : `${p.name}: ${p.description}`}
									</li>
								))}
							</ul>
						)}
						{selectedExalt.progression && selectedExalt.progression.length > 0 && (
							<div>
								<strong>Progression:</strong>
								<ul className="my-xs pl-lg">
									{selectedExalt.progression.map((p: any, i: number) => (
										<li
											className="mb-0.5"
											key={typeof p === "string" ? p : `${p.dots ?? i}-${p.name}`}
										>
											{typeof p === "string" ? p : `${p.name}: ${p.description}`}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}
			</div>

			{/* ---------- Magic Schools ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">Magic Schools</h3>
				<div className="mb-md flex flex-wrap gap-md">
					<GameCheckbox
						checked={char.sanctioned}
						label="Sanctioned"
						onChange={(e) =>
							updateChar((c) => {
								c.sanctioned = (e.target as HTMLInputElement).checked;
							})
						}
					/>
					<label
						className="flex flex-col text-xs uppercase tracking-tight-px"
						htmlFor="powers-extra-school-levels"
					>
						Extra School Levels
						<NumberInput
							id="powers-extra-school-levels"
							min={0}
							onChange={(v) =>
								updateChar((c) => {
									c.extraSchoolLevels = v;
								})
							}
							value={char.extraSchoolLevels || 0}
						/>
					</label>
					<GameCheckbox
						checked={char.fettered}
						label="Fettered"
						onChange={(e) =>
							updateChar((c) => {
								c.fettered = (e.target as HTMLInputElement).checked;
							})
						}
					/>
					<label className="flex flex-col text-xs uppercase tracking-tight-px" htmlFor="powers-push-amount">
						Push Amount
						<NumberInput
							id="powers-push-amount"
							min={0}
							onChange={(v) =>
								updateChar((c) => {
									c.pushAmount = v;
								})
							}
							value={char.pushAmount || 0}
						/>
					</label>
					<span className="inline-flex items-center rounded-sm bg-accent/10 px-sm py-xs font-semibold text-accent text-sm">
						Caster Level: {casterLevel}
					</span>
				</div>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
					{magicSchools.map((school: any) => {
						const base = char.magicSchools?.[school.id] || 0;
						const bonus = char.bonusSchoolLevels?.[school.id] || 0;
						const eff = base + bonus;
						const charAbbrev = CHAR_ABBREV[school.characteristic] || school.characteristic;
						return (
							<div className="rounded-sm border border-border bg-bg px-sm py-xs" key={school.id}>
								<span className="mb-2xs block font-medium text-sm">
									{school.name} <small className="text-text-muted">({charAbbrev})</small>
								</span>
								<div className="flex items-center gap-xs">
									<NumberInput
										max={level}
										min={0}
										onChange={(v) =>
											updateChar((c) => {
												if (!c.magicSchools) c.magicSchools = {};
												c.magicSchools[school.id] = v;
											})
										}
										title="Base dots"
										value={base}
									/>
									<NumberInput
										min={0}
										onChange={(v) =>
											updateChar((c) => {
												if (!c.bonusSchoolLevels) c.bonusSchoolLevels = {};
												c.bonusSchoolLevels[school.id] = v;
											})
										}
										title="Bonus levels"
										value={bonus}
									/>
									<span className="min-w-5 text-center font-bold text-accent" title="Effective level">
										= {eff}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Spells ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">
					Spells ({spells.length})
				</h3>
				<datalist id="dl-spell-names">
					{spellOptions.map((n) => (
						<option key={n} value={n} />
					))}
				</datalist>
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-text-muted text-xs uppercase tracking-wide-px">
								School
							</th>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-text-muted text-xs uppercase tracking-wide-px">
								Name
							</th>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-text-muted text-xs uppercase tracking-wide-px">
								Level
							</th>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-text-muted text-xs uppercase tracking-wide-px">
								Notes
							</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{spells.map((sp, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: editable spell list identified by position
							<tr key={idx}>
								<td className="border-border border-b px-sm py-2xs align-middle">
									<GameSelect
										onChange={(e) =>
											handleSpellField(idx, "school", (e.target as HTMLSelectElement).value)
										}
										value={sp.school}
									>
										<option value="">—</option>
										{magicSchools.map((s: any) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</GameSelect>
								</td>
								<td className="border-border border-b px-sm py-2xs align-middle">
									<GameInput
										list="dl-spell-names"
										onInput={(e) =>
											handleSpellField(idx, "name", (e.target as HTMLInputElement).value)
										}
										type="text"
										value={sp.name}
									/>
								</td>
								<td className="border-border border-b px-sm py-2xs align-middle">
									<NumberInput
										min={0}
										onChange={(v) => handleSpellField(idx, "level", v)}
										value={sp.level}
									/>
								</td>
								<td className="border-border border-b px-sm py-2xs align-middle">
									<GameInput
										onInput={(e) =>
											handleSpellField(idx, "notes", (e.target as HTMLInputElement).value)
										}
										type="text"
										value={sp.notes}
									/>
								</td>
								<td className="border-border border-b px-sm py-2xs align-middle">
									<button
										className="cursor-pointer border-none bg-transparent p-0.5 text-base text-error leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
										onClick={() => handleRemoveSpell(idx)}
										type="button"
									>
										×
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<AddButton label="Spell" onClick={handleAddSpell} />
			</div>

			{/* ---------- Sword Schools ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">Sword Schools</h3>
				<span className="mb-sm inline-flex items-center rounded-sm bg-accent/10 px-sm py-xs font-semibold text-accent text-sm">
					Martial Level: {martialLevel}
				</span>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-sm">
					{swordSchools.map((school: any) => {
						const dots = char.swordSchools?.[school.id] || 0;
						return (
							<div
								className="flex items-center gap-sm rounded-sm border border-border bg-bg px-sm py-xs"
								key={school.id}
							>
								<span className="flex-1 font-medium text-sm">{school.name}</span>
								<NumberInput
									max={5}
									min={0}
									onChange={(v) =>
										updateChar((c) => {
											if (!c.swordSchools) c.swordSchools = {};
											c.swordSchools[school.id] = v;
										})
									}
									value={dots}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Special Attacks ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">Special Attacks</h3>
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-text-muted text-xs uppercase tracking-wide-px">
								Name
							</th>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-text-muted text-xs uppercase tracking-wide-px">
								Description
							</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{specials.map((sa, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
							<tr key={idx}>
								<td className="border-border border-b px-sm py-2xs align-middle">
									<GameInput
										onInput={(e) =>
											handleSpecialField(idx, "name", (e.target as HTMLInputElement).value)
										}
										type="text"
										value={sa.name}
									/>
								</td>
								<td className="border-border border-b px-sm py-2xs align-middle">
									<GameInput
										onInput={(e) =>
											handleSpecialField(idx, "description", (e.target as HTMLInputElement).value)
										}
										type="text"
										value={sa.description}
									/>
								</td>
								<td className="border-border border-b px-sm py-2xs align-middle">
									<button
										className="cursor-pointer border-none bg-transparent p-0.5 text-base text-error leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
										onClick={() => handleRemoveSpecial(idx)}
										type="button"
									>
										×
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<AddButton label="Special Attack" onClick={handleAddSpecial} />
			</div>

			{/* ---------- Gun Kata ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">Gun Kata</h3>
				<span className="mb-sm inline-flex items-center rounded-sm bg-accent/10 px-sm py-xs font-semibold text-accent text-sm">
					Gunslinger Level: {gunslingerLevel}
				</span>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-sm">
					{gunKata.map((kata: any) => {
						const dots = char.gunKata?.[kata.id] || 0;
						return (
							<div
								className="flex items-center gap-sm rounded-sm border border-border bg-bg px-sm py-xs"
								key={kata.id}
							>
								<span className="flex-1 font-medium text-sm">{kata.name}</span>
								<NumberInput
									max={5}
									min={0}
									onChange={(v) =>
										updateChar((c) => {
											if (!c.gunKata) c.gunKata = {};
											c.gunKata[kata.id] = v;
										})
									}
									value={dots}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Trick Shots ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">Trick Shots</h3>
				<ul className="m-0 list-none p-0">
					{trickShots.map((ts, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
						<li className="mb-1 flex items-center gap-sm" key={idx}>
							<GameInput
								className="flex-1"
								onInput={(e) => handleTrickShotChange(idx, (e.target as HTMLInputElement).value)}
								type="text"
								value={ts}
							/>
							<button
								className="cursor-pointer border-none bg-transparent p-0.5 text-base text-error leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
								onClick={() => handleRemoveTrickShot(idx)}
								type="button"
							>
								×
							</button>
						</li>
					))}
				</ul>
				<AddButton label="Trick Shot" onClick={handleAddTrickShot} />
			</div>
		</section>
	);
}
