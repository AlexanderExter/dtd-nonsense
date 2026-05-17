import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { CombatSidebar } from "./CombatSidebar";
import { getInstalledConsoleIds, getShipStats, OFFICER_POSITIONS, signedNum } from "./constants";
import { useShipStore } from "./store";

export function SheetPanel() {
	const { shipData, ship, updateShip } = useShipStore();
	const data = shipData;
	const currentShip = ship;

	const toggleConsole = useCallback(
		(consoleId: string) => {
			updateShip((s) => {
				const wasActive = s.combat.consoleStatus[consoleId] !== false;
				s.combat.consoleStatus[consoleId] = !wasActive;
			});
		},
		[updateShip],
	);

	const toggleWeapon = useCallback(
		(slotKey: string) => {
			updateShip((s) => {
				const wasActive = s.combat.weaponStatus[slotKey] !== false;
				s.combat.weaponStatus[slotKey] = !wasActive;
			});
		},
		[updateShip],
	);

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);
	if (!hull) {
		return (
			<div className="grid min-h-[calc(100vh-50px)] grid-cols-[1fr_340px] gap-0 max-tool-lg:grid-cols-1">
				<div className="overflow-y-auto p-lg">
					<p className="text-text-muted">No hull selected. Go back to Builder.</p>
				</div>
			</div>
		);
	}

	const stats = getShipStats(currentShip, hull);
	const installedConsoles = getInstalledConsoleIds(currentShip);

	// -----------------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------------

	return (
		<div className="grid min-h-[calc(100vh-50px)] grid-cols-[1fr_340px] gap-0 max-tool-lg:grid-cols-1">
			<div className="overflow-y-auto p-lg">
				{/* Header */}
				<header className="mb-lg">
					<h1 className="mb-xs text-accent">{currentShip.name || "Unnamed Ship"}</h1>
					<span className="text-text-muted">
						{hull.name} — {hull.class}
					</span>
				</header>

				{/* Stats */}
				<section className="mb-xl">
					<h3 className="mb-md border-border border-b pb-xs text-accent">Ship Statistics</h3>
					<table className="w-full max-w-[500px]">
						<tbody>
							<tr>
								<td className="w-[160px] text-text-muted">Hull Class</td>
								<td className="font-semibold">{hull.class}</td>
							</tr>
							<tr>
								<td className="w-[160px] text-text-muted">Hull Strength</td>
								<td className="font-semibold">{stats.hullHP}</td>
							</tr>
							<tr>
								<td className="w-[160px] text-text-muted">Maneuverability</td>
								<td className="font-semibold">{signedNum(stats.man)}</td>
							</tr>
							<tr>
								<td className="w-[160px] text-text-muted">Acceleration</td>
								<td className="font-semibold">{signedNum(stats.acc)}</td>
							</tr>
							<tr>
								<td className="w-[160px] text-text-muted">Speed</td>
								<td className="font-semibold">{stats.speed} VU</td>
							</tr>
							<tr>
								<td className="w-[160px] text-text-muted">Sensors</td>
								<td className="font-semibold">{signedNum(stats.sensors)}</td>
							</tr>
							<tr>
								<td className="w-[160px] text-text-muted">Crew Quality</td>
								<td className="font-semibold">{stats.cq}</td>
							</tr>
							<tr>
								<td className="w-[160px] text-text-muted">Crew Size</td>
								<td className="font-semibold">{stats.crew}</td>
							</tr>
							<tr>
								<td className="w-[160px] text-text-muted">TN to Hit</td>
								<td className="font-semibold">{stats.tn}</td>
							</tr>
						</tbody>
					</table>
				</section>

				{/* Consoles */}
				<section className="mb-xl">
					<h3 className="mb-md border-border border-b pb-xs text-accent">Consoles</h3>
					<div>
						{installedConsoles.length === 0 ? (
							<span className="text-text-muted">No consoles installed</span>
						) : (
							installedConsoles.map((cid) => {
								const c = data.consoles.find((x) => x.id === cid);
								if (!c) return null;
								const active = currentShip.combat.consoleStatus[cid] !== false;
								const badgeColors: Record<string, string> = {
									arcana: "bg-console-arcana",
									command: "bg-console-command",
									engineering: "bg-console-engineering",
									tactical: "bg-console-tactical",
									universal: "bg-console-universal",
								};
								return (
									<div
										className={cn(
											"mb-xs flex items-center justify-between rounded-sm border border-border bg-surface px-md py-sm transition-opacity duration-150",
											!active && "border-error opacity-40",
										)}
										key={cid}
									>
										<div className="flex-1">
											<div className="font-semibold text-sm">
												{c.name}{" "}
												<span
													className={`inline-block rounded-[4px] text-center font-bold text-bg ${badgeColors[c.type] || ""}`}
													style={{
														fontSize: "0.6rem",
														width: 14,
														height: 14,
														lineHeight: "14px",
													}}
												>
													{c.type.charAt(0).toUpperCase()}
												</span>
											</div>
											<div className="text-text-muted text-xs">{c.effect}</div>
										</div>
										<button
											className={cn(
												"cursor-pointer rounded-sm border border-border bg-transparent px-2 py-1 font-semibold text-success text-xs",
												!active && "text-error",
											)}
											onClick={() => toggleConsole(cid)}
											type="button"
										>
											{active ? "Active" : "Disabled"}
										</button>
									</div>
								);
							})
						)}
					</div>
				</section>

				{/* Weapons */}
				<section className="mb-xl">
					<h3 className="mb-md border-border border-b pb-xs text-accent">Weapons</h3>
					<div>{renderWeapons(currentShip, data, toggleWeapon)}</div>
				</section>

				{/* Torpedoes */}
				{currentShip.hasTorpedoTube && (
					<section className="mb-xl">
						<h3 className="mb-md border-border border-b pb-xs text-accent">Torpedoes</h3>
						<div>{renderTorpedoes(currentShip, data)}</div>
					</section>
				)}

				{/* Officers */}
				<section className="mb-xl">
					<h3 className="mb-md border-border border-b pb-xs text-accent">Bridge Officers</h3>
					<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
						{OFFICER_POSITIONS.map((pos) => {
							const off = currentShip.officers[pos.id] || {
								name: "",
								skill: 0,
							};
							return (
								<div className="rounded-sm border border-border bg-surface px-md py-sm" key={pos.id}>
									<div className="text-accent text-xs uppercase tracking-wide-px">{pos.title}</div>
									<div className="font-semibold">{off.name || "—"}</div>
									<div className="text-text-muted text-xs">
										{pos.skill}: {off.skill || 0}
									</div>
								</div>
							);
						})}
					</div>
				</section>
			</div>

			<CombatSidebar />
		</div>
	);
}

// =========================================================================
// Weapon list helper
// =========================================================================

function renderWeapons(
	currentShip: import("./constants").ShipState,
	data: import("./constants").ShipData,
	toggleWeapon: (slotKey: string) => void,
) {
	const items: React.JSX.Element[] = [];

	for (const pos of ["forward", "rear"] as const) {
		const weaponArr = currentShip.weapons[pos] || [];
		for (let i = 0; i < weaponArr.length; i++) {
			const wid = weaponArr[i];
			if (!wid) continue;
			const w = data.weapons.find((x) => x.id === wid);
			if (!w) continue;
			const slotKey = `${pos}-${i}`;
			const active = currentShip.combat.weaponStatus[slotKey] !== false;
			items.push(
				<div
					className={cn(
						"mb-xs flex items-center justify-between rounded-sm border border-border bg-surface px-md py-sm transition-opacity duration-150",
						!active && "border-error opacity-40",
					)}
					key={slotKey}
				>
					<div className="flex-1">
						<div className="font-semibold text-sm">
							{w.name} <span className="text-text-muted">({pos})</span>
						</div>
						<div className="text-text-muted text-xs">
							Dam: {w.damage} | Dis: {w.disruption} | Acc: {signedNum(w.accuracy)} | Crit:{" "}
							{signedNum(w.crit)} | Range: {w.range} VU | Arc: {w.arc} | {w.type}
						</div>
					</div>
					<button
						className={cn(
							"cursor-pointer rounded-sm border border-border bg-transparent px-2 py-1 font-semibold text-success text-xs",
							!active && "text-error",
						)}
						onClick={() => toggleWeapon(slotKey)}
						type="button"
					>
						{active ? "Active" : "Offline"}
					</button>
				</div>,
			);
		}
	}

	if (items.length === 0) {
		return <span className="text-text-muted">No weapons installed</span>;
	}
	return items;
}

// =========================================================================
// Torpedo list helper
// =========================================================================

function renderTorpedoes(currentShip: import("./constants").ShipState, data: import("./constants").ShipData) {
	const loaded = (currentShip.torpedoes || []).filter(Boolean);
	if (loaded.length === 0) {
		return <span className="text-text-muted">Tube installed, no torpedoes loaded</span>;
	}

	return loaded.map((tid) => {
		const t = data.torpedoes.find((x) => x.id === tid);
		if (!t) return null;
		return (
			<div
				className="mb-xs flex items-center justify-between rounded-sm border border-border bg-surface px-md py-sm transition-opacity duration-150"
				key={tid}
			>
				<div className="flex-1">
					<div className="font-semibold text-sm">{t.name}</div>
					<div className="text-text-muted text-xs">
						Dam: {t.damage} | Dis: {t.disruption} | Acc: +{t.accuracy} | Crit: +{t.crit} | Range: {t.range}{" "}
						VU | Arc: {t.arc}
					</div>
					{t.effect && <div className="text-text-muted text-xs">{t.effect}</div>}
				</div>
			</div>
		);
	});
}
