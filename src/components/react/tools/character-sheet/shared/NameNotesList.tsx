import { useEffect } from "react";
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

	// Build datalist options from game data, filtered by category
	let options: string[] = [];
	const featList = data?.feats?.feats || data?.feats || [];
	if (datalistId && data?.feats && Array.isArray(featList)) {
		const categoryFilter = listKey === "assets" ? "asset" : listKey === "hindrances" ? "hindrance" : null;
		const filtered = categoryFilter ? featList.filter((f) => f.category === categoryFilter) : featList;
		options = filtered.map((f) => f.name).filter(Boolean);
	}

	// Resolve an ID or name to a display name (handles camelCase IDs from builder)
	const resolveDisplayName = (name: string): string => {
		if (!(name && Array.isArray(featList))) return name;
		// If it already matches a known display name, return as-is
		const exactMatch = featList.find((f) => f.name === name);
		if (exactMatch) return name;
		// Check if it matches an id
		const idMatch = featList.find((f) => f.id === name);
		if (idMatch) return idMatch.name;
		return name;
	};

	// Normalize stored camelCase IDs to proper display names on load
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-shot normalization when data loads
	useEffect(() => {
		if (!Array.isArray(featList) || featList.length === 0) return;
		const needsUpdate = items.some((item) => {
			if (!item.name) return false;
			const idMatch = featList.find((f) => f.id === item.name);
			return !!idMatch;
		});
		if (needsUpdate) {
			updateChar((c) => {
				const list = c[listKey] as FeatEntry[];
				for (const item of list) {
					if (!item.name) continue;
					const idMatch = featList.find((f) => f.id === item.name);
					if (idMatch) item.name = idMatch.name;
				}
			});
		}
	}, [featList.length]);

	const findItemNotes = (name: string): string => {
		if (!(data?.feats && Array.isArray(featList))) return "";
		const baseName = name.toLowerCase().split("(")[0].trim();
		const match = featList.find((f) => {
			const dataBase = f.name?.toLowerCase().split("(")[0].trim();
			return dataBase === baseName || f.id?.toLowerCase() === baseName;
		});
		return match?.effect || match?.description || match?.notes || "";
	};

	const handleNameChange = (idx: number, name: string) => {
		updateChar((c) => {
			const list = c[listKey] as FeatEntry[];
			if (list[idx]) {
				// Resolve camelCase IDs to proper names on input
				const resolved = resolveDisplayName(name);
				list[idx].name = resolved;
				// Auto-populate notes from game data on exact match
				const autoNotes = findItemNotes(resolved);
				if (autoNotes && !list[idx].notes) {
					list[idx].notes = autoNotes;
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
			<SectionHeading>
				{label} ({items.length})
			</SectionHeading>
			{datalistId && options.length > 0 && (
				<datalist id={datalistId}>
					{options.map((n) => (
						<option key={n} value={n} />
					))}
				</datalist>
			)}
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr>
						<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-text-muted text-xs uppercase tracking-wide-px">
							Name
						</th>
						<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-text-muted text-xs uppercase tracking-wide-px">
							Notes
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{items.map((item, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list items identified by position
						<tr key={`${label}-${idx}`}>
							<td className="border-border border-b px-sm py-2xs align-middle">
								<GameInput
									list={datalistId}
									onInput={(e) => handleNameChange(idx, (e.target as HTMLInputElement).value)}
									type="text"
									value={item.name}
								/>
							</td>
							<td className="border-border border-b px-sm py-2xs align-middle">
								<GameInput
									onInput={(e) => handleNotesChange(idx, (e.target as HTMLInputElement).value)}
									type="text"
									value={item.notes}
								/>
							</td>
							<td className="w-9 border-border border-b px-sm py-2xs text-center align-middle">
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
