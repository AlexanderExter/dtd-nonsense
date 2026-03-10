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
			const mark = Number.parseInt((e.target as HTMLSelectElement).value);
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
		<section class="build-section">
			<h2 class="section-title">Shields</h2>
			<div class="shield-picker">
				<div class="field-row">
					<label for="shield-type">Type</label>
					<select id="shield-type" value={currentType} onChange={handleTypeChange}>
						<option value="">— None —</option>
						{SHIELD_TYPES.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>
				<div class="field-row">
					<label for="shield-mark">Mark</label>
					<select id="shield-mark" value={currentMark} disabled={!currentType} onChange={handleMarkChange}>
						<option value="1">Mk I</option>
						<option value="2">Mk II</option>
						<option value="3">Mk III</option>
						<option value="4">Mk IV</option>
					</select>
				</div>
				<div class="shield-preview">
					{shield ? (
						<>
							<div class="shield-stat">
								<span class="label">Capacity</span>
								<span>{shield.capacity}</span>
							</div>
							<div class="shield-stat">
								<span class="label">Regeneration</span>
								<span>{shield.regeneration}/turn</span>
							</div>
							<div class="shield-stat">
								<span class="label">Cost</span>
								<span>{shield.cost} BP</span>
							</div>
							{shield.special && (
								<div class="shield-stat">
									<span class="label">Special</span>
									<span>{shield.special}</span>
								</div>
							)}
							{shield.layers != null && (
								<div class="shield-stat">
									<span class="label">Layers</span>
									<span>{shield.layers}</span>
								</div>
							)}
						</>
					) : (
						<span class="text-muted">No shield selected</span>
					)}
				</div>
			</div>
		</section>
	);
}
