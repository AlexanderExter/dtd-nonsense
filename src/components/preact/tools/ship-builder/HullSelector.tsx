import { signal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import { HULL_CLASSES, type Hull, signedNum } from "./constants";
import { ship, shipData, updateShip } from "./ShipBuilderApp";

// =========================================================================
// Local state
// =========================================================================

const filterClass = signal("all");

// =========================================================================
// Component
// =========================================================================

export function HullSelector() {
	const data = shipData.value;
	if (!data) return null;

	const currentShip = ship.value;

	const selectHull = useCallback(
		(hullId: string) => {
			updateShip((s) => {
				const oldHullId = s.hullId;
				s.hullId = hullId;

				if (oldHullId !== hullId) {
					s.consoles = {};
					s.weaponPartials = {};
					const hull = data?.hulls.find((h) => h.id === hullId);
					if (hull) {
						s.weapons = {
							forward: new Array(hull.weapons.forward).fill(""),
							rear: new Array(hull.weapons.rear).fill(""),
						};
					} else {
						s.weapons = { forward: [], rear: [] };
					}
				}
				return s;
			});
		},
		[data],
	);

	const filteredHulls = data.hulls.filter((h) => filterClass.value === "all" || h.class === filterClass.value);

	return (
		<section class="build-section">
			<h2 class="section-title">Hull Selection</h2>
			<div class="hull-filters">
				<button
					type="button"
					class={`filter-btn ${filterClass.value === "all" ? "active" : ""}`}
					onClick={() => {
						filterClass.value = "all";
					}}
				>
					All
				</button>
				{HULL_CLASSES.map((cls) => (
					<button
						type="button"
						key={cls}
						class={`filter-btn ${filterClass.value === cls ? "active" : ""}`}
						onClick={() => {
							filterClass.value = cls;
						}}
					>
						{cls}
					</button>
				))}
			</div>
			<div class="hull-grid">
				{filteredHulls.map((hull) => (
					<HullCard
						key={hull.id}
						hull={hull}
						selected={currentShip.hullId === hull.id}
						onSelect={selectHull}
					/>
				))}
			</div>
		</section>
	);
}

// =========================================================================
// Hull card sub-component
// =========================================================================

function HullCard({ hull, selected, onSelect }: { hull: Hull; selected: boolean; onSelect: (id: string) => void }) {
	const totalSlots = Object.values(hull.consoles).reduce((a, b) => a + b, 0);
	const totalWeapons = hull.weapons.forward + hull.weapons.rear;

	return (
		<button type="button" class={`hull-card ${selected ? "selected" : ""}`} onClick={() => onSelect(hull.id)}>
			<div class="hull-name">{hull.name}</div>
			<div class="hull-class">{hull.class}</div>
			<div class="hull-stats">
				<span>
					Hull: <strong>{hull.hullStrength}</strong>
				</span>
				<span>
					Man: <strong>{signedNum(hull.maneuverability)}</strong>
				</span>
				<span>
					Speed: <strong>{hull.speed}</strong>
				</span>
				<span>
					Acc: <strong>{signedNum(hull.acceleration)}</strong>
				</span>
				<span>
					Sensors: <strong>{signedNum(hull.sensors)}</strong>
				</span>
				<span>
					Crew: <strong>{hull.crew}</strong>
				</span>
				<span>
					Consoles: <strong>{totalSlots}</strong>
				</span>
				<span>
					Weapons: <strong>{totalWeapons}</strong>
				</span>
			</div>
			<span class="hull-cost">{hull.cost} BP</span>
		</button>
	);
}
