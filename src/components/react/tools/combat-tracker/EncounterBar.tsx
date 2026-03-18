import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameSelect } from "@/components/react/ui/GameSelect";

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
		<div className="sticky bottom-0 z-[90] flex items-center gap-sm px-lg py-sm bg-surface border-t border-border max-[768px]:flex-wrap max-[768px]:justify-center max-[768px]:p-sm">
			<Button variant="primary" size="sm" onClick={onSave}>
				Save Encounter
			</Button>
			<GameSelect
				className="flex-none min-w-[160px] max-[768px]:min-w-[120px]"
				value={selectedId}
				onChange={(e) => setSelectedId((e.target as HTMLSelectElement).value)}
			>
				<option value="">-- Select Encounter --</option>
				{encounters.map((enc) => (
					<option key={enc.id} value={enc.id}>
						{enc.name}
					</option>
				))}
			</GameSelect>
			<Button size="sm" onClick={handleLoad} disabled={!selectedId}>
				Load
			</Button>
			<Button size="sm" onClick={onExport}>
				Export JSON
			</Button>
			<Button variant={confirmClear ? "danger" : "secondary"} size="sm" onClick={handleClear}>
				{confirmClear ? "Confirm Clear?" : "Clear"}
			</Button>
		</div>
	);
}
