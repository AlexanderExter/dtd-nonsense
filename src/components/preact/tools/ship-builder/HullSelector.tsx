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
		<section class="mb-xl">
			<h2 class="text-accent text-xl mb-md pb-xs border-b border-border">Hull Selection</h2>
			<div class="flex gap-sm mb-md flex-wrap">
				<button
					type="button"
					class={[
						"py-1 px-3 bg-surface border border-border rounded-sm text-text-muted cursor-pointer text-[0.85rem] transition-all duration-150 hover:border-accent-dim hover:text-text-primary",
						filterClass.value === "all" && "bg-accent-dim border-accent text-text-primary",
					]
						.filter(Boolean)
						.join(" ")}
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
						class={[
							"py-1 px-3 bg-surface border border-border rounded-sm text-text-muted cursor-pointer text-[0.85rem] transition-all duration-150 hover:border-accent-dim hover:text-text-primary",
							filterClass.value === cls && "bg-accent-dim border-accent text-text-primary",
						]
							.filter(Boolean)
							.join(" ")}
						onClick={() => {
							filterClass.value = cls;
						}}
					>
						{cls}
					</button>
				))}
			</div>
			<div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-md">
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
		<button
			type="button"
			class={[
				"bg-surface border-2 border-border rounded-md p-md cursor-pointer transition-all duration-150 hover:border-border-light hover:bg-surface-raised text-left",
				selected && "border-accent bg-[rgba(212,168,75,0.1)]",
			]
				.filter(Boolean)
				.join(" ")}
			onClick={() => onSelect(hull.id)}
		>
			<div class="font-semibold mb-0.5">{hull.name}</div>
			<div class="text-[0.8rem] text-text-muted mb-sm">{hull.class}</div>
			<div class="grid grid-cols-2 gap-x-md gap-y-0.5 text-[0.8rem] text-text-muted">
				<span>
					Hull: <strong class="text-text-primary">{hull.hullStrength}</strong>
				</span>
				<span>
					Man: <strong class="text-text-primary">{signedNum(hull.maneuverability)}</strong>
				</span>
				<span>
					Speed: <strong class="text-text-primary">{hull.speed}</strong>
				</span>
				<span>
					Acc: <strong class="text-text-primary">{signedNum(hull.acceleration)}</strong>
				</span>
				<span>
					Sensors: <strong class="text-text-primary">{signedNum(hull.sensors)}</strong>
				</span>
				<span>
					Crew: <strong class="text-text-primary">{hull.crew}</strong>
				</span>
				<span>
					Consoles: <strong class="text-text-primary">{totalSlots}</strong>
				</span>
				<span>
					Weapons: <strong class="text-text-primary">{totalWeapons}</strong>
				</span>
			</div>
			<span class="inline-block mt-sm px-2 py-0.5 bg-accent-dim rounded-sm text-xs font-semibold text-text-primary">
				{hull.cost} BP
			</span>
		</button>
	);
}
