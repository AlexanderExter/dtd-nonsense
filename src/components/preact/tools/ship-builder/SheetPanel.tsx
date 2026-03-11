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
			<div class="grid grid-cols-[1fr_340px] gap-0 min-h-[calc(100vh-50px)] max-[900px]:grid-cols-1">
				<div class="p-lg overflow-y-auto">
					<p class="text-text-muted">No hull selected. Go back to Builder.</p>
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
		<div class="grid grid-cols-[1fr_340px] gap-0 min-h-[calc(100vh-50px)] max-[900px]:grid-cols-1">
			<div class="p-lg overflow-y-auto">
				{/* Header */}
				<header class="mb-lg">
					<h1 class="text-accent mb-xs">{currentShip.name || "Unnamed Ship"}</h1>
					<span class="text-text-muted">
						{hull.name} — {hull.class}
					</span>
				</header>

				{/* Stats */}
				<section class="mb-xl">
					<h3 class="text-accent pb-xs border-b border-border mb-md">Ship Statistics</h3>
					<table class="w-full max-w-[500px]">
						<tbody>
							<tr>
								<td class="text-text-muted w-[160px]">Hull Class</td>
								<td class="font-semibold">{hull.class}</td>
							</tr>
							<tr>
								<td class="text-text-muted w-[160px]">Hull Strength</td>
								<td class="font-semibold">{stats.hullHP}</td>
							</tr>
							<tr>
								<td class="text-text-muted w-[160px]">Maneuverability</td>
								<td class="font-semibold">{signedNum(stats.man)}</td>
							</tr>
							<tr>
								<td class="text-text-muted w-[160px]">Acceleration</td>
								<td class="font-semibold">{signedNum(stats.acc)}</td>
							</tr>
							<tr>
								<td class="text-text-muted w-[160px]">Speed</td>
								<td class="font-semibold">{stats.speed} VU</td>
							</tr>
							<tr>
								<td class="text-text-muted w-[160px]">Sensors</td>
								<td class="font-semibold">{signedNum(stats.sensors)}</td>
							</tr>
							<tr>
								<td class="text-text-muted w-[160px]">Crew Quality</td>
								<td class="font-semibold">{stats.cq}</td>
							</tr>
							<tr>
								<td class="text-text-muted w-[160px]">Crew Size</td>
								<td class="font-semibold">{stats.crew}</td>
							</tr>
							<tr>
								<td class="text-text-muted w-[160px]">TN to Hit</td>
								<td class="font-semibold">{stats.tn}</td>
							</tr>
						</tbody>
					</table>
				</section>

				{/* Consoles */}
				<section class="mb-xl">
					<h3 class="text-accent pb-xs border-b border-border mb-md">Consoles</h3>
					<div>
						{installedConsoles.length === 0 ? (
							<span class="text-text-muted">No consoles installed</span>
						) : (
							installedConsoles.map((cid) => {
								const c = data.consoles.find((x) => x.id === cid);
								if (!c) return null;
								const active = currentShip.combat.consoleStatus[cid] !== false;
								const badgeColors: Record<string, string> = {
									arcana: "bg-[#9b59b6]",
									command: "bg-[#e74c3c]",
									engineering: "bg-[#f39c12]",
									tactical: "bg-[#3498db]",
									universal: "bg-[#2ecc71]",
								};
								return (
									<div
										key={cid}
										class={[
											"flex items-center justify-between px-md py-sm mb-xs bg-surface border border-border rounded-sm transition-opacity duration-150",
											!active && "opacity-40 border-error",
										]
											.filter(Boolean)
											.join(" ")}
									>
										<div class="flex-1">
											<div class="font-semibold text-[0.9rem]">
												{c.name}{" "}
												<span
													class={`inline-block rounded-[4px] text-center font-bold text-bg ${badgeColors[c.type] || ""}`}
													style="font-size:0.6rem;width:14px;height:14px;line-height:14px"
												>
													{c.type.charAt(0).toUpperCase()}
												</span>
											</div>
											<div class="text-xs text-text-muted">{c.effect}</div>
										</div>
										<button
											type="button"
											class={[
												"cursor-pointer py-1 px-2 border border-border rounded-sm bg-transparent text-success text-xs font-semibold",
												!active && "text-error",
											]
												.filter(Boolean)
												.join(" ")}
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
				<section class="mb-xl">
					<h3 class="text-accent pb-xs border-b border-border mb-md">Weapons</h3>
					<div>{renderWeapons(currentShip, data, toggleWeapon)}</div>
				</section>

				{/* Torpedoes */}
				{currentShip.hasTorpedoTube && (
					<section class="mb-xl">
						<h3 class="text-accent pb-xs border-b border-border mb-md">Torpedoes</h3>
						<div>{renderTorpedoes(currentShip, data)}</div>
					</section>
				)}

				{/* Officers */}
				<section class="mb-xl">
					<h3 class="text-accent pb-xs border-b border-border mb-md">Bridge Officers</h3>
					<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
						{OFFICER_POSITIONS.map((pos) => {
							const off = currentShip.officers[pos.id] || {
								name: "",
								skill: 0,
							};
							return (
								<div key={pos.id} class="bg-surface border border-border rounded-sm px-md py-sm">
									<div class="text-xs text-accent uppercase tracking-[0.5px]">{pos.title}</div>
									<div class="font-semibold">{off.name || "—"}</div>
									<div class="text-[0.8rem] text-text-muted">
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
				<div
					key={slotKey}
					class={[
						"flex items-center justify-between px-md py-sm mb-xs bg-surface border border-border rounded-sm transition-opacity duration-150",
						!active && "opacity-40 border-error",
					]
						.filter(Boolean)
						.join(" ")}
				>
					<div class="flex-1">
						<div class="font-semibold text-[0.9rem]">
							{w.name} <span class="text-text-muted">({pos})</span>
						</div>
						<div class="text-xs text-text-muted">
							Dam: {w.damage} | Dis: {w.disruption} | Acc: {signedNum(w.accuracy)} | Crit:{" "}
							{signedNum(w.crit)} | Range: {w.range} VU | Arc: {w.arc} | {w.type}
						</div>
					</div>
					<button
						type="button"
						class={[
							"cursor-pointer py-1 px-2 border border-border rounded-sm bg-transparent text-success text-xs font-semibold",
							!active && "text-error",
						]
							.filter(Boolean)
							.join(" ")}
						onClick={() => toggleWeapon(slotKey)}
					>
						{active ? "Active" : "Offline"}
					</button>
				</div>,
			);
		}
	}

	if (items.length === 0) {
		return <span class="text-text-muted">No weapons installed</span>;
	}
	return items;
}

// =========================================================================
// Torpedo list helper
// =========================================================================

function renderTorpedoes(currentShip: import("./constants").ShipState, data: import("./constants").ShipData) {
	const loaded = (currentShip.torpedoes || []).filter(Boolean);
	if (loaded.length === 0) {
		return <span class="text-text-muted">Tube installed, no torpedoes loaded</span>;
	}

	return loaded.map((tid) => {
		const t = data.torpedoes.find((x) => x.id === tid);
		if (!t) return null;
		return (
			<div
				key={tid}
				class="flex items-center justify-between px-md py-sm mb-xs bg-surface border border-border rounded-sm transition-opacity duration-150"
			>
				<div class="flex-1">
					<div class="font-semibold text-[0.9rem]">{t.name}</div>
					<div class="text-xs text-text-muted">
						Dam: {t.damage} | Dis: {t.disruption} | Acc: +{t.accuracy} | Crit: +{t.crit} | Range: {t.range}{" "}
						VU | Arc: {t.arc}
					</div>
					{t.effect && <div class="text-xs text-text-muted">{t.effect}</div>}
				</div>
			</div>
		);
	});
}
