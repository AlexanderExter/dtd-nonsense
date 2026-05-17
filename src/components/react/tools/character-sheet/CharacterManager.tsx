import { useRef } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameSelect } from "@/components/react/ui/GameSelect";
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
		<div className="sticky top-0 z-[100] flex items-center gap-sm border-border border-b bg-surface px-md py-sm">
			<GameSelect className="min-w-[200px] flex-1" onChange={handleSwitch} value={currentId || ""}>
				{list.map((c) => (
					<option key={c.id} value={c.id}>
						{c.name || "Unnamed"}
					</option>
				))}
			</GameSelect>
			<div className="ml-auto flex items-center gap-xs">
				<Button onClick={createNewCharacter} size="sm">
					+ New
				</Button>
				<Button disabled={list.length <= 1} onClick={handleDelete} size="sm" variant="danger">
					Delete
				</Button>
				<Button onClick={handleImportClick} size="sm">
					Import
				</Button>
				<Button onClick={exportCharacter} size="sm">
					Export
				</Button>
			</div>
			<input
				accept=".json"
				aria-label="Import character file"
				className="hidden"
				onChange={handleFileChange}
				ref={fileRef}
				type="file"
			/>
		</div>
	);
}
