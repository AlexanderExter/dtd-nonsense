import { useCallback } from "react";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { type ShipWeapon, signedNum, WEAPON_MATERIALS, WEAPON_SIZES } from "./constants";
import { useShipStore } from "./store";

// =========================================================================
// Weapon slot group renderer
// =========================================================================

function WeaponGroup({ position, label, count }: { position: "forward" | "rear"; label: string; count: number }) {
	const { shipData, ship, updateShip } = useShipStore();
	const data = shipData;
	const currentShip = ship;

	const handleSizeChange = useCallback(
		(idx: number, size: string) => {
			const slotKey = `${position}-${idx}`;
			updateShip((s) => {
				if (!size) {
					s.weapons[position][idx] = "";
					delete s.weaponPartials[slotKey];
				} else {
					s.weapons[position][idx] = "";
					s.weaponPartials[slotKey] = size;
				}
			});
		},
		[position, updateShip],
	);

	const handleMaterialChange = useCallback(
		(idx: number, material: string) => {
			const slotKey = `${position}-${idx}`;
			updateShip((s) => {
				let size = s.weaponPartials[slotKey] || "";
				if (!size) {
					const currentWeapon = data?.weapons.find((w) => w.id === s.weapons[position][idx]);
					if (currentWeapon) size = currentWeapon.size;
				}

				if (size && material) {
					const weapon = data?.weapons.find((w) => w.size === size && w.material === material);
					s.weapons[position][idx] = weapon ? weapon.id : "";
					if (weapon) delete s.weaponPartials[slotKey];
				} else {
					s.weapons[position][idx] = "";
				}
			});
		},
		[position, data, updateShip],
	);

	if (!data || count === 0) return null;

	return (
		<div className="mb-md">
			<h4 className="mb-sm text-sm text-text-muted">
				{label} Hardpoints ({count})
			</h4>
			{Array.from({ length: count }, (_, i) => {
				const slotKey = `${position}-${i}`;
				const weaponId = currentShip.weapons[position][i] || "";
				const weapon = weaponId ? data.weapons.find((w) => w.id === weaponId) : null;

				const currentSize = weapon ? weapon.size : currentShip.weaponPartials[slotKey] || "";
				const currentMaterial = weapon ? weapon.material : "";

				return (
					<div className="mb-sm rounded-sm border border-border bg-surface-raised p-sm" key={slotKey}>
						<div className="flex flex-wrap gap-sm">
							<GameSelect
								className="min-w-[120px] flex-1"
								onChange={(e) => handleSizeChange(i, (e.target as HTMLSelectElement).value)}
								value={currentSize}
							>
								<option value="">— Empty —</option>
								{WEAPON_SIZES.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</GameSelect>
							<GameSelect
								className="min-w-[120px] flex-1"
								disabled={!currentSize}
								onChange={(e) => handleMaterialChange(i, (e.target as HTMLSelectElement).value)}
								value={currentMaterial}
							>
								<option value="">— Material —</option>
								{WEAPON_MATERIALS.map((m) => (
									<option key={m} value={m}>
										{m}
									</option>
								))}
							</GameSelect>
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
		<div className="mt-xs grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-x-sm gap-y-0.5 border-border border-t pt-xs text-text-dim text-xs">
			<span>
				Dam: <strong className="text-text-primary">{weapon.damage}</strong>
			</span>
			<span>
				Dis: <strong className="text-text-primary">{weapon.disruption}</strong>
			</span>
			<span>
				Acc: <strong className="text-text-primary">{signedNum(weapon.accuracy)}</strong>
			</span>
			<span>
				Crit: <strong className="text-text-primary">{signedNum(weapon.crit)}</strong>
			</span>
			<span>
				Range: <strong className="text-text-primary">{weapon.range} VU</strong>
			</span>
			<span>
				Arc: <strong className="text-text-primary">{weapon.arc}</strong>
			</span>
			<span>
				Type: <strong className="text-text-primary">{weapon.type}</strong>
			</span>
			<span>
				Cost: <strong className="text-text-primary">{weapon.cost} BP</strong>
			</span>
		</div>
	);
}

// =========================================================================
// Main component
// =========================================================================

export function WeaponSlots() {
	const { shipData, ship } = useShipStore();
	const data = shipData;
	const currentShip = ship;

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);

	if (!hull) {
		return (
			<section className="mb-xl">
				<h2 className="mb-md border-border border-b pb-xs text-accent text-xl">Weapons</h2>
				<p className="text-text-dim italic">Select a hull first</p>
			</section>
		);
	}

	return (
		<section className="mb-xl">
			<h2 className="mb-md border-border border-b pb-xs text-accent text-xl">Weapons</h2>
			<WeaponGroup count={hull.weapons.forward} label="Forward" position="forward" />
			<WeaponGroup count={hull.weapons.rear} label="Rear" position="rear" />
		</section>
	);
}
