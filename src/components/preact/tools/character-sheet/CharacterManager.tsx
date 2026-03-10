import { useRef } from "preact/hooks";
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
		<div class="char-bar">
			<select class="char-select" value={currentId || ""} onChange={handleSwitch}>
				{list.map((c) => (
					<option key={c.id} value={c.id}>
						{c.name || "Unnamed"}
					</option>
				))}
			</select>
			<button type="button" class="btn btn-sm" onClick={createNewCharacter}>
				+ New
			</button>
			<button type="button" class="btn btn-sm btn-danger" onClick={handleDelete} disabled={list.length <= 1}>
				Delete
			</button>
			<button type="button" class="btn btn-sm" onClick={handleImportClick}>
				Import
			</button>
			<button type="button" class="btn btn-sm" onClick={exportCharacter}>
				Export
			</button>
			<input ref={fileRef} type="file" accept=".json" class="hidden" onChange={handleFileChange} />
		</div>
	);
}
