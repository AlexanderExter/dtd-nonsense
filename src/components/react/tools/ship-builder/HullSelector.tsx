import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { HULL_CLASSES, type Hull, signedNum } from "./constants";
import { useShipStore } from "./store";

// =========================================================================
// Component
// =========================================================================

export function HullSelector() {
	const { shipData, ship, updateShip } = useShipStore();
	const [filterClass, setFilterClass] = useState("all");

	const selectHull = useCallback(
		(hullId: string) => {
			if (!shipData) return;
			updateShip((s) => {
				const oldHullId = s.hullId;
				s.hullId = hullId;

				if (oldHullId !== hullId) {
					s.consoles = {};
					s.weaponPartials = {};
					const hull = shipData.hulls.find((h) => h.id === hullId);
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
		[shipData, updateShip],
	);

	if (!shipData) return null;

	const data = shipData;
	const currentShip = ship;

	const filteredHulls = data.hulls.filter((h) => filterClass === "all" || h.class === filterClass);

	return (
		<section className="mb-xl">
			<h2 className="text-accent text-xl mb-md pb-xs border-b border-border">Hull Selection</h2>
			<div className="flex gap-sm mb-md flex-wrap">
				<button
					type="button"
					className={cn(
						"py-1 px-3 bg-surface border border-border rounded-sm text-text-muted cursor-pointer text-[0.85rem] transition-all duration-150 hover:border-accent-dim hover:text-text-primary",
						filterClass === "all" && "bg-accent-dim border-accent text-text-primary",
					)}
					onClick={() => {
						setFilterClass("all");
					}}
				>
					All
				</button>
				{HULL_CLASSES.map((cls) => (
					<button
						type="button"
						key={cls}
						className={cn(
							"py-1 px-3 bg-surface border border-border rounded-sm text-text-muted cursor-pointer text-[0.85rem] transition-all duration-150 hover:border-accent-dim hover:text-text-primary",
							filterClass === cls && "bg-accent-dim border-accent text-text-primary",
						)}
						onClick={() => {
							setFilterClass(cls);
						}}
					>
						{cls}
					</button>
				))}
			</div>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-md">
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
			className={cn(
				"bg-surface border-2 border-border rounded-md p-md cursor-pointer transition-all duration-150 hover:border-border-light hover:bg-surface-raised text-left",
				selected && "border-accent bg-[rgba(212,168,75,0.1)]",
			)}
			onClick={() => onSelect(hull.id)}
		>
			<div className="font-semibold mb-0.5">{hull.name}</div>
			<div className="text-[0.8rem] text-text-muted mb-sm">{hull.class}</div>
			<div className="grid grid-cols-2 gap-x-md gap-y-0.5 text-[0.8rem] text-text-muted">
				<span>
					Hull: <strong className="text-text-primary">{hull.hullStrength}</strong>
				</span>
				<span>
					Man: <strong className="text-text-primary">{signedNum(hull.maneuverability)}</strong>
				</span>
				<span>
					Speed: <strong className="text-text-primary">{hull.speed}</strong>
				</span>
				<span>
					Acc: <strong className="text-text-primary">{signedNum(hull.acceleration)}</strong>
				</span>
				<span>
					Sensors: <strong className="text-text-primary">{signedNum(hull.sensors)}</strong>
				</span>
				<span>
					Crew: <strong className="text-text-primary">{hull.crew}</strong>
				</span>
				<span>
					Consoles: <strong className="text-text-primary">{totalSlots}</strong>
				</span>
				<span>
					Weapons: <strong className="text-text-primary">{totalWeapons}</strong>
				</span>
			</div>
			<span className="inline-block mt-sm px-2 py-0.5 bg-accent-dim rounded-sm text-xs font-semibold text-text-primary">
				{hull.cost} BP
			</span>
		</button>
	);
}
