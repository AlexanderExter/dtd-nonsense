import { useState } from "react";
import { Button } from "@/components/react/ui";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";
import { useBuilderStore } from "../store";

export function RaceStep() {
	const [sourceFilter, setSourceFilter] = useState<"all" | "book1" | "book2">("all");
	const [selectedPreview, setSelectedPreview] = useState<any>(null);

	const data = useBuilderStore((s) => s.gameData);
	const char = useBuilderStore((s) => s.char);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	if (!data?.races?.races) return <p>Loading race data…</p>;

	const races = (data.races.races as any[]).filter((r: any) => {
		if (sourceFilter === "all") return true;
		if (sourceFilter === "book1") return r.source === "book1" || !r.source;
		return r.source === "book2";
	});

	const currentRace = char.race;
	const preview = selectedPreview;

	const selectRace = (race: any) => {
		updateChar((c) => {
			c.race = race.id || race.name;
			c.raceCharBonus = "";
		});
		updateMeta((m) => {
			m.stepsCompleted[1] = true;
		});
		setSelectedPreview(race);
	};

	return (
		<div>
			{/* Filter bar */}
			<div className="flex items-center gap-sm flex-wrap px-md py-sm bg-surface rounded-sm mb-md">
				<label className="text-[0.85rem] text-text-dim m-0">
					Source:{" "}
					<select
						className="px-sm py-xs text-[0.85rem] max-w-[200px]"
						value={sourceFilter}
						onChange={(e) => {
							setSourceFilter((e.target as HTMLSelectElement).value as any);
						}}
					>
						<option value="all">All</option>
						<option value="book1">Core Book</option>
						<option value="book2">Book 2</option>
					</select>
				</label>
			</div>

			{/* Selection grid */}
			<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm mb-md">
				{races.map((r: any) => (
					<SelectionCard
						key={r.id || r.name}
						title={r.name}
						subtitle={r.source === "book2" ? "Book 2" : "Core"}
						preview={r.power?.name || ""}
						selected={currentRace === (r.id || r.name)}
						onClick={() => {
							setSelectedPreview(r);
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

					{preview.languages?.length > 0 && (
						<p>
							<strong>Languages:</strong> {preview.languages.join(", ")}
						</p>
					)}

					{preview.charBonus && (
						<p>
							<strong>Characteristic Bonus:</strong> {preview.charBonus.description}
						</p>
					)}

					{preview.skillBonus?.length > 0 && (
						<p>
							<strong>Skill Bonuses:</strong>{" "}
							{preview.skillBonus
								.map((s: any) => (typeof s === "string" ? s : `${s.skill} +${s.value ?? 1}`))
								.join(", ")}
						</p>
					)}

					{preview.power && (
						<div>
							<strong>{preview.power.name}:</strong> {preview.power.description}
						</div>
					)}

					{preview.notes && <p className="text-text-muted text-[0.85rem] italic">{preview.notes}</p>}

					{/* Characteristic bonus dropdown */}
					{preview.charBonus?.options?.length > 0 && (
						<div className="mb-md flex-1">
							<label className="block text-[0.85rem] text-text-muted mb-xs">
								Choose +1 Characteristic:{" "}
								<select
									value={char.raceCharBonus || ""}
									onChange={(e) => {
										const val = (e.target as HTMLSelectElement).value;
										updateChar((c) => {
											c.raceCharBonus = val;
										});
									}}
								>
									<option value="">— Choose —</option>
									{preview.charBonus.options.map((opt: string) => (
										<option key={opt} value={opt}>
											{opt.charAt(0).toUpperCase() + opt.slice(1)}
										</option>
									))}
								</select>
							</label>
						</div>
					)}

					<div className="mt-md flex gap-sm">
						<Button variant="primary" onClick={() => selectRace(preview)}>
							{currentRace === (preview.id || preview.name) ? "Selected ✓" : "Select"}
						</Button>
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
