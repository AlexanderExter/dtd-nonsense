import { useState } from "react";
import { AddButton } from "@/components/react/ui/AddButton";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { GameTextarea } from "@/components/react/ui/GameTextarea";
import { NumberInput } from "@/components/react/ui/NumberInput";
import type { Background, ClassEntry } from "@/lib/dtd/types";
import { BG_IDS } from "../constants";
import { NameNotesList } from "../shared/NameNotesList";
import { useCharSheetStore } from "../store";

export function FeaturesTab() {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);

	// ---------- Class helpers ----------
	const classes = data?.classes?.classes || [];
	const tracks = data?.classes?.tracks || {};
	const charClasses = char.classes || [];
	const [openTracks, setOpenTracks] = useState<Record<string, boolean>>({});

	const handleClassChange = (idx: number, classId: string) => {
		updateChar((c) => {
			if (c.classes[idx]) c.classes[idx].classId = classId;
		});
	};

	const handleClassLevelChange = (idx: number, level: number) => {
		updateChar((c) => {
			if (c.classes[idx]) c.classes[idx].level = Math.max(1, level);
		});
	};

	const handleAddClass = () => {
		updateChar((c) => {
			c.classes.push({ classId: "", level: 1 });
		});
	};

	const handleRemoveClass = (idx: number) => {
		updateChar((c) => {
			c.classes = c.classes.filter((_, i) => i !== idx);
		});
	};

	const toggleTrack = (trackId: string) => {
		setOpenTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
	};

	// Find class details from game data
	const getClassInfo = (classId: string) => {
		return classes.find((c: any) => c.id === classId);
	};

	// Add a feat from class to character's feats list
	const handleAddFeatFromClass = (featName: string) => {
		updateChar((c) => {
			if (!c.feats) c.feats = [];
			const baseName = featName.toLowerCase().split("(")[0].trim();
			const exists = c.feats.some((f) => f.name.toLowerCase().split("(")[0].trim() === baseName);
			if (exists) return;
			// Try to find notes from game data
			let autoNotes = "";
			const featList = data?.feats?.feats || data?.feats || [];
			if (Array.isArray(featList)) {
				const match = featList.find((f: any) => f.name?.toLowerCase().split("(")[0].trim() === baseName);
				if (match) autoNotes = match.effect || match.description || match.notes || "";
			}
			c.feats.push({ name: featName, notes: autoNotes });
		});
	};

	// Check if character already has a feat (base-name prefix match)
	const hasFeat = (featName: string): boolean => {
		const baseName = featName.toLowerCase().split("(")[0].trim();
		return (char.feats || []).some((f) => f.name.toLowerCase().split("(")[0].trim() === baseName);
	};

	// Set of selected class IDs for highlighting in tree
	const selectedClassIds = new Set(charClasses.map((c) => c.classId).filter(Boolean));

	// Add class from the tree browser
	const handleAddClassFromTree = (classId: string) => {
		const alreadySelected = charClasses.some((c) => c.classId === classId);
		if (alreadySelected) return;
		updateChar((c) => {
			c.classes.push({ classId, level: 1 });
		});
	};

	// ---------- Background helpers ----------
	const bgNames: Record<string, string> = {};
	for (const id of BG_IDS) {
		bgNames[id] = id.charAt(0).toUpperCase() + id.slice(1);
	}

	// Ensure backgrounds array has entries for all BG_IDS
	const backgrounds: Background[] = BG_IDS.map((id) => {
		const existing = (char.backgrounds || []).find((b) => b.id === id || b.name?.toLowerCase() === id);
		return existing || { id, name: bgNames[id], dots: 0, notes: "" };
	});

	const handleBgDotsChange = (id: string, dots: number) => {
		updateChar((c) => {
			if (!c.backgrounds) c.backgrounds = [];
			const existing = c.backgrounds.find((b) => b.id === id || b.name?.toLowerCase() === id);
			if (existing) {
				existing.dots = Math.max(0, Math.min(5, dots));
			} else {
				c.backgrounds.push({
					id,
					name: bgNames[id],
					dots: Math.max(0, Math.min(5, dots)),
					notes: "",
				});
			}
		});
	};

	const handleBgNotesChange = (id: string, notes: string) => {
		updateChar((c) => {
			if (!c.backgrounds) c.backgrounds = [];
			const existing = c.backgrounds.find((b) => b.id === id || b.name?.toLowerCase() === id);
			if (existing) {
				existing.notes = notes;
			} else {
				c.backgrounds.push({ id, name: bgNames[id], dots: 0, notes });
			}
		});
	};

	return (
		<section className="tab-panel panel-features">
			{/* ---------- Classes: Character's Classes ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">My Classes</h3>
				{charClasses.map((cls: ClassEntry, idx: number) => {
					const info = getClassInfo(cls.classId);
					return (
						<div className="mb-md" key={cls.classId || idx}>
							<div className="flex flex-wrap items-center gap-sm">
								<GameSelect
									className="min-w-[160px] flex-1"
									onChange={(e) => handleClassChange(idx, (e.target as HTMLSelectElement).value)}
									value={cls.classId}
								>
									<option value="">— Select Class —</option>
									{classes.map((c: any) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</GameSelect>
								<label
									className="flex items-center gap-1 text-[0.78rem] uppercase tracking-[0.3px]"
									htmlFor={`features-class-level-${idx}`}
								>
									Level
									<NumberInput
										id={`features-class-level-${idx}`}
										min={1}
										onChange={(v) => handleClassLevelChange(idx, v)}
										value={cls.level || 1}
									/>
								</label>
								<button
									className="cursor-pointer border-none bg-transparent p-0.5 text-base text-error leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
									onClick={() => handleRemoveClass(idx)}
									type="button"
								>
									×
								</button>
							</div>
							{info && (
								<details className="mt-sm">
									<summary className="cursor-pointer text-[0.82rem] text-text-muted hover:text-text-primary">
										Class Details
									</summary>
									<ClassDetails hasFeat={hasFeat} info={info} onAddFeat={handleAddFeatFromClass} />
								</details>
							)}
						</div>
					);
				})}
				<AddButton label="Class" onClick={handleAddClass} />
			</div>

			{/* ---------- Classes: Track Browser ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Class Browser</h3>
				<div className="space-y-xs">
					{Object.entries(tracks).map(([trackId, track]: [string, any]) => {
						const isOpen = openTracks[trackId];
						const trackClassIds: string[] = track.classes || [];
						return (
							<div className="rounded-sm border border-border bg-bg" key={trackId}>
								<button
									className="flex w-full cursor-pointer items-center gap-sm border-none bg-transparent px-md py-sm text-left font-semibold text-[0.9rem] text-text-primary hover:bg-surface"
									onClick={() => toggleTrack(trackId)}
									type="button"
								>
									<span className="text-[0.75rem] text-text-muted">{isOpen ? "▾" : "▸"}</span>
									{track.name}
									<span className="ml-auto text-[0.72rem] text-text-dim">
										{trackClassIds.length} classes
									</span>
								</button>
								{isOpen && (
									<div className="border-border border-t px-md py-sm">
										<div className="flex flex-wrap gap-1">
											{trackClassIds.map((classId: string, i: number) => {
												const info = getClassInfo(classId);
												if (!info) return null;
												const isSelected = selectedClassIds.has(classId);
												return (
													<span
														className="flex items-center text-[0.78rem] text-text-muted"
														key={classId}
													>
														{i > 0 && <span className="mr-1 text-text-dim">→</span>}
														<span className={isSelected ? "font-bold text-accent" : ""}>
															{info.name}
														</span>
														<span className="ml-0.5 text-[0.65rem] text-text-dim">
															L{info.level || i + 1}
														</span>
													</span>
												);
											})}
										</div>
										<div className="mt-sm space-y-sm">
											{trackClassIds.map((classId: string) => {
												const info = getClassInfo(classId);
												if (!info) return null;
												const isSelected = selectedClassIds.has(classId);
												return (
													<details
														className="rounded-sm border border-border bg-surface"
														key={classId}
													>
														<summary
															className={`cursor-pointer px-sm py-xs text-[0.82rem] hover:bg-surface-raised ${isSelected ? "font-semibold text-accent" : "text-text-muted"}`}
														>
															{info.name}
															{isSelected && (
																<span className="ml-1 text-[0.65rem] text-info">
																	✓ selected
																</span>
															)}
															{!isSelected && (
																<button
																	className="ml-2 cursor-pointer rounded-sm border border-border bg-transparent px-1 py-0 text-[0.65rem] text-accent hover:bg-accent/10"
																	onClick={(e) => {
																		e.preventDefault();
																		handleAddClassFromTree(classId);
																	}}
																	title="Add to my classes"
																	type="button"
																>
																	+ Add
																</button>
															)}
														</summary>
														<ClassDetails
															hasFeat={hasFeat}
															info={info}
															onAddFeat={handleAddFeatFromClass}
														/>
													</details>
												);
											})}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Feats ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<NameNotesList datalistId="dl-feat-names" label="Feats" listKey="feats" />
			</div>

			{/* ---------- Assets ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<NameNotesList datalistId="dl-asset-names" label="Assets" listKey="assets" />
			</div>

			{/* ---------- Hindrances ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<NameNotesList datalistId="dl-hindrance-names" label="Hindrances" listKey="hindrances" />
			</div>

			{/* ---------- Backgrounds ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Backgrounds</h3>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
					{backgrounds.map((bg) => {
						const id = bg.id || bg.name?.toLowerCase() || "";
						return (
							<div
								className="flex items-center gap-sm rounded-sm border border-border bg-bg px-sm py-xs"
								key={id}
							>
								<span className="min-w-[70px] font-medium text-[0.85rem]">
									{bgNames[id] || bg.name}
								</span>
								<NumberInput
									max={5}
									min={0}
									onChange={(v) => handleBgDotsChange(id, v)}
									value={bg.dots}
								/>
								<GameInput
									className="flex-1 placeholder:text-text-dim"
									onInput={(e) => handleBgNotesChange(id, (e.target as HTMLInputElement).value)}
									placeholder="Notes"
									type="text"
									value={bg.notes || ""}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Equipment ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Equipment</h3>
				<GameTextarea
					className="min-h-[120px] placeholder:text-text-dim"
					onInput={(e) =>
						updateChar((c) => {
							c.equipment = (e.target as HTMLTextAreaElement).value;
						})
					}
					placeholder="Free-form equipment list…"
					rows={6}
					value={char.equipment || ""}
				/>
			</div>
		</section>
	);
}

/** Reusable class details panel used in both "My Classes" and the Class Browser */
function ClassDetails({
	info,
	hasFeat,
	onAddFeat,
}: {
	info: any;
	hasFeat: (name: string) => boolean;
	onAddFeat: (name: string) => void;
}) {
	return (
		<div className="space-y-xs p-md text-[0.85rem] text-text-muted">
			{info.description && <p className="m-0">{info.description}</p>}
			{info.skills && info.skills.length > 0 && (
				<p className="m-0">
					<strong>Skills:</strong> {info.skills.join(", ")}
				</p>
			)}
			{info.feats && info.feats.length > 0 && (
				<div>
					<strong>Feats:</strong>
					<ul className="my-xs list-none pl-0">
						{info.feats.map((f: any) => {
							const name = typeof f === "string" ? f : f.name;
							const type = typeof f === "object" ? f.type : null;
							const already = hasFeat(name);
							return (
								<li className="mb-0.5 flex items-center gap-sm" key={name}>
									<span>
										{name}
										{type && <span className="ml-1 text-[0.65rem] text-text-dim">({type})</span>}
									</span>
									{already ? (
										<span className="text-[0.65rem] text-info">✓</span>
									) : (
										<button
											className="cursor-pointer rounded-sm border border-border bg-transparent px-1 py-0 text-[0.65rem] text-accent hover:bg-accent/10"
											onClick={() => onAddFeat(name)}
											title="Add to character feats"
											type="button"
										>
											+
										</button>
									)}
								</li>
							);
						})}
					</ul>
				</div>
			)}
			{info.completionBonus && (
				<p className="m-0">
					<strong>Completion Bonus:</strong> {info.completionBonus}
				</p>
			)}
		</div>
	);
}
