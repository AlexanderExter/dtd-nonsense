import { useCallback } from "preact/hooks";
import { type ShipWeapon, signedNum, WEAPON_MATERIALS, WEAPON_SIZES } from "./constants";
import { ship, shipData, updateShip } from "./ShipBuilderApp";

// =========================================================================
// Weapon slot group renderer
// =========================================================================

function WeaponGroup({ position, label, count }: { position: "forward" | "rear"; label: string; count: number }) {
	const data = shipData.value;
	const currentShip = ship.value;
	if (!data || count === 0) return null;

	const handleSizeChange = useCallback(
		(idx: number, size: string) => {
			const slotKey = `${position}-${idx}`;
			updateShip((s) => {
				const partials = { ...s.weaponPartials };
				const weapons = {
					forward: [...s.weapons.forward],
					rear: [...s.weapons.rear],
				};
				if (!size) {
					weapons[position][idx] = "";
					delete partials[slotKey];
				} else {
					weapons[position][idx] = "";
					partials[slotKey] = size;
				}
				return { ...s, weapons, weaponPartials: partials };
			});
		},
		[position],
	);

	const handleMaterialChange = useCallback(
		(idx: number, material: string) => {
			const slotKey = `${position}-${idx}`;
			updateShip((s) => {
				const partials = { ...s.weaponPartials };
				const weapons = {
					forward: [...s.weapons.forward],
					rear: [...s.weapons.rear],
				};

				let size = partials[slotKey] || "";
				if (!size) {
					const currentWeapon = data?.weapons.find((w) => w.id === weapons[position][idx]);
					if (currentWeapon) size = currentWeapon.size;
				}

				if (size && material) {
					const weapon = data?.weapons.find((w) => w.size === size && w.material === material);
					weapons[position][idx] = weapon ? weapon.id : "";
					if (weapon) delete partials[slotKey];
				} else {
					weapons[position][idx] = "";
				}
				return { ...s, weapons, weaponPartials: partials };
			});
		},
		[position, data],
	);

	return (
		<div class="weapon-group">
			<h4>
				{label} Hardpoints ({count})
			</h4>
			{Array.from({ length: count }, (_, i) => {
				const slotKey = `${position}-${i}`;
				const weaponId = currentShip.weapons[position][i] || "";
				const weapon = weaponId ? data.weapons.find((w) => w.id === weaponId) : null;

				const currentSize = weapon ? weapon.size : currentShip.weaponPartials[slotKey] || "";
				const currentMaterial = weapon ? weapon.material : "";

				return (
					<div key={slotKey} class="weapon-slot">
						<div class="weapon-selectors">
							<select
								class="weapon-size-select"
								value={currentSize}
								onChange={(e) => handleSizeChange(i, (e.target as HTMLSelectElement).value)}
							>
								<option value="">— Empty —</option>
								{WEAPON_SIZES.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
							<select
								class="weapon-material-select"
								value={currentMaterial}
								disabled={!currentSize}
								onChange={(e) => handleMaterialChange(i, (e.target as HTMLSelectElement).value)}
							>
								<option value="">— Material —</option>
								{WEAPON_MATERIALS.map((m) => (
									<option key={m} value={m}>
										{m}
									</option>
								))}
							</select>
						</div>
						{weapon && <WeaponPreview weapon={weapon} />}
					</div>
				);
			})}
		</div>
	);
}

// =========================================================================
// Weapon preview
// =========================================================================

function WeaponPreview({ weapon }: { weapon: ShipWeapon }) {
	return (
		<div class="weapon-preview">
			<span>
				Dam: <strong>{weapon.damage}</strong>
			</span>
			<span>
				Dis: <strong>{weapon.disruption}</strong>
			</span>
			<span>
				Acc: <strong>{signedNum(weapon.accuracy)}</strong>
			</span>
			<span>
				Crit: <strong>{signedNum(weapon.crit)}</strong>
			</span>
			<span>
				Range: <strong>{weapon.range} VU</strong>
			</span>
			<span>
				Arc: <strong>{weapon.arc}</strong>
			</span>
			<span>
				Type: <strong>{weapon.type}</strong>
			</span>
			<span>
				Cost: <strong>{weapon.cost} BP</strong>
			</span>
		</div>
	);
}

// =========================================================================
// Main component
// =========================================================================

export function WeaponSlots() {
	const data = shipData.value;
	const currentShip = ship.value;

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);

	if (!hull) {
		return (
			<section class="build-section">
				<h2 class="section-title">Weapons</h2>
				<p class="section-hint">Select a hull first</p>
			</section>
		);
	}

	return (
		<section class="build-section">
			<h2 class="section-title">Weapons</h2>
			<WeaponGroup position="forward" label="Forward" count={hull.weapons.forward} />
			<WeaponGroup position="rear" label="Rear" count={hull.weapons.rear} />
		</section>
	);
}
