import { AddButton } from "@/components/react/ui/AddButton";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import type { SpecialAttackEntry, SpellEntry } from "@/lib/dtd/types";
import {
	CHAR_ABBREV,
	type DerivedStats,
	GUN_KATA,
	getGunslingerLevel,
	getLevel,
	getMartialLevel,
	MAGIC_SCHOOLS,
	SWORD_SCHOOLS,
} from "../constants";
import { useCharSheetStore } from "../store";

export function PowersTab({ derivedStats }: { derivedStats: DerivedStats }) {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);
	const stats = derivedStats;
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
		<section className="tab-panel panel-powers">
			{/* ---------- Hero Points ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Hero Points</h3>
				<div className="mb-md flex flex-wrap gap-md">
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Max
						<GameInput
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.heroPointsMax = Number((e.target as HTMLInputElement).value);
								})
							}
							type="number"
							value={char.heroPointsMax || 2}
						/>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Current
						<GameInput
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.heroPointsCurrent = Number((e.target as HTMLInputElement).value);
								})
							}
							type="number"
							value={char.heroPointsCurrent ?? 0}
						/>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Burnt
						<GameInput
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.heroPointsBurnt = Number((e.target as HTMLInputElement).value);
								})
							}
							type="number"
							value={char.heroPointsBurnt || 0}
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
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Push Amount
						<GameInput
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.pushAmount = Number((e.target as HTMLInputElement).value);
								})
							}
							type="number"
							value={char.pushAmount || 0}
						/>
					</label>
				</div>
			</div>

			{/* ---------- Power Stat & Resource ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">
					Power Stat &amp; Resource
				</h3>
				<div className="mb-md flex flex-wrap gap-md">
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Power Stat
						<GameInput
							min={1}
							onInput={(e) =>
								updateChar((c) => {
									c.powerStat = Number((e.target as HTMLInputElement).value);
								})
							}
							type="number"
							value={char.powerStat || 1}
						/>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Resource Current
						<GameInput
							max={stats.resourceMax}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.resourceCurrent = Number((e.target as HTMLInputElement).value);
								})
							}
							type="number"
							value={char.resourceCurrent ?? 0}
						/>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Resource Max
						<output className="py-xs font-bold text-[1.2rem] text-accent">{stats.resourceMax}</output>
					</label>
				</div>
				{selectedExalt && (
					<div className="mt-sm space-y-xs rounded-sm border border-border bg-bg p-md text-[0.85rem] text-text-muted">
						<h4 className="m-0 mb-xs text-[0.9rem] text-text-primary">Exaltation Powers</h4>
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
											key={typeof p === "string" ? p : `${p.level || i}-${p.name}`}
										>
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
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Magic Schools</h3>
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
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Extra School Levels
						<GameInput
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.extraSchoolLevels = Number((e.target as HTMLInputElement).value);
								})
							}
							type="number"
							value={char.extraSchoolLevels || 0}
						/>
					</label>
					<span className="inline-flex items-center rounded-sm bg-accent/10 px-sm py-xs font-semibold text-[0.85rem] text-accent">
						Caster Level: {casterLevel}
					</span>
				</div>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-sm">
					{MAGIC_SCHOOLS.map((school) => {
						const base = char.magicSchools?.[school.id] || 0;
						const bonus = char.bonusSchoolLevels?.[school.id] || 0;
						const eff = base + bonus;
						const charAbbrev = CHAR_ABBREV[school.char] || school.char;
						return (
							<div
								className="flex items-center gap-sm rounded-sm border border-border bg-bg px-sm py-xs"
								key={school.id}
							>
								<span className="flex-1 font-medium text-[0.85rem]">
									{school.name} <small>({charAbbrev})</small>
								</span>
								<GameInput
									className="w-11 text-center font-semibold text-[0.9rem]"
									max={level}
									min={0}
									onInput={(e) =>
										updateChar((c) => {
											if (!c.magicSchools) c.magicSchools = {};
											c.magicSchools[school.id] = Number((e.target as HTMLInputElement).value);
										})
									}
									title="Base dots"
									type="number"
									value={base}
								/>
								<GameInput
									className="w-11 text-center font-semibold text-[0.9rem] text-info"
									min={0}
									onInput={(e) =>
										updateChar((c) => {
											if (!c.bonusSchoolLevels) c.bonusSchoolLevels = {};
											c.bonusSchoolLevels[school.id] = Number(
												(e.target as HTMLInputElement).value,
											);
										})
									}
									title="Bonus levels"
									type="number"
									value={bonus}
								/>
								<span className="min-w-5 text-center font-bold text-accent" title="Effective level">
									= {eff}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Spells ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Spells</h3>
				<table className="w-full border-collapse text-[0.85rem]">
					<thead>
						<tr>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
								School
							</th>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
								Name
							</th>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
								Level
							</th>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
								Notes
							</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{spells.map((sp, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: editable spell list identified by position
							<tr key={idx}>
								<td className="border-border border-b px-sm py-[3px] align-middle">
									<GameSelect
										onChange={(e) =>
											handleSpellField(idx, "school", (e.target as HTMLSelectElement).value)
										}
										value={sp.school}
									>
										<option value="">—</option>
										{MAGIC_SCHOOLS.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</GameSelect>
								</td>
								<td className="border-border border-b px-sm py-[3px] align-middle">
									<GameInput
										onInput={(e) =>
											handleSpellField(idx, "name", (e.target as HTMLInputElement).value)
										}
										type="text"
										value={sp.name}
									/>
								</td>
								<td className="border-border border-b px-sm py-[3px] align-middle">
									<GameInput
										min={0}
										onInput={(e) =>
											handleSpellField(idx, "level", Number((e.target as HTMLInputElement).value))
										}
										type="number"
										value={sp.level}
									/>
								</td>
								<td className="border-border border-b px-sm py-[3px] align-middle">
									<GameInput
										onInput={(e) =>
											handleSpellField(idx, "notes", (e.target as HTMLInputElement).value)
										}
										type="text"
										value={sp.notes}
									/>
								</td>
								<td className="border-border border-b px-sm py-[3px] align-middle">
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
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Sword Schools</h3>
				<span className="mb-sm inline-flex items-center rounded-sm bg-accent/10 px-sm py-xs font-semibold text-[0.85rem] text-accent">
					Martial Level: {martialLevel}
				</span>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-sm">
					{SWORD_SCHOOLS.map((school) => {
						const dots = char.swordSchools?.[school.id] || 0;
						return (
							<div
								className="flex items-center gap-sm rounded-sm border border-border bg-bg px-sm py-xs"
								key={school.id}
							>
								<span className="flex-1 font-medium text-[0.85rem]">{school.name}</span>
								<GameInput
									className="w-11 text-center font-semibold text-[0.9rem]"
									max={5}
									min={0}
									onInput={(e) =>
										updateChar((c) => {
											if (!c.swordSchools) c.swordSchools = {};
											c.swordSchools[school.id] = Number((e.target as HTMLInputElement).value);
										})
									}
									type="number"
									value={dots}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Special Attacks ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Special Attacks</h3>
				<table className="w-full border-collapse text-[0.85rem]">
					<thead>
						<tr>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
								Name
							</th>
							<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
								Description
							</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{specials.map((sa, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
							<tr key={idx}>
								<td className="border-border border-b px-sm py-[3px] align-middle">
									<GameInput
										onInput={(e) =>
											handleSpecialField(idx, "name", (e.target as HTMLInputElement).value)
										}
										type="text"
										value={sa.name}
									/>
								</td>
								<td className="border-border border-b px-sm py-[3px] align-middle">
									<GameInput
										onInput={(e) =>
											handleSpecialField(idx, "description", (e.target as HTMLInputElement).value)
										}
										type="text"
										value={sa.description}
									/>
								</td>
								<td className="border-border border-b px-sm py-[3px] align-middle">
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
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Gun Kata</h3>
				<span className="mb-sm inline-flex items-center rounded-sm bg-accent/10 px-sm py-xs font-semibold text-[0.85rem] text-accent">
					Gunslinger Level: {gunslingerLevel}
				</span>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-sm">
					{GUN_KATA.map((kata) => {
						const dots = char.gunKata?.[kata.id] || 0;
						return (
							<div
								className="flex items-center gap-sm rounded-sm border border-border bg-bg px-sm py-xs"
								key={kata.id}
							>
								<span className="flex-1 font-medium text-[0.85rem]">{kata.name}</span>
								<GameInput
									className="w-11 text-center font-semibold text-[0.9rem]"
									max={5}
									min={0}
									onInput={(e) =>
										updateChar((c) => {
											if (!c.gunKata) c.gunKata = {};
											c.gunKata[kata.id] = Number((e.target as HTMLInputElement).value);
										})
									}
									type="number"
									value={dots}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Trick Shots ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Trick Shots</h3>
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
