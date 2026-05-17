import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameSelect } from "@/components/react/ui/GameSelect";

interface EncounterBarProps {
	encounters: Array<{ id: string; name: string }>;
	onClear: () => void;
	onExport: () => void;
	onLoad: (id: string) => void;
	onSave: () => void;
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
		<div className="sticky bottom-0 z-[90] flex items-center gap-sm border-border border-t bg-surface px-lg py-sm max-tool-md:flex-wrap max-tool-md:justify-center max-tool-md:p-sm">
			<Button onClick={onSave} size="sm" variant="primary">
				Save Encounter
			</Button>
			<GameSelect
				className="min-w-[160px] flex-none max-tool-md:min-w-[120px]"
				onChange={(e) => setSelectedId((e.target as HTMLSelectElement).value)}
				value={selectedId}
			>
				<option value="">-- Select Encounter --</option>
				{encounters.map((enc) => (
					<option key={enc.id} value={enc.id}>
						{enc.name}
					</option>
				))}
			</GameSelect>
			<Button disabled={!selectedId} onClick={handleLoad} size="sm">
				Load
			</Button>
			<Button onClick={onExport} size="sm">
				Export JSON
			</Button>
			<Button onClick={handleClear} size="sm" variant={confirmClear ? "danger" : "secondary"}>
				{confirmClear ? "Confirm Clear?" : "Clear"}
			</Button>
		</div>
	);
}
