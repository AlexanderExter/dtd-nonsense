import { useState } from "react";
import { Button } from "@/components/react/ui";
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

	const allClasses = data.classes.classes as any[];
	const preview = selectedPreview;
	const purchasedIds = new Set((char.classes || []).map((c) => c.classId));

	// Unique tracks
	const tracks = [...new Set(allClasses.map((c: any) => c.track).filter(Boolean))];

	// Only show Tier 1 classes
	const tier1 = allClasses.filter((c: any) => c.level === 1);
	const filtered = trackFilter === "all" ? tier1 : tier1.filter((c: any) => c.track === trackFilter);

	const toggleClass = (cls: any) => {
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
			<div className="flex items-center gap-sm flex-wrap px-md py-sm bg-surface rounded-sm mb-md">
				<label className="text-[0.85rem] text-text-dim m-0">
					Track:{" "}
					<select
						className="px-sm py-xs text-[0.85rem] max-w-[200px]"
						value={trackFilter}
						onChange={(e) => {
							setTrackFilter((e.target as HTMLSelectElement).value);
						}}
					>
						<option value="all">All Tracks</option>
						{tracks.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</label>
			</div>

			{/* Purchased classes */}
			{char.classes.length > 0 && (
				<div className="flex flex-wrap gap-xs mb-md">
					{char.classes.map((entry) => {
						const cls = allClasses.find((c: any) => (c.id || c.name) === entry.classId);
						return (
							<span
								key={entry.classId}
								className="inline-flex items-center gap-1 py-[3px] px-2.5 bg-[rgba(212,168,75,0.12)] border border-accent-dim rounded-full text-[0.8rem] text-accent"
							>
								{cls?.name || entry.classId}
								<button
									type="button"
									className="cursor-pointer text-[0.9rem] text-text-dim ml-0.5 hover:text-error bg-transparent border-none p-0"
									onClick={() => toggleClass(cls || { id: entry.classId })}
									aria-label={`Remove ${cls?.name || entry.classId}`}
								>
									×
								</button>
							</span>
						);
					})}
				</div>
			)}

			<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm mb-md">
				{filtered.map((cls: any) => {
					const id = cls.id || cls.name;
					return (
						<SelectionCard
							key={id}
							title={cls.name}
							subtitle={`Tier 1 · ${cls.track || "General"}`}
							preview={cls.completionBonus?.slice(0, 60)}
							selected={purchasedIds.has(id)}
							onClick={() => {
								setSelectedPreview(cls);
							}}
						/>
					);
				})}
			</div>

			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					{preview.track && (
						<p>
							<strong>Track:</strong> {preview.track}
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
							<Button variant="danger" onClick={() => toggleClass(preview)}>
								Remove
							</Button>
						) : (
							<Button variant="primary" onClick={() => toggleClass(preview)}>
								Add {char.classes.length === 0 ? "(free)" : "(+100 XP)"}
							</Button>
						)}
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
