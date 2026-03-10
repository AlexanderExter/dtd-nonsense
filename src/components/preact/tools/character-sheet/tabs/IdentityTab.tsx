import { charSignal, derivedStats, gameData, updateChar } from "../CharacterSheetApp";

export function IdentityTab() {
	const char = charSignal.value;
	const data = gameData.value;
	const stats = derivedStats.value;

	// ---------- Race data ----------
	const races = data?.races?.races || [];
	const selectedRace = races.find((r: any) => r.id === char.race);
	const charBonusOptions: string[] = selectedRace?.charBonusOptions || [];

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
		<section class="tab-panel panel-identity">
			{/* ---------- Identity & Core Info ---------- */}
			<div class="card">
				<h3>Identity &amp; Core Info</h3>
				<div class="form-grid">
					<label>
						Name
						<input
							type="text"
							value={char.name}
							onInput={(e) =>
								updateChar((c) => {
									c.name = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label>
						Player
						<input
							type="text"
							value={char.player}
							onInput={(e) =>
								updateChar((c) => {
									c.player = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label>
						Concept
						<input
							type="text"
							value={char.concept}
							onInput={(e) =>
								updateChar((c) => {
									c.concept = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label>
						Size
						<output>{stats.size}</output>
					</label>
					<label>
						Height
						<input
							type="text"
							value={char.height || ""}
							onInput={(e) =>
								updateChar((c) => {
									c.height = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label>
						Weight
						<input
							type="text"
							value={char.weight || ""}
							onInput={(e) =>
								updateChar((c) => {
									c.weight = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
					<label>
						Age
						<input
							type="text"
							value={char.age || ""}
							onInput={(e) =>
								updateChar((c) => {
									c.age = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
				</div>
				<label class="field-block">
					Description
					<textarea
						value={char.description || ""}
						onInput={(e) =>
							updateChar((c) => {
								c.description = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={3}
					/>
				</label>
				<div class="languages-section">
					<h4>Languages</h4>
					<div class="tag-list">
						{(char.languages || []).map((lang) => (
							<span key={lang} class="tag">
								{lang}
								<button type="button" class="tag-remove" onClick={() => handleRemoveLanguage(lang)}>
									×
								</button>
							</span>
						))}
						<button type="button" class="btn btn-sm" onClick={handleAddLanguage}>
							+ Add
						</button>
					</div>
				</div>
			</div>

			{/* ---------- Race ---------- */}
			<div class="card">
				<h3>Race</h3>
				<select value={char.race} onChange={(e) => handleRaceChange((e.target as HTMLSelectElement).value)}>
					<option value="">— Select Race —</option>
					{races.map((r: any) => (
						<option key={r.id} value={r.id}>
							{r.name}
						</option>
					))}
				</select>
				{charBonusOptions.length > 0 && (
					<label class="field-inline">
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
					<div class="info-box">
						<p>
							<strong>Size:</strong> {selectedRace.size}
						</p>
						{selectedRace.statBonuses && (
							<p>
								<strong>Stat Bonuses:</strong> {JSON.stringify(selectedRace.statBonuses)}
							</p>
						)}
						{selectedRace.skillBonuses && (
							<p>
								<strong>Skill Bonuses:</strong> {JSON.stringify(selectedRace.skillBonuses)}
							</p>
						)}
						{selectedRace.power && (
							<p>
								<strong>Power:</strong> {selectedRace.power.name} — {selectedRace.power.description}
							</p>
						)}
					</div>
				)}
			</div>

			{/* ---------- Exaltation ---------- */}
			<div class="card">
				<h3>Exaltation</h3>
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
					<div class="info-box">
						{selectedExalt.theme && (
							<p>
								<strong>Theme:</strong> {selectedExalt.theme}
							</p>
						)}
						{selectedExalt.staticPowers && selectedExalt.staticPowers.length > 0 && (
							<div>
								<strong>Static Powers:</strong>
								<ul>
									{selectedExalt.staticPowers.map((p: any, i: number) => (
										<li key={i}>{typeof p === "string" ? p : `${p.name}: ${p.description}`}</li>
									))}
								</ul>
							</div>
						)}
						{selectedExalt.resourceStat && (
							<p>
								<strong>Resource:</strong> {selectedExalt.resourceStat.name} (max {stats.resourceMax})
							</p>
						)}
						{selectedExalt.powerStat && (
							<p>
								<strong>Power Stat:</strong> {selectedExalt.powerStat.name}
							</p>
						)}
					</div>
				)}
			</div>

			{/* ---------- Alignment ---------- */}
			<div class="card">
				<h3>Alignment</h3>
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
					<div class="info-box">
						{selectedAlign.description && <p>{selectedAlign.description}</p>}
						{selectedAlign.commandments && selectedAlign.commandments.length > 0 && (
							<div>
								<strong>Commandments:</strong>
								<ul>
									{selectedAlign.commandments.map((cmd: string, i: number) => (
										<li key={i}>{cmd}</li>
									))}
								</ul>
							</div>
						)}
						{selectedAlign.sins && selectedAlign.sins.length > 0 && (
							<div>
								<strong>Sins:</strong>
								<table class="sins-table">
									<thead>
										<tr>
											<th>Level</th>
											<th>Sin</th>
										</tr>
									</thead>
									<tbody>
										{selectedAlign.sins.map((sin: any, i: number) => (
											<tr key={i}>
												<td>{sin.level ?? i + 1}</td>
												<td>{typeof sin === "string" ? sin : sin.description || sin.name}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
				<label class="field-inline">
					Devotion
					<input
						type="number"
						value={char.devotion ?? 6}
						min={0}
						max={10}
						onInput={(e) =>
							updateChar((c) => {
								c.devotion = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
				</label>
			</div>

			{/* ---------- Notes ---------- */}
			<div class="card">
				<h3>Notes</h3>
				<label class="field-block">
					General Notes
					<textarea
						value={char.notes || ""}
						onInput={(e) =>
							updateChar((c) => {
								c.notes = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={4}
					/>
				</label>
				<label class="field-block">
					Class Notes
					<textarea
						value={char.classNotes || ""}
						onInput={(e) =>
							updateChar((c) => {
								c.classNotes = (e.target as HTMLTextAreaElement).value;
							})
						}
						rows={3}
					/>
				</label>
				<label class="field-block">
					Exaltation Notes
					<textarea
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
