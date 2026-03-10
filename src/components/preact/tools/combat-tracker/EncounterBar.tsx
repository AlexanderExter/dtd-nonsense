import { useState } from "preact/hooks";

interface EncounterBarProps {
	encounters: Array<{ id: string; name: string }>;
	onSave: () => void;
	onLoad: (id: string) => void;
	onExport: () => void;
	onClear: () => void;
}

export function EncounterBar({ encounters, onSave, onLoad, onExport, onClear }: EncounterBarProps) {
	const [selectedId, setSelectedId] = useState("");
	const [confirmClear, setConfirmClear] = useState(false);

	const handleLoad = () => {
		if (selectedId) onLoad(selectedId);
	};

	const handleClear = () => {
		if (confirmClear) {
			onClear();
			setConfirmClear(false);
		} else {
			setConfirmClear(true);
			setTimeout(() => setConfirmClear(false), 3000);
		}
	};

	return (
		<div class="encounter-bar">
			<button type="button" class="btn btn-primary btn-sm" onClick={onSave}>
				Save Encounter
			</button>
			<select
				class="encounter-select"
				value={selectedId}
				onChange={(e) => setSelectedId((e.target as HTMLSelectElement).value)}
			>
				<option value="">-- Select Encounter --</option>
				{encounters.map((enc) => (
					<option key={enc.id} value={enc.id}>
						{enc.name}
					</option>
				))}
			</select>
			<button type="button" class="btn btn-secondary btn-sm" onClick={handleLoad} disabled={!selectedId}>
				Load
			</button>
			<button type="button" class="btn btn-secondary btn-sm" onClick={onExport}>
				Export JSON
			</button>
			<button
				type="button"
				class={`btn btn-sm ${confirmClear ? "btn-danger" : "btn-secondary"}`}
				onClick={handleClear}
			>
				{confirmClear ? "Confirm Clear?" : "Clear"}
			</button>
		</div>
	);
}
