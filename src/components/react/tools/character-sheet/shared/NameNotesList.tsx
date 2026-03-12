import { AddButton, SectionHeading } from "@/components/react/ui";
import type { FeatEntry } from "@/lib/dtd/types";
import { useCharSheetStore } from "../store";

interface NameNotesListProps {
	listKey: "feats" | "assets" | "hindrances";
	label: string;
	datalistId?: string;
}

export function NameNotesList({ listKey, label, datalistId }: NameNotesListProps) {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);
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
		<div>
			<SectionHeading>{label}</SectionHeading>
			{datalistId && options.length > 0 && (
				<datalist id={datalistId}>
					{options.map((n) => (
						<option key={n} value={n} />
					))}
				</datalist>
			)}
			<table className="w-full border-collapse text-[0.85rem]">
				<thead>
					<tr>
						<th className="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							Name
						</th>
						<th className="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							Notes
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{items.map((item, idx) => (
						<tr key={idx}>
							<td className="py-[3px] px-sm border-b border-border align-middle">
								<input
									type="text"
									className="w-full py-0.5 px-1 text-[0.82rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
									list={datalistId}
									value={item.name}
									onInput={(e) => handleNameChange(idx, (e.target as HTMLInputElement).value)}
								/>
							</td>
							<td className="py-[3px] px-sm border-b border-border align-middle">
								<input
									type="text"
									className="w-full py-0.5 px-1 text-[0.82rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
									value={item.notes}
									onInput={(e) => handleNotesChange(idx, (e.target as HTMLInputElement).value)}
								/>
							</td>
							<td className="py-[3px] px-sm border-b border-border align-middle text-center w-9">
								<button
									type="button"
									className="bg-transparent border-none text-error cursor-pointer text-base p-0.5 leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
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
			<AddButton label={label.replace(/s$/, "")} className="mt-sm" onClick={handleAdd} />
		</div>
	);
}
