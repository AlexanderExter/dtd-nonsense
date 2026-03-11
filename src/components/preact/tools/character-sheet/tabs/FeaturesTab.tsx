import type { Background, ClassEntry } from "@/lib/dtd/types";
import { charSignal, gameData, updateChar } from "../CharacterSheetApp";
import { BG_IDS } from "../constants";
import { NameNotesList } from "../shared/NameNotesList";

export function FeaturesTab() {
	const char = charSignal.value;
	const data = gameData.value;

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
		<section class="tab-panel panel-features">
			{/* ---------- Classes ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Classes</h3>
				{charClasses.map((cls: ClassEntry, idx: number) => {
					const info = getClassInfo(cls.classId);
					return (
						<div key={idx} class="mb-md">
							<div class="flex items-center gap-sm flex-wrap">
								<select
									class="flex-1 min-w-[160px] text-[0.85rem] py-0.5 px-1 bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent"
									value={cls.classId}
									onChange={(e) => handleClassChange(idx, (e.target as HTMLSelectElement).value)}
								>
									<option value="">— Select Class —</option>
									{classes.map((c: any) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</select>
								<label class="flex items-center gap-1 text-[0.78rem] uppercase tracking-[0.3px]">
									Level
									<input
										type="number"
										class="w-14 py-0.5 px-1 text-center font-semibold text-[0.9rem] bg-bg border border-border rounded-[3px] focus:border-accent"
										value={cls.level || 1}
										min={1}
										onInput={(e) =>
											handleClassLevelChange(idx, Number((e.target as HTMLInputElement).value))
										}
									/>
								</label>
								<button
									type="button"
									class="bg-transparent border-none text-error cursor-pointer text-base p-0.5 leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
									onClick={() => handleRemoveClass(idx)}
								>
									×
								</button>
							</div>
							{info && (
								<details class="mt-sm">
									<summary class="cursor-pointer text-[0.82rem] text-text-muted hover:text-text-primary">
										Class Details
									</summary>
									<div class="bg-bg border border-border rounded-sm p-md mt-xs text-[0.85rem] text-text-muted space-y-xs">
										{info.description && <p class="m-0">{info.description}</p>}
										{info.skills && info.skills.length > 0 && (
											<p class="m-0">
												<strong>Skills:</strong> {info.skills.join(", ")}
											</p>
										)}
										{info.feats && info.feats.length > 0 && (
											<p class="m-0">
												<strong>Feats:</strong> {info.feats.join(", ")}
											</p>
										)}
									</div>
								</details>
							)}
						</div>
					);
				})}
				<button type="button" class="btn btn-sm" onClick={handleAddClass}>
					+ Add Class
				</button>
			</div>

			{/* ---------- Feats ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<NameNotesList listKey="feats" label="Feats" datalistId="dl-feat-names" />
			</div>

			{/* ---------- Assets ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<NameNotesList listKey="assets" label="Assets" />
			</div>

			{/* ---------- Hindrances ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<NameNotesList listKey="hindrances" label="Hindrances" />
			</div>

			{/* ---------- Backgrounds ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Backgrounds</h3>
				<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
					{backgrounds.map((bg) => {
						const id = bg.id || bg.name?.toLowerCase() || "";
						return (
							<div
								key={id}
								class="flex items-center gap-sm px-sm py-xs bg-bg border border-border rounded-sm"
							>
								<span class="font-medium text-[0.85rem] min-w-[70px]">{bgNames[id] || bg.name}</span>
								<input
									type="number"
									class="w-11 py-0.5 px-1 text-center font-semibold text-[0.9rem] bg-bg border border-border rounded-[3px] focus:border-accent"
									value={bg.dots}
									min={0}
									max={5}
									onInput={(e) =>
										handleBgDotsChange(id, Number((e.target as HTMLInputElement).value))
									}
								/>
								<input
									type="text"
									class="flex-1 py-0.5 px-1 text-[0.82rem] bg-bg border border-border rounded-[3px] text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
									placeholder="Notes"
									value={bg.notes || ""}
									onInput={(e) => handleBgNotesChange(id, (e.target as HTMLInputElement).value)}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* ---------- Equipment ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Equipment</h3>
				<textarea
					class="w-full min-h-[120px] resize-y py-sm px-md text-[0.85rem] bg-bg border border-border rounded-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
					value={char.equipment || ""}
					onInput={(e) =>
						updateChar((c) => {
							c.equipment = (e.target as HTMLTextAreaElement).value;
						})
					}
					rows={6}
					placeholder="Free-form equipment list…"
				/>
			</div>
		</section>
	);
}
