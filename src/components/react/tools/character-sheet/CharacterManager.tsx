import { useRef } from "react";
import { Button } from "@/components/react/ui";
import {
	createNewCharacter,
	deleteCharacter,
	exportCharacter,
	importCharacter,
	loadCharacter,
	useCharSheetStore,
} from "./store";

export function CharacterManager() {
	const fileRef = useRef<HTMLInputElement>(null);
	const list = useCharSheetStore((s) => s.charList);
	const currentId = useCharSheetStore((s) => s.charId);

	const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const id = (e.target as HTMLSelectElement).value;
		if (id) loadCharacter(id);
	};

	const handleDelete = () => {
		if (list.length <= 1) return;
		if (!confirm("Delete this character? This cannot be undone.")) return;
		if (currentId) deleteCharacter(currentId);
	};

	const handleImportClick = () => {
		fileRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			importCharacter(file);
			input.value = "";
		}
	};

	return (
		<div className="flex items-center gap-sm px-md py-sm bg-surface border-b border-border sticky top-0 z-[100]">
			<select className="min-w-[200px] flex-1" value={currentId || ""} onChange={handleSwitch}>
				{list.map((c) => (
					<option key={c.id} value={c.id}>
						{c.name || "Unnamed"}
					</option>
				))}
			</select>
			<div className="flex items-center gap-xs ml-auto">
				<Button size="sm" onClick={createNewCharacter}>
					+ New
				</Button>
				<Button size="sm" variant="danger" onClick={handleDelete} disabled={list.length <= 1}>
					Delete
				</Button>
				<Button size="sm" onClick={handleImportClick}>
					Import
				</Button>
				<Button size="sm" onClick={exportCharacter}>
					Export
				</Button>
			</div>
			<input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
		</div>
	);
}
