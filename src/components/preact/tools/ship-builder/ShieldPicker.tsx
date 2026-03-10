import { signal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import { SHIELD_TYPES } from "./constants";
import { ship, shipData, updateShip } from "./ShipBuilderApp";

// =========================================================================
// Local state for partial selection
// =========================================================================

const selectedType = signal("");
const selectedMark = signal(1);

export function ShieldPicker() {
	const data = shipData.value;
	const currentShip = ship.value;

	if (!data) return null;

	// Derive current shield type/mark from ship state
	const currentShield = data.shields.find((s) => s.id === currentShip.shieldId);
	const currentType = currentShield?.type || selectedType.value;
	const currentMark = currentShield?.mark || selectedMark.value;

	const handleTypeChange = useCallback(
		(e: Event) => {
			const type = (e.target as HTMLSelectElement).value;
			selectedType.value = type;
			if (type) {
				const shield = data?.shields.find((s) => s.type === type && s.mark === selectedMark.value);
				updateShip((s) => ({
					...s,
					shieldId: shield ? shield.id : "",
				}));
			} else {
				updateShip((s) => ({ ...s, shieldId: "" }));
			}
		},
		[data],
	);

	const handleMarkChange = useCallback(
		(e: Event) => {
			const mark = Number.parseInt((e.target as HTMLSelectElement).value, 10);
			selectedMark.value = mark;
			const type = currentType;
			if (type) {
				const shield = data?.shields.find((s) => s.type === type && s.mark === mark);
				updateShip((s) => ({
					...s,
					shieldId: shield ? shield.id : "",
				}));
			}
		},
		[data, currentType],
	);

	const shield = currentShip.shieldId ? data.shields.find((s) => s.id === currentShip.shieldId) : null;

	return (
		<section class="mb-xl">
			<h2 class="text-accent text-xl mb-md pb-xs border-b border-border">Shields</h2>
			<div class="flex flex-wrap gap-md items-start">
				<div class="mb-sm min-w-[140px]">
					<label for="shield-type" class="text-[0.8rem]">
						Type
					</label>
					<select id="shield-type" value={currentType} onChange={handleTypeChange}>
						<option value="">— None —</option>
						{SHIELD_TYPES.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>
				<div class="mb-sm min-w-[140px]">
					<label for="shield-mark" class="text-[0.8rem]">
						Mark
					</label>
					<select id="shield-mark" value={currentMark} disabled={!currentType} onChange={handleMarkChange}>
						<option value="1">Mk I</option>
						<option value="2">Mk II</option>
						<option value="3">Mk III</option>
						<option value="4">Mk IV</option>
					</select>
				</div>
				<div class="flex-1 min-w-[200px] p-sm bg-surface-raised border border-border rounded-sm text-[0.85rem]">
					{shield ? (
						<>
							<div class="flex justify-between py-0.5">
								<span class="text-text-muted">Capacity</span>
								<span>{shield.capacity}</span>
							</div>
							<div class="flex justify-between py-0.5">
								<span class="text-text-muted">Regeneration</span>
								<span>{shield.regeneration}/turn</span>
							</div>
							<div class="flex justify-between py-0.5">
								<span class="text-text-muted">Cost</span>
								<span>{shield.cost} BP</span>
							</div>
							{shield.special && (
								<div class="flex justify-between py-0.5">
									<span class="text-text-muted">Special</span>
									<span>{shield.special}</span>
								</div>
							)}
							{shield.layers != null && (
								<div class="flex justify-between py-0.5">
									<span class="text-text-muted">Layers</span>
									<span>{shield.layers}</span>
								</div>
							)}
						</>
					) : (
						<span class="text-text-muted">No shield selected</span>
					)}
				</div>
			</div>
		</section>
	);
}
