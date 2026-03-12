import { Button } from "@/components/preact/ui";
import { charSignal, derivedStats, gameData, updateChar } from "../CharacterSheetApp";

export function IdentityTab() {
	const char = charSignal.value;
	const data = gameData.value;
	const stats = derivedStats.value;

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
		<section class="tab-panel">
			{/* ---------- Identity & Core Info ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">
					Identity &amp; Core Info
				</h3>
				<div class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-md mb-md">
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Name
						<input
							type="text"
							class="w-full"
							value={char.name}
							onInput={(e) =>
								updateChar((c) => {
									c.name = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Player
						<input
							type="text"
							class="w-full"
							value={char.player}
							onInput={(e) =>
								updateChar((c) => {
									c.player = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Concept
						<input
							type="text"
							class="w-full"
							value={char.concept}
							onInput={(e) =>
								updateChar((c) => {
									c.concept = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Size
						<output class="font-bold text-[1.2rem] text-accent py-xs">{stats.size}</output>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Height
						<input
							type="text"
							class="w-full"
							value={char.height || ""}
							onInput={(e) =>
								updateChar((c) => {
									c.height = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Weight
						<input
							type="text"
							class="w-full"
							value={char.weight || ""}
							onInput={(e) =>
								updateChar((c) => {
									c.weight = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label class="flex flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Age
						<input
							type="text"
							class="w-full"
							value={char.age || ""}
							onInput={(e) =>
								updateChar((c) => {
									c.age = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
				</div>
				<label class="flex flex-col mb-md text-[0.78rem] uppercase tracking-[0.3px]">
					Description
					<textarea
						class="w-full min-h-[60px] resize-y"
						value={char.description || ""}
						onInput={(e) =>
							updateChar((c) => {
								c.description = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={3}
					/>
				</label>
				<div class="mt-md">
					<h4 class="m-0 mb-sm text-accent text-[0.85rem] uppercase tracking-[0.5px]">Languages</h4>
					<div class="flex flex-wrap gap-xs">
						{(char.languages || []).map((lang) => (
							<span
								key={lang}
								class="inline-flex items-center gap-1 px-sm py-0.5 bg-bg border border-border rounded-sm text-[0.82rem]"
							>
								{lang}
								<button
									type="button"
									class="bg-transparent border-none text-error cursor-pointer text-sm leading-none"
									onClick={() => handleRemoveLanguage(lang)}
								>
									×
								</button>
							</span>
						))}
						<Button size="sm" onClick={handleAddLanguage}>
							+ Add
						</Button>
					</div>
				</div>
			</div>

			{/* ---------- Race ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Race</h3>
				<select value={char.race} onChange={(e) => handleRaceChange((e.target as HTMLSelectElement).value)}>
					<option value="">— Select Race —</option>
					{races.map((r: any) => (
						<option key={r.id} value={r.id}>
							{r.name}
						</option>
					))}
				</select>
				{charBonusOptions.length > 0 && (
					<label class="flex items-center gap-sm mt-sm text-[0.85rem]">
						Characteristic Bonus
						<select
							value={char.raceCharBonus}
							onChange={(e) =>
								updateChar((c) => {
									c.raceCharBonus = (e.target as HTMLSelectElement).value;
								})
							}
						>
							<option value="">— Choose —</option>
							{charBonusOptions.map((opt: string) => (
								<option key={opt} value={opt}>
									{opt.charAt(0).toUpperCase() + opt.slice(1)}
								</option>
							))}
						</select>
					</label>
				)}
				{selectedRace && (
					<div class="bg-bg border border-border rounded-sm p-md mt-sm text-[0.85rem] text-text-muted space-y-xs">
						<p class="m-0">
							<strong>Size:</strong> {selectedRace.size}
						</p>
						{selectedRace.skillBonus && selectedRace.skillBonus.length > 0 && (
							<p class="m-0">
								<strong>Skill Bonuses:</strong>{" "}
								{selectedRace.skillBonus.map((sb: any) => `${sb.skill} +${sb.value}`).join(", ")}
							</p>
						)}
						{selectedRace.power && (
							<p class="m-0">
								<strong>Power:</strong> {selectedRace.power.name} — {selectedRace.power.description}
							</p>
						)}
					</div>
				)}
			</div>

			{/* ---------- Exaltation ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Exaltation</h3>
				<select
					value={char.exaltation}
					onChange={(e) => handleExaltationChange((e.target as HTMLSelectElement).value)}
				>
					<option value="">— Select Exaltation —</option>
					{exaltations.map((ex: any) => (
						<option key={ex.id} value={ex.id}>
							{ex.name}
						</option>
					))}
				</select>
				{selectedExalt && (
					<div class="bg-bg border border-border rounded-sm p-md mt-sm text-[0.85rem] text-text-muted space-y-xs">
						{selectedExalt.theme && (
							<p class="m-0">
								<strong>Theme:</strong> {selectedExalt.theme}
							</p>
						)}
						{selectedExalt.staticPowers && selectedExalt.staticPowers.length > 0 && (
							<div>
								<strong>Static Powers:</strong>
								<ul class="my-xs pl-lg">
									{selectedExalt.staticPowers.map((p: any, i: number) => (
										<li key={i} class="mb-0.5">
											{typeof p === "string" ? p : `${p.name}: ${p.description}`}
										</li>
									))}
								</ul>
							</div>
						)}
						{selectedExalt.resourceStat && (
							<p class="m-0">
								<strong>Resource:</strong> {selectedExalt.resourceStat.name} (max {stats.resourceMax})
							</p>
						)}
						{selectedExalt.powerStat && (
							<p class="m-0">
								<strong>Power Stat:</strong> {selectedExalt.powerStat.name}
							</p>
						)}
					</div>
				)}
			</div>

			{/* ---------- Alignment ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Alignment</h3>
				<select
					value={char.alignment}
					onChange={(e) =>
						updateChar((c) => {
							c.alignment = (e.target as HTMLSelectElement).value;
						})
					}
				>
					<option value="">— Select Alignment —</option>
					{alignments.map((a: any) => (
						<option key={a.id} value={a.id}>
							{a.name}
						</option>
					))}
				</select>
				{selectedAlign && (
					<div class="bg-bg border border-border rounded-sm p-md mt-sm text-[0.85rem] text-text-muted space-y-xs">
						{selectedAlign.description && <p class="m-0">{selectedAlign.description}</p>}
						{selectedAlign.commandments && selectedAlign.commandments.length > 0 && (
							<div>
								<strong>Commandments:</strong>
								<ul class="my-xs pl-lg">
									{selectedAlign.commandments.map((cmd: string, i: number) => (
										<li key={i} class="mb-0.5">
											{cmd}
										</li>
									))}
								</ul>
							</div>
						)}
						{selectedAlign.sins && selectedAlign.sins.length > 0 && (
							<div>
								<strong>Sins:</strong>
								<table class="w-full border-collapse text-[0.82rem] mt-xs">
									<thead>
										<tr>
											<th class="py-[3px] px-1.5 border border-border text-center bg-surface font-semibold text-[0.78rem] uppercase tracking-[0.04em]">
												Level
											</th>
											<th class="py-[3px] px-1.5 border border-border text-center bg-surface font-semibold text-[0.78rem] uppercase tracking-[0.04em]">
												Sin
											</th>
										</tr>
									</thead>
									<tbody>
										{selectedAlign.sins.map((sin: any, i: number) => (
											<tr key={i}>
												<td class="py-[3px] px-1.5 border border-border text-center">
													{sin.level ?? i + 1}
												</td>
												<td class="py-[3px] px-1.5 border border-border text-center">
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
				<label class="flex items-center gap-sm mt-sm text-[0.85rem]">
					Devotion
					<input
						type="number"
						value={char.devotion ?? 6}
						min={0}
						max={10}
						class="w-[60px]"
						onInput={(e) =>
							updateChar((c) => {
								c.devotion = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span class="text-text-dim text-[0.78rem]">/ 10</span>
				</label>
				{/* Devotion progress bar */}
				<div class="mt-sm">
					<div class="w-full h-3 bg-bg border border-border rounded-sm overflow-hidden">
						<div
							class="h-full bg-accent transition-all duration-300"
							style={{ width: `${((char.devotion ?? 6) / 10) * 100}%` }}
						/>
					</div>
					<div class="flex justify-between text-[0.7rem] text-text-dim mt-0.5 px-0.5">
						<span>0</span>
						<span>5</span>
						<span>10</span>
					</div>
				</div>
			</div>

			{/* ---------- Notes ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Notes</h3>
				<label class="flex flex-col mb-md text-[0.78rem] uppercase tracking-[0.3px]">
					General Notes
					<textarea
						class="w-full min-h-[60px] resize-y"
						value={char.notes || ""}
						onInput={(e) =>
							updateChar((c) => {
								c.notes = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={4}
					/>
				</label>
				<label class="flex flex-col mb-md text-[0.78rem] uppercase tracking-[0.3px]">
					Class Notes
					<textarea
						class="w-full min-h-[60px] resize-y"
						value={char.classNotes || ""}
						onInput={(e) =>
							updateChar((c) => {
								c.classNotes = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={3}
					/>
				</label>
				<label class="flex flex-col mb-md text-[0.78rem] uppercase tracking-[0.3px]">
					Exaltation Notes
					<textarea
						class="w-full min-h-[60px] resize-y"
						value={char.exaltationNotes || ""}
						onInput={(e) =>
							updateChar((c) => {
								c.exaltationNotes = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={3}
					/>
				</label>
			</div>
		</section>
	);
}
