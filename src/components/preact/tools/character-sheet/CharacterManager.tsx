import { useRef } from "preact/hooks";
import { Button } from "@/components/preact/ui";
import {
	charIdSignal,
	charListSignal,
	createNewCharacter,
	deleteCharacter,
	exportCharacter,
	importCharacter,
	loadCharacter,
} from "./CharacterSheetApp";

export function CharacterManager() {
	const fileRef = useRef<HTMLInputElement>(null);
	const list = charListSignal.value;
	const currentId = charIdSignal.value;

	const handleSwitch = (e: Event) => {
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

	const handleFileChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			importCharacter(file);
			input.value = "";
		}
	};

	return (
		<div class="flex items-center gap-sm px-md py-sm bg-surface border-b border-border sticky top-0 z-[100]">
			<select class="min-w-[200px] flex-1" value={currentId || ""} onChange={handleSwitch}>
				{list.map((c) => (
					<option key={c.id} value={c.id}>
						{c.name || "Unnamed"}
					</option>
				))}
			</select>
			<div class="flex items-center gap-xs ml-auto">
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
			<input ref={fileRef} type="file" accept=".json" class="hidden" onChange={handleFileChange} />
		</div>
	);
}
