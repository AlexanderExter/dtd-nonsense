import { AddButton } from "@/components/react/ui/AddButton";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { GameTextarea } from "@/components/react/ui/GameTextarea";
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
	const charClasses = char.classes || [];

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

	// Find class details for display
	const getClassInfo = (classId: string) => {
		return classes.find((c: any) => c.id === classId);
	};

	return (
		<section className="tab-panel panel-features">
			{/* ---------- Classes ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Classes</h3>
				{charClasses.map((cls: ClassEntry, idx: number) => {
					const info = getClassInfo(cls.classId);
					return (
						<div className="mb-md" key={cls.classId}>
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
								<label className="flex items-center gap-1 text-[0.78rem] uppercase tracking-[0.3px]">
									Level
									<GameInput
										className="w-14 text-center font-semibold text-[0.9rem]"
										min={1}
										onInput={(e) =>
											handleClassLevelChange(idx, Number((e.target as HTMLInputElement).value))
										}
										type="number"
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
									<div className="mt-xs space-y-xs rounded-sm border border-border bg-bg p-md text-[0.85rem] text-text-muted">
										{info.description && <p className="m-0">{info.description}</p>}
										{info.skills && info.skills.length > 0 && (
											<p className="m-0">
												<strong>Skills:</strong> {info.skills.join(", ")}
											</p>
										)}
										{info.feats && info.feats.length > 0 && (
											<p className="m-0">
												<strong>Feats:</strong> {info.feats.join(", ")}
											</p>
										)}
									</div>
								</details>
							)}
						</div>
					);
				})}
				<AddButton label="Class" onClick={handleAddClass} />
			</div>

			{/* ---------- Feats ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<NameNotesList datalistId="dl-feat-names" label="Feats" listKey="feats" />
			</div>

			{/* ---------- Assets ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<NameNotesList label="Assets" listKey="assets" />
			</div>

			{/* ---------- Hindrances ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<NameNotesList label="Hindrances" listKey="hindrances" />
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
								<GameInput
									className="w-11 text-center font-semibold text-[0.9rem]"
									max={5}
									min={0}
									onInput={(e) =>
										handleBgDotsChange(id, Number((e.target as HTMLInputElement).value))
									}
									type="number"
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
