import { Button } from "@/components/react/ui/Button";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { useState } from "react";
import { capitalize } from "../constants";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";
import { useBuilderStore } from "../store";

export function ClassesStep() {
	const [trackFilter, setTrackFilter] = useState("all");
	const [selectedPreview, setSelectedPreview] = useState<any>(null);

	const data = useBuilderStore((s) => s.gameData);
	const char = useBuilderStore((s) => s.char);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	if (!data?.classes?.classes) return <p>Loading class data…</p>;

	const allClasses = data.classes.classes;
	const trackMap = data.classes.tracks ?? {};
	const preview = selectedPreview;
	const purchasedIds = new Set((char.classes || []).map((c) => c.classId));

	const getTrackName = (key: string | null) => (key && trackMap[key]?.name) || key || "General";

	// Unique tracks
	const tracks = [...new Set(allClasses.map((c) => c.track).filter(Boolean))];

	// Only show Tier 1 classes
	const tier1 = allClasses.filter((c) => c.level === 1);
	const filtered = trackFilter === "all" ? tier1 : tier1.filter((c) => c.track === trackFilter);

	const toggleClass = (cls) => {
		const id = cls.id || cls.name;
		updateChar((c) => {
			const idx = c.classes.findIndex((e) => e.classId === id);
			if (idx >= 0) {
				c.classes.splice(idx, 1);
			} else {
				c.classes.push({ classId: id, level: 1 });
			}
		});
		updateMeta((m) => {
			m.stepsCompleted[7] = useBuilderStore.getState().char.classes.length > 0;
		});
	};

	return (
		<div>
			<div className="mb-md flex flex-wrap items-center gap-sm rounded-sm bg-surface px-md py-sm">
				<label className="m-0 text-sm text-text-dim">
					Track:{" "}
					<GameSelect
						onChange={(e) => {
							setTrackFilter((e.target as HTMLSelectElement).value);
						}}
						value={trackFilter}
					>
						<option value="all">All Tracks</option>
						{tracks.map((t) => (
							<option key={t} value={t}>
								{getTrackName(t)}
							</option>
						))}
					</GameSelect>
				</label>
			</div>

			{/* Purchased classes */}
			{char.classes.length > 0 && (
				<div className="mb-md flex flex-wrap gap-xs">
					{char.classes.map((entry) => {
						const cls = allClasses.find((c) => (c.id || c.name) === entry.classId);
						return (
							<span
								className="inline-flex items-center gap-1 rounded-full border border-accent-dim bg-accent-bg-medium px-2.5 py-2xs text-accent text-xs"
								key={entry.classId}
							>
								{cls?.name || entry.classId}
								<button
									aria-label={`Remove ${cls?.name || entry.classId}`}
									className="ml-0.5 cursor-pointer border-none bg-transparent p-0 text-sm text-text-dim hover:text-error"
									onClick={() => toggleClass(cls || { id: entry.classId })}
									type="button"
								>
									×
								</button>
							</span>
						);
					})}
				</div>
			)}

			<div className="mb-md grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
				{filtered.map((cls) => {
					const id = cls.id || cls.name;
					return (
						<SelectionCard
							key={id}
							onClick={() => {
								setSelectedPreview(cls);
							}}
							preview={cls.completionBonus?.slice(0, 60)}
							selected={purchasedIds.has(id)}
							subtitle={`Tier 1 · ${getTrackName(cls.track)}`}
							title={cls.name}
						/>
					);
				})}
			</div>

			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					{preview.track && (
						<p>
							<strong>Track:</strong> {getTrackName(preview.track)}
						</p>
					)}
					{preview.prerequisites && (
						<p>
							<strong>Prerequisites:</strong> {preview.prerequisites}
						</p>
					)}

					{preview.characteristics?.length > 0 && (
						<p>
							<strong>Characteristics:</strong>{" "}
							{preview.characteristics.map((c: string) => capitalize(c)).join(", ")}
						</p>
					)}

					{preview.skills?.length > 0 && (
						<p>
							<strong>Skills:</strong> {preview.skills.map((s: string) => capitalize(s)).join(", ")}
						</p>
					)}

					{preview.feats?.length > 0 && (
						<p>
							<strong>Feats:</strong> {preview.feats.join(", ")}
						</p>
					)}

					{(preview.swordSchools?.length > 0 ||
						preview.magicSchools?.length > 0 ||
						preview.gunKata?.length > 0) && (
						<p>
							<strong>Schools:</strong>{" "}
							{[
								...(preview.swordSchools || []),
								...(preview.magicSchools || []),
								...(preview.gunKata || []),
							].join(", ")}
						</p>
					)}

					{preview.completionBonus && (
						<p>
							<strong>Completion Bonus:</strong> {preview.completionBonus}
						</p>
					)}

					<div className="mt-md flex gap-sm">
						{purchasedIds.has(preview.id || preview.name) ? (
							<Button onClick={() => toggleClass(preview)} variant="danger">
								Remove
							</Button>
						) : (
							<Button onClick={() => toggleClass(preview)} variant="primary">
								Add {char.classes.length === 0 ? "(free)" : "(+100 XP)"}
							</Button>
						)}
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
