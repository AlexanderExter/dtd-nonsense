import { useCallback } from "preact/hooks";
import { CombatSidebar } from "./CombatSidebar";
import { getInstalledConsoleIds, getShipStats, OFFICER_POSITIONS, signedNum } from "./constants";
import { ship, shipData, updateShip } from "./ShipBuilderApp";

export function SheetPanel() {
	const data = shipData.value;
	const currentShip = ship.value;

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);
	if (!hull) {
		return (
			<div class="sheet-layout">
				<div class="sheet-main">
					<p class="text-muted">No hull selected. Go back to Builder.</p>
				</div>
			</div>
		);
	}

	const stats = getShipStats(currentShip, hull);
	const installedConsoles = getInstalledConsoleIds(currentShip);

	// -----------------------------------------------------------------------
	// Console toggle
	// -----------------------------------------------------------------------

	const toggleConsole = useCallback((consoleId: string) => {
		updateShip((s) => {
			const wasActive = s.combat.consoleStatus[consoleId] !== false;
			return {
				...s,
				combat: {
					...s.combat,
					consoleStatus: {
						...s.combat.consoleStatus,
						[consoleId]: !wasActive,
					},
				},
			};
		});
	}, []);

	// -----------------------------------------------------------------------
	// Weapon toggle
	// -----------------------------------------------------------------------

	const toggleWeapon = useCallback((slotKey: string) => {
		updateShip((s) => {
			const wasActive = s.combat.weaponStatus[slotKey] !== false;
			return {
				...s,
				combat: {
					...s.combat,
					weaponStatus: {
						...s.combat.weaponStatus,
						[slotKey]: !wasActive,
					},
				},
			};
		});
	}, []);

	// -----------------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------------

	return (
		<div class="sheet-layout">
			<div class="sheet-main">
				{/* Header */}
				<header class="sheet-header">
					<h1 class="text-accent">{currentShip.name || "Unnamed Ship"}</h1>
					<span class="text-muted">
						{hull.name} — {hull.class}
					</span>
				</header>

				{/* Stats */}
				<section class="sheet-section">
					<h3>Ship Statistics</h3>
					<table class="stat-table">
						<tbody>
							<tr>
								<td>Hull Class</td>
								<td>{hull.class}</td>
							</tr>
							<tr>
								<td>Hull Strength</td>
								<td>{stats.hullHP}</td>
							</tr>
							<tr>
								<td>Maneuverability</td>
								<td>{signedNum(stats.man)}</td>
							</tr>
							<tr>
								<td>Acceleration</td>
								<td>{signedNum(stats.acc)}</td>
							</tr>
							<tr>
								<td>Speed</td>
								<td>{stats.speed} VU</td>
							</tr>
							<tr>
								<td>Sensors</td>
								<td>{signedNum(stats.sensors)}</td>
							</tr>
							<tr>
								<td>Crew Quality</td>
								<td>{stats.cq}</td>
							</tr>
							<tr>
								<td>Crew Size</td>
								<td>{stats.crew}</td>
							</tr>
							<tr>
								<td>TN to Hit</td>
								<td>{stats.tn}</td>
							</tr>
						</tbody>
					</table>
				</section>

				{/* Consoles */}
				<section class="sheet-section">
					<h3>Consoles</h3>
					<div class="sheet-list">
						{installedConsoles.length === 0 ? (
							<span class="text-muted">No consoles installed</span>
						) : (
							installedConsoles.map((cid) => {
								const c = data.consoles.find((x) => x.id === cid);
								if (!c) return null;
								const active = currentShip.combat.consoleStatus[cid] !== false;
								return (
									<div key={cid} class={`sheet-list-item ${active ? "" : "disabled"}`}>
										<div class="item-info">
											<div class="item-name">
												{c.name}{" "}
												<span
													class={`slot-type-badge ${c.type}`}
													style="font-size:0.6rem;width:14px;height:14px;line-height:14px"
												>
													{c.type.charAt(0).toUpperCase()}
												</span>
											</div>
											<div class="item-detail">{c.effect}</div>
										</div>
										<button
											type="button"
											class={`item-toggle ${active ? "" : "off"}`}
											onClick={() => toggleConsole(cid)}
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
				<section class="sheet-section">
					<h3>Weapons</h3>
					<div class="sheet-list">{renderWeapons(currentShip, data, toggleWeapon)}</div>
				</section>

				{/* Torpedoes */}
				{currentShip.hasTorpedoTube && (
					<section class="sheet-section">
						<h3>Torpedoes</h3>
						<div class="sheet-list">{renderTorpedoes(currentShip, data)}</div>
					</section>
				)}

				{/* Officers */}
				<section class="sheet-section">
					<h3>Bridge Officers</h3>
					<div class="officer-roster">
						{OFFICER_POSITIONS.map((pos) => {
							const off = currentShip.officers[pos.id] || {
								name: "",
								skill: 0,
							};
							return (
								<div key={pos.id} class="officer-card">
									<div class="position">{pos.title}</div>
									<div class="name">{off.name || "—"}</div>
									<div class="skill-info">
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
	const items: preact.JSX.Element[] = [];

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
				<div key={slotKey} class={`sheet-list-item ${active ? "" : "disabled"}`}>
					<div class="item-info">
						<div class="item-name">
							{w.name} <span class="text-muted">({pos})</span>
						</div>
						<div class="item-detail">
							Dam: {w.damage} | Dis: {w.disruption} | Acc: {signedNum(w.accuracy)} | Crit:{" "}
							{signedNum(w.crit)} | Range: {w.range} VU | Arc: {w.arc} | {w.type}
						</div>
					</div>
					<button
						type="button"
						class={`item-toggle ${active ? "" : "off"}`}
						onClick={() => toggleWeapon(slotKey)}
					>
						{active ? "Active" : "Offline"}
					</button>
				</div>,
			);
		}
	}

	if (items.length === 0) {
		return <span class="text-muted">No weapons installed</span>;
	}
	return items;
}

// =========================================================================
// Torpedo list helper
// =========================================================================

function renderTorpedoes(currentShip: import("./constants").ShipState, data: import("./constants").ShipData) {
	const loaded = (currentShip.torpedoes || []).filter(Boolean);
	if (loaded.length === 0) {
		return <span class="text-muted">Tube installed, no torpedoes loaded</span>;
	}

	return loaded.map((tid) => {
		const t = data.torpedoes.find((x) => x.id === tid);
		if (!t) return null;
		return (
			<div key={tid} class="sheet-list-item">
				<div class="item-info">
					<div class="item-name">{t.name}</div>
					<div class="item-detail">
						Dam: {t.damage} | Dis: {t.disruption} | Acc: +{t.accuracy} | Crit: +{t.crit} | Range: {t.range}{" "}
						VU | Arc: {t.arc}
					</div>
					{t.effect && <div class="item-detail">{t.effect}</div>}
				</div>
			</div>
		);
	});
}
