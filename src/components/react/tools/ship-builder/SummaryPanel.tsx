import { useCallback } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { cn } from "@/lib/utils";
import { calculateBPSpent, getBPBudget, getShipStats, signedNum } from "./constants";
import { useShipStore } from "./store";

export function SummaryPanel() {
	const { shipData, ship, updateShip } = useShipStore();
	const data = shipData;
	const currentShip = ship;

	const handleNameChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			const name = (e.target as HTMLInputElement).value;
			updateShip((s) => {
				s.name = name;
			});
		},
		[updateShip],
	);

	const handleHoldingsChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const holdings = Number.parseInt((e.target as HTMLSelectElement).value, 10);
			updateShip((s) => {
				s.holdings = holdings;
			});
		},
		[updateShip],
	);

	const handleCustomBPToggle = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const customBP = (e.target as HTMLInputElement).checked;
			updateShip((s) => {
				s.customBP = customBP;
			});
		},
		[updateShip],
	);

	const handleCustomBPValue = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			const customBPValue = Number.parseInt((e.target as HTMLInputElement).value, 10) || 0;
			updateShip((s) => {
				s.customBPValue = customBPValue;
			});
		},
		[updateShip],
	);

	const handleSwitchToSheet = useCallback(() => {
		useShipStore.getState().setMode("sheet");
		updateShip((s) => {
			s.mode = "sheet";
		});
	}, [updateShip]);

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);
	const stats = hull ? getShipStats(currentShip, hull) : null;
	const breakdown = calculateBPSpent(currentShip, data);
	const totalSpent = Object.values(breakdown).reduce((a, b) => a + b, 0);
	const budget = getBPBudget(currentShip, data);
	const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
	const overBudget = totalSpent > budget;

	const breakdownLines: Array<{ label: string; val: number }> = [
		{ label: "Hull", val: breakdown.hull },
		{ label: "Consoles", val: breakdown.consoles },
		{ label: "Weapons", val: breakdown.weapons },
		{ label: "Torpedoes", val: breakdown.torpedoes },
		{ label: "Shields", val: breakdown.shields },
		{ label: "Crew", val: breakdown.crew },
	].filter((l) => l.val !== 0);

	return (
		<aside className="sticky top-[50px] h-[calc(100vh-50px)] overflow-y-auto border-border border-l bg-surface p-lg max-tool-lg:static max-tool-lg:h-auto max-tool-lg:border-border max-tool-lg:border-t max-tool-lg:border-l-0">
			<div>
				<GameInput
					className="text-xl"
					onInput={handleNameChange}
					placeholder="Ship Name"
					type="text"
					value={currentShip.name}
				/>
			</div>

			<div className="mb-md text-sm">
				{hull ? (
					<>
						<strong>{hull.name}</strong> <span className="text-text-muted">({hull.class})</span>
					</>
				) : (
					<span className="text-text-muted">No hull selected</span>
				)}
			</div>

			{stats && (
				<div className="mb-md">
					<table className="w-full text-sm">
						<tbody>
							<tr>
								<td className="px-sm py-2xs text-text-muted">Hull Strength</td>
								<td className="px-sm py-2xs text-right font-semibold">{stats.hullHP}</td>
							</tr>
							<tr>
								<td className="px-sm py-2xs text-text-muted">Maneuverability</td>
								<td className="px-sm py-2xs text-right font-semibold">{signedNum(stats.man)}</td>
							</tr>
							<tr>
								<td className="px-sm py-2xs text-text-muted">Acceleration</td>
								<td className="px-sm py-2xs text-right font-semibold">{signedNum(stats.acc)}</td>
							</tr>
							<tr>
								<td className="px-sm py-2xs text-text-muted">Speed</td>
								<td className="px-sm py-2xs text-right font-semibold">{stats.speed}</td>
							</tr>
							<tr>
								<td className="px-sm py-2xs text-text-muted">Sensors</td>
								<td className="px-sm py-2xs text-right font-semibold">{signedNum(stats.sensors)}</td>
							</tr>
							<tr>
								<td className="px-sm py-2xs text-text-muted">Crew Quality</td>
								<td className="px-sm py-2xs text-right font-semibold">{stats.cq}</td>
							</tr>
							<tr>
								<td className="px-sm py-2xs text-text-muted">Crew Size</td>
								<td className="px-sm py-2xs text-right font-semibold">{stats.crew}</td>
							</tr>
							<tr>
								<td className="px-sm py-2xs text-text-muted">TN to Hit</td>
								<td className="px-sm py-2xs text-right font-semibold">{stats.tn}</td>
							</tr>
							<tr>
								<td className="px-sm py-2xs text-text-muted">Initiative</td>
								<td className="px-sm py-2xs text-right font-semibold">
									{signedNum(stats.sensors)} + {signedNum(stats.acc)} + 1d10
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			)}

			<div className="mb-md">
				<h4 className="mb-sm">Build Points</h4>
				<div className="mb-sm">
					<label className="text-xs" htmlFor="holdings-input">
						Holdings
					</label>
					<GameSelect id="holdings-input" onChange={handleHoldingsChange} value={currentShip.holdings}>
						{data.holdingsBP.map((bp, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed-position holdings levels 0-5 for select dropdown
							<option key={`holdings-${i}-${bp}`} value={i}>
								{i} — {bp} BP
							</option>
						))}
					</GameSelect>
				</div>
				<label className="mb-sm flex cursor-pointer items-center gap-sm text-sm">
					<GameCheckbox checked={currentShip.customBP} onChange={handleCustomBPToggle} />
					<span>Custom BP budget</span>
				</label>
				{currentShip.customBP && (
					<GameInput min={0} onInput={handleCustomBPValue} type="number" value={currentShip.customBPValue} />
				)}
				<div className="mt-sm">
					<div className="mb-xs flex justify-between text-sm">
						<span>BP Spent</span>
						<span>
							{totalSpent} / {budget} BP
						</span>
					</div>
					<div className="h-2 overflow-hidden rounded-[4px] bg-surface-raised">
						<div
							className={cn(
								"h-full rounded-[4px] bg-accent transition-all duration-300",
								overBudget && "bg-error",
							)}
							style={{ width: `${pct}%` }}
						/>
					</div>
				</div>
				<div className="text-text-muted text-xs">
					{breakdownLines.map((l) => (
						<div className={cn("flex justify-between py-0.5", overBudget && "text-error")} key={l.label}>
							<span>{l.label}</span>
							<span>{l.val} BP</span>
						</div>
					))}
				</div>
			</div>

			<div className="no-print mt-lg">
				<Button className="w-full" onClick={handleSwitchToSheet} variant="primary">
					Switch to Sheet →
				</Button>
			</div>
		</aside>
	);
}
