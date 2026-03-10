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
				c.backgrounds.push({ id, name: bgNames[id], dots: Math.max(0, Math.min(5, dots)), notes: "" });
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
			<div class="card">
				<h3>Classes</h3>
				{charClasses.map((cls: ClassEntry, idx: number) => {
					const info = getClassInfo(cls.classId);
					return (
						<div key={idx} class="class-entry">
							<div class="class-row">
								<select
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
								<label>
									Level
									<input
										type="number"
										value={cls.level || 1}
										min={1}
										onInput={(e) =>
											handleClassLevelChange(idx, Number((e.target as HTMLInputElement).value))
										}
									/>
								</label>
								<button type="button" class="btn-remove" onClick={() => handleRemoveClass(idx)}>
									×
								</button>
							</div>
							{info && (
								<details class="class-details">
									<summary>Class Details</summary>
									<div class="info-box">
										{info.description && <p>{info.description}</p>}
										{info.skills && info.skills.length > 0 && (
											<p>
												<strong>Skills:</strong> {info.skills.join(", ")}
											</p>
										)}
										{info.feats && info.feats.length > 0 && (
											<p>
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
			<div class="card">
				<NameNotesList listKey="feats" label="Feats" datalistId="dl-feat-names" />
			</div>

			{/* ---------- Assets ---------- */}
			<div class="card">
				<NameNotesList listKey="assets" label="Assets" />
			</div>

			{/* ---------- Hindrances ---------- */}
			<div class="card">
				<NameNotesList listKey="hindrances" label="Hindrances" />
			</div>

			{/* ---------- Backgrounds ---------- */}
			<div class="card">
				<h3>Backgrounds</h3>
				<div class="bg-grid">
					{backgrounds.map((bg) => {
						const id = bg.id || bg.name?.toLowerCase() || "";
						return (
							<div key={id} class="bg-card">
								<span class="bg-name">{bgNames[id] || bg.name}</span>
								<input
									type="number"
									class="bg-dots"
									value={bg.dots}
									min={0}
									max={5}
									onInput={(e) =>
										handleBgDotsChange(id, Number((e.target as HTMLInputElement).value))
									}
								/>
								<input
									type="text"
									class="bg-notes"
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
			<div class="card">
				<h3>Equipment</h3>
				<textarea
					class="equipment-text"
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
