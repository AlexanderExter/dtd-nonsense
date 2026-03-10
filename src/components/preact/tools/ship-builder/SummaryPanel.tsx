import { useCallback } from "preact/hooks";
import { calculateBPSpent, getBPBudget, getShipStats, signedNum } from "./constants";
import { mode, ship, shipData, updateShip } from "./ShipBuilderApp";

export function SummaryPanel() {
	const data = shipData.value;
	const currentShip = ship.value;

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);
	const stats = hull ? getShipStats(currentShip, hull) : null;
	const breakdown = calculateBPSpent(currentShip, data);
	const totalSpent = Object.values(breakdown).reduce((a, b) => a + b, 0);
	const budget = getBPBudget(currentShip, data);
	const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
	const overBudget = totalSpent > budget;

	const handleNameChange = useCallback((e: Event) => {
		const name = (e.target as HTMLInputElement).value;
		updateShip((s) => ({ ...s, name }));
	}, []);

	const handleHoldingsChange = useCallback((e: Event) => {
		const holdings = Number.parseInt((e.target as HTMLSelectElement).value);
		updateShip((s) => ({ ...s, holdings }));
	}, []);

	const handleCustomBPToggle = useCallback((e: Event) => {
		const customBP = (e.target as HTMLInputElement).checked;
		updateShip((s) => ({ ...s, customBP }));
	}, []);

	const handleCustomBPValue = useCallback((e: Event) => {
		const customBPValue = Number.parseInt((e.target as HTMLInputElement).value) || 0;
		updateShip((s) => ({ ...s, customBPValue }));
	}, []);

	const handleSwitchToSheet = useCallback(() => {
		mode.value = "sheet";
		updateShip((s) => ({ ...s, mode: "sheet" }));
	}, []);

	const breakdownLines: Array<{ label: string; val: number }> = [
		{ label: "Hull", val: breakdown.hull },
		{ label: "Consoles", val: breakdown.consoles },
		{ label: "Weapons", val: breakdown.weapons },
		{ label: "Torpedoes", val: breakdown.torpedoes },
		{ label: "Shields", val: breakdown.shields },
		{ label: "Crew", val: breakdown.crew },
	].filter((l) => l.val !== 0);

	return (
		<aside class="summary-panel">
			<div class="summary-header">
				<input
					type="text"
					class="ship-name-input"
					placeholder="Ship Name"
					value={currentShip.name}
					onInput={handleNameChange}
				/>
			</div>

			<div class="summary-hull">
				{hull ? (
					<>
						<strong>{hull.name}</strong> <span class="text-muted">({hull.class})</span>
					</>
				) : (
					<span class="text-muted">No hull selected</span>
				)}
			</div>

			{stats && (
				<div class="summary-stats">
					<table>
						<tbody>
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
								<td>{stats.speed}</td>
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
							<tr>
								<td>Initiative</td>
								<td>
									{signedNum(stats.sensors)} + {signedNum(stats.acc)} + 1d10
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			)}

			<div class="summary-bp">
				<h4>Build Points</h4>
				<div class="field-row">
					<label for="holdings-input">Holdings</label>
					<select id="holdings-input" value={currentShip.holdings} onChange={handleHoldingsChange}>
						{data.holdingsBP.map((bp, i) => (
							<option key={i} value={i}>
								{i} — {bp} BP
							</option>
						))}
					</select>
				</div>
				<label class="toggle-row">
					<input type="checkbox" checked={currentShip.customBP} onChange={handleCustomBPToggle} />
					<span>Custom BP budget</span>
				</label>
				{currentShip.customBP && (
					<input type="number" min={0} value={currentShip.customBPValue} onInput={handleCustomBPValue} />
				)}
				<div class="budget-bar">
					<div class="label">
						<span>BP Spent</span>
						<span>
							{totalSpent} / {budget} BP
						</span>
					</div>
					<div class="bar">
						<div class={`bar-fill ${overBudget ? "over-budget" : ""}`} style={{ width: `${pct}%` }} />
					</div>
				</div>
				<div class="bp-breakdown">
					{breakdownLines.map((l) => (
						<div key={l.label} class={`bp-line ${overBudget ? "over-budget" : ""}`}>
							<span>{l.label}</span>
							<span>{l.val} BP</span>
						</div>
					))}
				</div>
			</div>

			<div class="summary-actions">
				<button type="button" class="btn btn-primary" onClick={handleSwitchToSheet}>
					Switch to Sheet →
				</button>
			</div>
		</aside>
	);
}
