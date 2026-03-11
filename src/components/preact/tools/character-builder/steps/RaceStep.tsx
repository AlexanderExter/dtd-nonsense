import { signal } from "@preact/signals";
import { Button } from "@/components/preact/ui";
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
		<div>
			{/* Filter bar */}
			<div class="flex items-center gap-sm flex-wrap px-md py-sm bg-surface rounded-sm mb-md">
				<label class="text-[0.85rem] text-text-dim m-0">
					Source:{" "}
					<select
						class="px-sm py-xs text-[0.85rem] max-w-[200px]"
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
			<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm mb-md">
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
						<div>
							<strong>{preview.power.name}:</strong> {preview.power.effect}
						</div>
					)}

					{preview.description && <p>{preview.description}</p>}

					{/* Characteristic bonus dropdown */}
					{preview.charBonusOptions?.length > 0 && (
						<div class="mb-md flex-1">
							<label class="block text-[0.85rem] text-text-muted mb-xs">
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

					<div class="mt-md flex gap-sm">
						<Button variant="primary" onClick={() => selectRace(preview)}>
							{currentRace === (preview.id || preview.name) ? "Selected ✓" : "Select"}
						</Button>
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
