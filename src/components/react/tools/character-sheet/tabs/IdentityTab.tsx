import { Button } from "@/components/react/ui/Button";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { GameTextarea } from "@/components/react/ui/GameTextarea";
import type { DerivedStats } from "../constants";
import { useCharSheetStore } from "../store";

export function IdentityTab({ derivedStats }: { derivedStats: DerivedStats }) {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);
	const stats = derivedStats;

	// ---------- Race data ----------
	const races = data?.races?.races || [];
	const selectedRace = races.find((r: any) => r.id === char.race);
	const charBonusOptions: string[] = selectedRace?.charBonus?.options || [];

	// ---------- Exaltation data ----------
	const exaltations = data?.exaltations?.exaltations || [];
	const selectedExalt = exaltations.find((e: any) => e.id === char.exaltation);

	// ---------- Alignment data ----------
	const alignments = data?.alignments?.alignments || [];
	const selectedAlign = alignments.find((a: any) => a.id === char.alignment);

	// ---------- Handlers ----------

	const handleRaceChange = (raceId: string) => {
		updateChar((c) => {
			c.race = raceId;
			c.raceCharBonus = "";
			// Auto-seed languages from race data
			const race = races.find((r: any) => r.id === raceId);
			if (race?.languages && Array.isArray(race.languages)) {
				const base = ["Trade"];
				for (const lang of race.languages) {
					if (!base.includes(lang)) base.push(lang);
				}
				c.languages = base;
			}
		});
	};

	const handleExaltationChange = (exaltId: string) => {
		updateChar((c) => {
			c.exaltation = exaltId;
		});
	};

	const handleAddLanguage = () => {
		const lang = prompt("Language name:");
		if (!lang?.trim()) return;
		updateChar((c) => {
			if (!c.languages) c.languages = [];
			if (!c.languages.includes(lang.trim())) {
				c.languages.push(lang.trim());
			}
		});
	};

	const handleRemoveLanguage = (lang: string) => {
		updateChar((c) => {
			c.languages = (c.languages || []).filter((l) => l !== lang);
		});
	};

	return (
		<section className="tab-panel">
			{/* ---------- Identity & Core Info ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">
					Identity &amp; Core Info
				</h3>
				<div className="mb-md grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-md">
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Name
						<GameInput
							onInput={(e) =>
								updateChar((c) => {
									c.name = (e.target as HTMLInputElement).value;
								})
							}
							type="text"
							value={char.name}
						/>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Player
						<GameInput
							onInput={(e) =>
								updateChar((c) => {
									c.player = (e.target as HTMLInputElement).value;
								})
							}
							type="text"
							value={char.player}
						/>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Concept
						<GameInput
							onInput={(e) =>
								updateChar((c) => {
									c.concept = (e.target as HTMLInputElement).value;
								})
							}
							type="text"
							value={char.concept}
						/>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Size
						<output className="py-xs font-bold text-[1.2rem] text-accent">{stats.size}</output>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Height
						<GameInput
							onInput={(e) =>
								updateChar((c) => {
									c.height = (e.target as HTMLInputElement).value;
								})
							}
							type="text"
							value={char.height || ""}
						/>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Weight
						<GameInput
							onInput={(e) =>
								updateChar((c) => {
									c.weight = (e.target as HTMLInputElement).value;
								})
							}
							type="text"
							value={char.weight || ""}
						/>
					</label>
					<label className="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Age
						<GameInput
							onInput={(e) =>
								updateChar((c) => {
									c.age = (e.target as HTMLInputElement).value;
								})
							}
							type="text"
							value={char.age || ""}
						/>
					</label>
				</div>
				<label className="mb-md flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
					Description
					<GameTextarea
						onInput={(e) =>
							updateChar((c) => {
								c.description = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={3}
						value={char.description || ""}
					/>
				</label>
				<div className="mt-md">
					<h4 className="m-0 mb-sm text-[0.85rem] text-accent uppercase tracking-[0.5px]">Languages</h4>
					<div className="flex flex-wrap gap-xs">
						{(char.languages || []).map((lang) => (
							<span
								className="inline-flex items-center gap-1 rounded-sm border border-border bg-bg px-sm py-0.5 text-[0.82rem]"
								key={lang}
							>
								{lang}
								<button
									className="cursor-pointer border-none bg-transparent text-error text-sm leading-none"
									onClick={() => handleRemoveLanguage(lang)}
									type="button"
								>
									×
								</button>
							</span>
						))}
						<Button onClick={handleAddLanguage} size="sm">
							+ Add
						</Button>
					</div>
				</div>
			</div>

			{/* ---------- Race ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Race</h3>
				<GameSelect onChange={(e) => handleRaceChange((e.target as HTMLSelectElement).value)} value={char.race}>
					<option value="">— Select Race —</option>
					{races.map((r: any) => (
						<option key={r.id} value={r.id}>
							{r.name}
						</option>
					))}
				</GameSelect>
				{charBonusOptions.length > 0 && (
					<label className="mt-sm flex items-center gap-sm text-[0.85rem]">
						Characteristic Bonus
						<GameSelect
							onChange={(e) =>
								updateChar((c) => {
									c.raceCharBonus = (e.target as HTMLSelectElement).value;
								})
							}
							value={char.raceCharBonus}
						>
							<option value="">— Choose —</option>
							{charBonusOptions.map((opt: string) => (
								<option key={opt} value={opt}>
									{opt.charAt(0).toUpperCase() + opt.slice(1)}
								</option>
							))}
						</GameSelect>
					</label>
				)}
				{selectedRace && (
					<div className="mt-sm space-y-xs rounded-sm border border-border bg-bg p-md text-[0.85rem] text-text-muted">
						<p className="m-0">
							<strong>Size:</strong> {selectedRace.size}
						</p>
						{selectedRace.skillBonus && selectedRace.skillBonus.length > 0 && (
							<p className="m-0">
								<strong>Skill Bonuses:</strong>{" "}
								{selectedRace.skillBonus.map((sb: any) => `${sb.skill} +${sb.value}`).join(", ")}
							</p>
						)}
						{selectedRace.power && (
							<p className="m-0">
								<strong>Power:</strong> {selectedRace.power.name} — {selectedRace.power.description}
							</p>
						)}
					</div>
				)}
			</div>

			{/* ---------- Exaltation ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Exaltation</h3>
				<GameSelect
					onChange={(e) => handleExaltationChange((e.target as HTMLSelectElement).value)}
					value={char.exaltation}
				>
					<option value="">— Select Exaltation —</option>
					{exaltations.map((ex: any) => (
						<option key={ex.id} value={ex.id}>
							{ex.name}
						</option>
					))}
				</GameSelect>
				{selectedExalt && (
					<div className="mt-sm space-y-xs rounded-sm border border-border bg-bg p-md text-[0.85rem] text-text-muted">
						{selectedExalt.theme && (
							<p className="m-0">
								<strong>Theme:</strong> {selectedExalt.theme}
							</p>
						)}
						{selectedExalt.staticPowers && selectedExalt.staticPowers.length > 0 && (
							<div>
								<strong>Static Powers:</strong>
								<ul className="my-xs pl-lg">
									{selectedExalt.staticPowers.map((p: any) => (
										<li className="mb-0.5" key={typeof p === "string" ? p : p.name}>
											{typeof p === "string" ? p : `${p.name}: ${p.description}`}
										</li>
									))}
								</ul>
							</div>
						)}
						{selectedExalt.resourceStat && (
							<p className="m-0">
								<strong>Resource:</strong> {selectedExalt.resourceStat.name} (max {stats.resourceMax})
							</p>
						)}
						{selectedExalt.powerStat && (
							<p className="m-0">
								<strong>Power Stat:</strong> {selectedExalt.powerStat.name}
							</p>
						)}
					</div>
				)}
			</div>

			{/* ---------- Alignment ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Alignment</h3>
				<GameSelect
					onChange={(e) =>
						updateChar((c) => {
							c.alignment = (e.target as HTMLSelectElement).value;
						})
					}
					value={char.alignment}
				>
					<option value="">— Select Alignment —</option>
					{alignments.map((a: any) => (
						<option key={a.id} value={a.id}>
							{a.name}
						</option>
					))}
				</GameSelect>
				{selectedAlign && (
					<div className="mt-sm space-y-xs rounded-sm border border-border bg-bg p-md text-[0.85rem] text-text-muted">
						{selectedAlign.description && <p className="m-0">{selectedAlign.description}</p>}
						{selectedAlign.commandments && selectedAlign.commandments.length > 0 && (
							<div>
								<strong>Commandments:</strong>
								<ul className="my-xs pl-lg">
									{selectedAlign.commandments.map((cmd: string) => (
										<li className="mb-0.5" key={cmd}>
											{cmd}
										</li>
									))}
								</ul>
							</div>
						)}
						{selectedAlign.sins && selectedAlign.sins.length > 0 && (
							<div>
								<strong>Sins:</strong>
								<table className="mt-xs w-full border-collapse text-[0.82rem]">
									<thead>
										<tr>
											<th className="border border-border bg-surface px-1.5 py-[3px] text-center font-semibold text-[0.78rem] uppercase tracking-[0.04em]">
												Level
											</th>
											<th className="border border-border bg-surface px-1.5 py-[3px] text-center font-semibold text-[0.78rem] uppercase tracking-[0.04em]">
												Sin
											</th>
										</tr>
									</thead>
									<tbody>
										{selectedAlign.sins.map((sin: any, i: number) => (
											<tr
												key={`sin-${sin.level ?? i}-${typeof sin === "string" ? sin : sin.description || sin.name}`}
											>
												<td className="border border-border px-1.5 py-[3px] text-center">
													{sin.level ?? i + 1}
												</td>
												<td className="border border-border px-1.5 py-[3px] text-center">
													{typeof sin === "string" ? sin : sin.description || sin.name}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
				<label className="mt-sm flex items-center gap-sm text-[0.85rem]">
					Devotion
					<GameInput
						className="w-[60px]"
						max={10}
						min={0}
						onInput={(e) =>
							updateChar((c) => {
								c.devotion = Number((e.target as HTMLInputElement).value);
							})
						}
						type="number"
						value={char.devotion ?? 6}
					/>
					<span className="text-[0.78rem] text-text-dim">/ 10</span>
				</label>
				{/* Devotion progress bar */}
				<div className="mt-sm">
					<div className="h-3 w-full overflow-hidden rounded-sm border border-border bg-bg">
						<div
							className="h-full bg-accent transition-all duration-300"
							style={{ width: `${((char.devotion ?? 6) / 10) * 100}%` }}
						/>
					</div>
					<div className="mt-0.5 flex justify-between px-0.5 text-[0.7rem] text-text-dim">
						<span>0</span>
						<span>5</span>
						<span>10</span>
					</div>
				</div>
			</div>

			{/* ---------- Notes ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Notes</h3>
				<label className="mb-md flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
					General Notes
					<GameTextarea
						onInput={(e) =>
							updateChar((c) => {
								c.notes = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={4}
						value={char.notes || ""}
					/>
				</label>
				<label className="mb-md flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
					Class Notes
					<GameTextarea
						onInput={(e) =>
							updateChar((c) => {
								c.classNotes = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={3}
						value={char.classNotes || ""}
					/>
				</label>
				<label className="mb-md flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
					Exaltation Notes
					<GameTextarea
						onInput={(e) =>
							updateChar((c) => {
								c.exaltationNotes = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={3}
						value={char.exaltationNotes || ""}
					/>
				</label>
			</div>
		</section>
	);
}
