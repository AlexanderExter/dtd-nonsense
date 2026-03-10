import { signal } from "@preact/signals";
import { charSignal, gameData, updateChar, updateMeta } from "../CharacterBuilderApp";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";

const sourceFilter = signal<"all" | "book1" | "book2">("all");
const selectedPreview = signal<any>(null);

export function RaceStep() {
	const data = gameData.value;
	if (!data?.races?.races) return <p>Loading race data…</p>;

	const races = (data.races.races as any[]).filter((r: any) => {
		if (sourceFilter.value === "all") return true;
		if (sourceFilter.value === "book1") return r.source === "book1" || !r.source;
		return r.source === "book2";
	});

	const currentRace = charSignal.value.race;
	const preview = selectedPreview.value;

	const selectRace = (race: any) => {
		updateChar((c) => {
			c.race = race.id || race.name;
			c.raceCharBonus = "";
		});
		updateMeta((m) => {
			m.stepsCompleted[1] = true;
		});
		selectedPreview.value = race;
	};

	return (
		<div class="step-race">
			{/* Filter bar */}
			<div class="filter-bar">
				<label>
					Source:{" "}
					<select
						value={sourceFilter.value}
						onChange={(e) => {
							sourceFilter.value = (e.target as HTMLSelectElement).value as any;
						}}
					>
						<option value="all">All</option>
						<option value="book1">Core Book</option>
						<option value="book2">Book 2</option>
					</select>
				</label>
			</div>

			{/* Selection grid */}
			<div class="selection-grid">
				{races.map((r: any) => (
					<SelectionCard
						key={r.id || r.name}
						title={r.name}
						subtitle={r.source === "book2" ? "Book 2" : "Core"}
						preview={r.power?.name || ""}
						selected={currentRace === (r.id || r.name)}
						onClick={() => {
							selectedPreview.value = r;
						}}
					/>
				))}
			</div>

			{/* Detail panel */}
			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					<p>
						<strong>Size:</strong> {preview.size}
					</p>

					{preview.statBonuses?.length > 0 && (
						<p>
							<strong>Stat Bonuses:</strong> {preview.statBonuses.join(", ")}
						</p>
					)}

					{preview.skillBonuses?.length > 0 && (
						<p>
							<strong>Skill Bonuses:</strong>{" "}
							{preview.skillBonuses
								.map((s: any) => (typeof s === "string" ? s : `${s.name} +${s.bonus ?? 1}`))
								.join(", ")}
						</p>
					)}

					{preview.power && (
						<div class="race-power">
							<strong>{preview.power.name}:</strong> {preview.power.effect}
						</div>
					)}

					{preview.description && <p>{preview.description}</p>}

					{/* Characteristic bonus dropdown */}
					{preview.charBonusOptions?.length > 0 && (
						<div class="form-group">
							<label>
								Characteristic Bonus:{" "}
								<select
									value={charSignal.value.raceCharBonus || ""}
									onChange={(e) => {
										const val = (e.target as HTMLSelectElement).value;
										updateChar((c) => {
											c.raceCharBonus = val;
										});
									}}
								>
									<option value="">— Choose —</option>
									{preview.charBonusOptions.map((opt: string) => (
										<option key={opt} value={opt}>
											{opt.charAt(0).toUpperCase() + opt.slice(1)}
										</option>
									))}
								</select>
							</label>
						</div>
					)}

					<div class="detail-actions">
						<button type="button" class="btn btn-primary" onClick={() => selectRace(preview)}>
							{currentRace === (preview.id || preview.name) ? "Selected ✓" : "Select"}
						</button>
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
