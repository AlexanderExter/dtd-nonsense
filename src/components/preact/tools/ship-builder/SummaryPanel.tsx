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
		const holdings = Number.parseInt((e.target as HTMLSelectElement).value, 10);
		updateShip((s) => ({ ...s, holdings }));
	}, []);

	const handleCustomBPToggle = useCallback((e: Event) => {
		const customBP = (e.target as HTMLInputElement).checked;
		updateShip((s) => ({ ...s, customBP }));
	}, []);

	const handleCustomBPValue = useCallback((e: Event) => {
		const customBPValue = Number.parseInt((e.target as HTMLInputElement).value, 10) || 0;
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
		<aside class="sticky top-[50px] h-[calc(100vh-50px)] overflow-y-auto p-lg bg-surface border-l border-border max-[900px]:static max-[900px]:h-auto max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:border-border">
			<div>
				<input
					type="text"
					class="w-full text-[1.3rem] font-semibold p-sm bg-transparent border border-transparent border-b-2 border-b-accent text-accent mb-md focus:border-accent focus:bg-surface-raised"
					placeholder="Ship Name"
					value={currentShip.name}
					onInput={handleNameChange}
				/>
			</div>

			<div class="mb-md text-[0.9rem]">
				{hull ? (
					<>
						<strong>{hull.name}</strong> <span class="text-text-muted">({hull.class})</span>
					</>
				) : (
					<span class="text-text-muted">No hull selected</span>
				)}
			</div>

			{stats && (
				<div class="mb-md">
					<table class="w-full text-[0.85rem]">
						<tbody>
							<tr>
								<td class="py-[3px] px-sm text-text-muted">Hull Strength</td>
								<td class="py-[3px] px-sm text-right font-semibold">{stats.hullHP}</td>
							</tr>
							<tr>
								<td class="py-[3px] px-sm text-text-muted">Maneuverability</td>
								<td class="py-[3px] px-sm text-right font-semibold">{signedNum(stats.man)}</td>
							</tr>
							<tr>
								<td class="py-[3px] px-sm text-text-muted">Acceleration</td>
								<td class="py-[3px] px-sm text-right font-semibold">{signedNum(stats.acc)}</td>
							</tr>
							<tr>
								<td class="py-[3px] px-sm text-text-muted">Speed</td>
								<td class="py-[3px] px-sm text-right font-semibold">{stats.speed}</td>
							</tr>
							<tr>
								<td class="py-[3px] px-sm text-text-muted">Sensors</td>
								<td class="py-[3px] px-sm text-right font-semibold">{signedNum(stats.sensors)}</td>
							</tr>
							<tr>
								<td class="py-[3px] px-sm text-text-muted">Crew Quality</td>
								<td class="py-[3px] px-sm text-right font-semibold">{stats.cq}</td>
							</tr>
							<tr>
								<td class="py-[3px] px-sm text-text-muted">Crew Size</td>
								<td class="py-[3px] px-sm text-right font-semibold">{stats.crew}</td>
							</tr>
							<tr>
								<td class="py-[3px] px-sm text-text-muted">TN to Hit</td>
								<td class="py-[3px] px-sm text-right font-semibold">{stats.tn}</td>
							</tr>
							<tr>
								<td class="py-[3px] px-sm text-text-muted">Initiative</td>
								<td class="py-[3px] px-sm text-right font-semibold">
									{signedNum(stats.sensors)} + {signedNum(stats.acc)} + 1d10
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			)}

			<div class="mb-md">
				<h4 class="mb-sm">Build Points</h4>
				<div class="mb-sm">
					<label for="holdings-input" class="text-[0.8rem]">
						Holdings
					</label>
					<select id="holdings-input" value={currentShip.holdings} onChange={handleHoldingsChange}>
						{data.holdingsBP.map((bp, i) => (
							<option key={i} value={i}>
								{i} — {bp} BP
							</option>
						))}
					</select>
				</div>
				<label class="flex items-center gap-sm cursor-pointer text-[0.85rem] mb-sm">
					<input type="checkbox" checked={currentShip.customBP} onChange={handleCustomBPToggle} />
					<span>Custom BP budget</span>
				</label>
				{currentShip.customBP && (
					<input type="number" min={0} value={currentShip.customBPValue} onInput={handleCustomBPValue} />
				)}
				<div class="mt-sm">
					<div class="flex justify-between text-[0.85rem] mb-xs">
						<span>BP Spent</span>
						<span>
							{totalSpent} / {budget} BP
						</span>
					</div>
					<div class="h-2 bg-surface-raised rounded-[4px] overflow-hidden">
						<div
							class={[
								"h-full bg-accent rounded-[4px] transition-all duration-300",
								overBudget && "bg-error",
							]
								.filter(Boolean)
								.join(" ")}
							style={{ width: `${pct}%` }}
						/>
					</div>
				</div>
				<div class="text-[0.8rem] text-text-muted">
					{breakdownLines.map((l) => (
						<div
							key={l.label}
							class={["flex justify-between py-0.5", overBudget && "text-error"]
								.filter(Boolean)
								.join(" ")}
						>
							<span>{l.label}</span>
							<span>{l.val} BP</span>
						</div>
					))}
				</div>
			</div>

			<div class="mt-lg no-print">
				<button type="button" class="btn btn-primary w-full" onClick={handleSwitchToSheet}>
					Switch to Sheet →
				</button>
			</div>
		</aside>
	);
}
