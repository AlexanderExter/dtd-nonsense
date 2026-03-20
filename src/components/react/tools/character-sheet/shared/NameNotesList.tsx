import { AddButton } from "@/components/react/ui/AddButton";
import { GameInput } from "@/components/react/ui/GameInput";
import { SectionHeading } from "@/components/react/ui/SectionHeading";
import type { FeatEntry } from "@/lib/dtd/types";
import { useCharSheetStore } from "../store";

interface NameNotesListProps {
	datalistId?: string;
	label: string;
	listKey: "feats" | "assets" | "hindrances";
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
						<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
							Name
						</th>
						<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
							Notes
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{items.map((item, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list items identified by position
						<tr key={`${label}-${idx}`}>
							<td className="border-border border-b px-sm py-[3px] align-middle">
								<GameInput
									list={datalistId}
									onInput={(e) => handleNameChange(idx, (e.target as HTMLInputElement).value)}
									type="text"
									value={item.name}
								/>
							</td>
							<td className="border-border border-b px-sm py-[3px] align-middle">
								<GameInput
									onInput={(e) => handleNotesChange(idx, (e.target as HTMLInputElement).value)}
									type="text"
									value={item.notes}
								/>
							</td>
							<td className="w-9 border-border border-b px-sm py-[3px] text-center align-middle">
								<button
									className="cursor-pointer border-none bg-transparent p-0.5 text-base text-error leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
									onClick={() => handleRemove(idx)}
									title="Remove"
									type="button"
								>
									×
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<AddButton className="mt-sm" label={label.replace(/s$/, "")} onClick={handleAdd} />
		</div>
	);
}
