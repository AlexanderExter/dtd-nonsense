import { useCallback, useState } from "react";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { SHIELD_TYPES } from "./constants";
import { useShipStore } from "./store";

export function ShieldPicker() {
	const { shipData, ship, updateShip } = useShipStore();
	const [selectedType, setSelectedType] = useState("");
	const [selectedMark, setSelectedMark] = useState(1);
	const data = shipData;
	const currentShip = ship;

	// Derive current shield type/mark from ship state
	const currentShield = data?.shields.find((s) => s.id === currentShip.shieldId);
	const currentType = currentShield?.type || selectedType;
	const currentMark = currentShield?.mark || selectedMark;

	const handleTypeChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const type = (e.target as HTMLSelectElement).value;
			setSelectedType(type);
			if (type) {
				const shield = data?.shields.find((s) => s.type === type && s.mark === selectedMark);
				updateShip((s) => {
					s.shieldId = shield ? shield.id : "";
				});
			} else {
				updateShip((s) => {
					s.shieldId = "";
				});
			}
		},
		[data, selectedMark, updateShip],
	);

	const handleMarkChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const mark = Number.parseInt((e.target as HTMLSelectElement).value, 10);
			setSelectedMark(mark);
			const type = currentType;
			if (type) {
				const shield = data?.shields.find((s) => s.type === type && s.mark === mark);
				updateShip((s) => {
					s.shieldId = shield ? shield.id : "";
				});
			}
		},
		[data, currentType, updateShip],
	);

	if (!data) return null;

	const shield = currentShip.shieldId ? data.shields.find((s) => s.id === currentShip.shieldId) : null;

	return (
		<section className="mb-xl">
			<h2 className="mb-md border-border border-b pb-xs text-accent text-xl">Shields</h2>
			<div className="flex flex-wrap items-start gap-md">
				<div className="mb-sm min-w-[140px]">
					<label className="text-xs" htmlFor="shield-type">
						Type
					</label>
					<GameSelect id="shield-type" onChange={handleTypeChange} value={currentType}>
						<option value="">— None —</option>
						{SHIELD_TYPES.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</GameSelect>
				</div>
				<div className="mb-sm min-w-[140px]">
					<label className="text-xs" htmlFor="shield-mark">
						Mark
					</label>
					<GameSelect
						disabled={!currentType}
						id="shield-mark"
						onChange={handleMarkChange}
						value={currentMark}
					>
						<option value="1">Mk I</option>
						<option value="2">Mk II</option>
						<option value="3">Mk III</option>
						<option value="4">Mk IV</option>
					</GameSelect>
				</div>
				<div className="min-w-[200px] flex-1 rounded-sm border border-border bg-surface-raised p-sm text-sm">
					{shield ? (
						<>
							<div className="flex justify-between py-0.5">
								<span className="text-text-muted">Capacity</span>
								<span>{shield.capacity}</span>
							</div>
							<div className="flex justify-between py-0.5">
								<span className="text-text-muted">Regeneration</span>
								<span>{shield.regeneration}/turn</span>
							</div>
							<div className="flex justify-between py-0.5">
								<span className="text-text-muted">Cost</span>
								<span>{shield.cost} BP</span>
							</div>
							{shield.special && (
								<div className="flex justify-between py-0.5">
									<span className="text-text-muted">Special</span>
									<span>{shield.special}</span>
								</div>
							)}
							{shield.layers != null && (
								<div className="flex justify-between py-0.5">
									<span className="text-text-muted">Layers</span>
									<span>{shield.layers}</span>
								</div>
							)}
						</>
					) : (
						<span className="text-text-muted">No shield selected</span>
					)}
				</div>
			</div>
		</section>
	);
}
