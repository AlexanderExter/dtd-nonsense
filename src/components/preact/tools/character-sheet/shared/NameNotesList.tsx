import type { FeatEntry } from "@/lib/dtd/types";
import { charSignal, gameData, updateChar } from "../CharacterSheetApp";

interface NameNotesListProps {
	listKey: "feats" | "assets" | "hindrances";
	label: string;
	datalistId?: string;
}

export function NameNotesList({ listKey, label, datalistId }: NameNotesListProps) {
	const char = charSignal.value;
	const data = gameData.value;
	const items: FeatEntry[] = (char[listKey] || []) as FeatEntry[];

	// Build feat datalist options if for feats
	let options: string[] = [];
	if (datalistId && listKey === "feats" && data?.feats) {
		const featList = data.feats.feats || data.feats || [];
		if (Array.isArray(featList)) {
			options = featList.map((f: any) => f.name).filter(Boolean);
		}
	}

	const findFeatNotes = (name: string): string => {
		if (listKey !== "feats" || !data?.feats) return "";
		const featList = data.feats.feats || data.feats || [];
		if (!Array.isArray(featList)) return "";
		const match = featList.find((f: any) => f.name?.toLowerCase() === name.toLowerCase());
		return match?.effect || match?.description || match?.notes || "";
	};

	const handleNameChange = (idx: number, name: string) => {
		updateChar((c) => {
			const list = c[listKey] as FeatEntry[];
			if (list[idx]) {
				list[idx].name = name;
				// Auto-populate notes from feat data on exact match
				if (listKey === "feats") {
					const autoNotes = findFeatNotes(name);
					if (autoNotes && !list[idx].notes) {
						list[idx].notes = autoNotes;
					}
				}
			}
		});
	};

	const handleNotesChange = (idx: number, notes: string) => {
		updateChar((c) => {
			const list = c[listKey] as FeatEntry[];
			if (list[idx]) list[idx].notes = notes;
		});
	};

	const handleAdd = () => {
		updateChar((c) => {
			(c[listKey] as FeatEntry[]).push({ name: "", notes: "" });
		});
	};

	const handleRemove = (idx: number) => {
		updateChar((c) => {
			(c[listKey] as FeatEntry[]) = (c[listKey] as FeatEntry[]).filter((_, i) => i !== idx);
		});
	};

	return (
		<div class="name-notes-section">
			<h4>{label}</h4>
			{datalistId && options.length > 0 && (
				<datalist id={datalistId}>
					{options.map((n) => (
						<option key={n} value={n} />
					))}
				</datalist>
			)}
			<table class="name-notes-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Notes</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{items.map((item, idx) => (
						<tr key={idx}>
							<td>
								<input
									type="text"
									list={datalistId}
									value={item.name}
									onInput={(e) => handleNameChange(idx, (e.target as HTMLInputElement).value)}
								/>
							</td>
							<td>
								<input
									type="text"
									value={item.notes}
									onInput={(e) => handleNotesChange(idx, (e.target as HTMLInputElement).value)}
								/>
							</td>
							<td>
								<button
									type="button"
									class="btn-remove"
									onClick={() => handleRemove(idx)}
									title="Remove"
								>
									×
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<button type="button" class="btn btn-sm" onClick={handleAdd}>
				+ Add {label.replace(/s$/, "")}
			</button>
		</div>
	);
}
