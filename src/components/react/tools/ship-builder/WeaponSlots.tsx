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
		[position, updateShip],
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
		[position, data, updateShip],
	);

	if (!data || count === 0) return null;

	return (
		<div className="mb-md">
			<h4 className="text-[0.9rem] mb-sm text-text-muted">
				{label} Hardpoints ({count})
			</h4>
			{Array.from({ length: count }, (_, i) => {
				const slotKey = `${position}-${i}`;
				const weaponId = currentShip.weapons[position][i] || "";
				const weapon = weaponId ? data.weapons.find((w) => w.id === weaponId) : null;

				const currentSize = weapon ? weapon.size : currentShip.weaponPartials[slotKey] || "";
				const currentMaterial = weapon ? weapon.material : "";

				return (
					<div key={slotKey} className="bg-surface-raised border border-border rounded-sm p-sm mb-sm">
						<div className="flex gap-sm flex-wrap">
							<GameSelect
								className="flex-1 min-w-[120px]"
								value={currentSize}
								onChange={(e) => handleSizeChange(i, (e.target as HTMLSelectElement).value)}
							>
								<option value="">— Empty —</option>
								{WEAPON_SIZES.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</GameSelect>
							<GameSelect
								className="flex-1 min-w-[120px]"
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
		<div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-x-sm gap-y-0.5 text-xs text-text-dim mt-xs pt-xs border-t border-border">
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
				<h2 className="text-accent text-xl mb-md pb-xs border-b border-border">Weapons</h2>
				<p className="text-text-dim italic">Select a hull first</p>
			</section>
		);
	}

	return (
		<section className="mb-xl">
			<h2 className="text-accent text-xl mb-md pb-xs border-b border-border">Weapons</h2>
			<WeaponGroup position="forward" label="Forward" count={hull.weapons.forward} />
			<WeaponGroup position="rear" label="Rear" count={hull.weapons.rear} />
		</section>
	);
}
