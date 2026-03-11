import {
	type AttackerConfig,
	computePipeline,
	computeWeightedAP,
	type DefenderConfig,
	type SimulationResult,
} from "./constants";

interface SummaryTableProps {
	defender: DefenderConfig;
	attacker: AttackerConfig;
	simResult: SimulationResult | null;
}

function estimateDodgeBonus(_dex: number, dodge: number): number {
	if (dodge <= 0) return 0;
	return Math.round((dodge * 5.5) / 2);
}

function estimateParryBonus(_level: number, parry: number): number {
	if (parry <= 0) return 0;
	return Math.round((parry * 5.5) / 2);
}

export function SummaryTable({ defender, attacker, simResult }: SummaryTableProps) {
	const dodgeBonus = estimateDodgeBonus(defender.dex, defender.dodge);
	const parryBonus = estimateParryBonus(defender.level, defender.parry);
	const effectiveSD = defender.sd + Math.max(dodgeBonus, parryBonus);

	const weightedAP = computeWeightedAP(defender, attacker.pen);

	const avgRawOnHit = simResult?.avgRawDmgOnHit ?? 0;
	const pipeline = computePipeline(Math.round(avgRawOnHit), defender, attacker);

	const attacksToDown = simResult && simResult.avgHPLost > 0 ? Math.ceil(defender.hp / simResult.avgHPLost) : null;

	return (
		<div class="overflow-x-auto p-sm">
			<table class="m-0 text-[0.85rem] w-full">
				<thead>
					<tr>
						<th class="whitespace-nowrap px-sm py-xs text-left">Stat</th>
						<th class="whitespace-nowrap px-sm py-xs text-left">Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="whitespace-nowrap px-sm py-xs">Static Defense</td>
						<td class="whitespace-nowrap px-sm py-xs font-mono text-accent">{defender.sd}</td>
					</tr>
					<tr>
						<td class="whitespace-nowrap px-sm py-xs">Effective SD (w/ Dodge/Parry)</td>
						<td class="whitespace-nowrap px-sm py-xs font-mono text-accent">
							{effectiveSD}
							{(dodgeBonus > 0 || parryBonus > 0) && (
								<span style={{ opacity: 0.7, marginLeft: "0.5em" }}>
									({dodgeBonus > 0 ? `+${dodgeBonus} dodge` : ""}
									{parryBonus > 0 ? `+${parryBonus} parry` : ""})
								</span>
							)}
						</td>
					</tr>
					<tr>
						<td class="whitespace-nowrap px-sm py-xs">Hit Probability</td>
						<td class="whitespace-nowrap px-sm py-xs font-mono text-accent">
							{simResult ? `${(simResult.hitRate * 100).toFixed(1)}%` : "—"}
						</td>
					</tr>
					<tr>
						<td class="whitespace-nowrap px-sm py-xs">Weighted Effective AP</td>
						<td class="whitespace-nowrap px-sm py-xs font-mono text-accent">{weightedAP.toFixed(1)}</td>
					</tr>
					<tr>
						<td class="whitespace-nowrap px-sm py-xs">Expected Raw Damage (on hit)</td>
						<td class="whitespace-nowrap px-sm py-xs font-mono text-accent">
							{simResult ? avgRawOnHit.toFixed(1) : "—"}
						</td>
					</tr>
					<tr>
						<td class="whitespace-nowrap px-sm py-xs">Expected Damage After Armor</td>
						<td class="whitespace-nowrap px-sm py-xs font-mono text-accent">
							{simResult ? pipeline.afterMitigation.toFixed(1) : "—"}
						</td>
					</tr>
					<tr>
						<td class="whitespace-nowrap px-sm py-xs">Expected HP Lost / Attack</td>
						<td class="whitespace-nowrap px-sm py-xs font-mono text-accent">
							{simResult ? simResult.avgHPLost.toFixed(2) : "—"}
						</td>
					</tr>
					<tr>
						<td class="whitespace-nowrap px-sm py-xs">Attacks to Down</td>
						<td class="whitespace-nowrap px-sm py-xs font-mono text-accent">
							{attacksToDown != null ? attacksToDown : "∞"}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
