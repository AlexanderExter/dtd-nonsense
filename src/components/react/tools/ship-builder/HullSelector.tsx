import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
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
			<h2 className="mb-md border-border border-b pb-xs text-accent text-xl">Hull Selection</h2>
			<div className="mb-md flex flex-wrap gap-sm">
				<button
					className={cn(
						"cursor-pointer rounded-sm border border-border bg-surface px-3 py-1 text-sm text-text-muted transition-all duration-150 hover:border-accent-dim hover:text-text-primary",
						filterClass === "all" && "border-accent bg-accent-dim text-text-primary",
					)}
					onClick={() => {
						setFilterClass("all");
					}}
					type="button"
				>
					All
				</button>
				{HULL_CLASSES.map((cls) => (
					<button
						className={cn(
							"cursor-pointer rounded-sm border border-border bg-surface px-3 py-1 text-sm text-text-muted transition-all duration-150 hover:border-accent-dim hover:text-text-primary",
							filterClass === cls && "border-accent bg-accent-dim text-text-primary",
						)}
						key={cls}
						onClick={() => {
							setFilterClass(cls);
						}}
						type="button"
					>
						{cls}
					</button>
				))}
			</div>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-md">
				{filteredHulls.map((hull) => (
					<HullCard
						hull={hull}
						key={hull.id}
						onSelect={selectHull}
						selected={currentShip.hullId === hull.id}
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
			className={cn(
				"cursor-pointer rounded-md border-2 border-border bg-surface p-md text-left transition-all duration-150 hover:border-border-light hover:bg-surface-raised",
				selected && "border-accent bg-accent-bg-strong",
			)}
			onClick={() => onSelect(hull.id)}
			type="button"
		>
			<div className="mb-0.5 font-semibold">{hull.name}</div>
			<div className="mb-sm text-text-muted text-xs">{hull.class}</div>
			<div className="grid grid-cols-2 gap-x-md gap-y-0.5 text-text-muted text-xs">
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
			<span className="mt-sm inline-block rounded-sm bg-accent-dim px-2 py-0.5 font-semibold text-text-primary text-xs">
				{hull.cost} BP
			</span>
		</button>
	);
}
