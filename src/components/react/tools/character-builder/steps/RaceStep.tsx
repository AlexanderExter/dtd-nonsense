import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameSelect } from "@/components/react/ui/GameSelect";
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
			<div className="mb-md flex flex-wrap items-center gap-sm rounded-sm bg-surface px-md py-sm">
				<label className="m-0 text-[0.85rem] text-text-dim">
					Source:{" "}
					<GameSelect
						onChange={(e) => {
							setSourceFilter((e.target as HTMLSelectElement).value as any);
						}}
						value={sourceFilter}
					>
						<option value="all">All</option>
						<option value="book1">Core Book</option>
						<option value="book2">Book 2</option>
					</GameSelect>
				</label>
			</div>

			{/* Selection grid */}
			<div className="mb-md grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
				{races.map((r: any) => (
					<SelectionCard
						key={r.id || r.name}
						onClick={() => {
							setSelectedPreview(r);
						}}
						preview={r.power?.name || ""}
						selected={currentRace === (r.id || r.name)}
						subtitle={r.source === "book2" ? "Book 2" : "Core"}
						title={r.name}
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

					{preview.notes && <p className="text-[0.85rem] text-text-muted italic">{preview.notes}</p>}

					{/* Characteristic bonus dropdown */}
					{preview.charBonus?.options?.length > 0 && (
						<div className="mb-md flex-1">
							<label className="mb-xs block text-[0.85rem] text-text-muted">
								Choose +1 Characteristic:{" "}
								<GameSelect
									onChange={(e) => {
										const val = (e.target as HTMLSelectElement).value;
										updateChar((c) => {
											c.raceCharBonus = val;
										});
									}}
									value={char.raceCharBonus || ""}
								>
									<option value="">— Choose —</option>
									{preview.charBonus.options.map((opt: string) => (
										<option key={opt} value={opt}>
											{opt.charAt(0).toUpperCase() + opt.slice(1)}
										</option>
									))}
								</GameSelect>
							</label>
						</div>
					)}

					<div className="mt-md flex gap-sm">
						<Button onClick={() => selectRace(preview)} variant="primary">
							{currentRace === (preview.id || preview.name) ? "Selected ✓" : "Select"}
						</Button>
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
