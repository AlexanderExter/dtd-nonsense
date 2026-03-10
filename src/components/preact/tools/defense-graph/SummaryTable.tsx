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
		<table class="stats-table">
			<thead>
				<tr>
					<th>Stat</th>
					<th>Value</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Static Defense</td>
					<td>{defender.sd}</td>
				</tr>
				<tr>
					<td>Effective SD (w/ Dodge/Parry)</td>
					<td>
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
					<td>Hit Probability</td>
					<td>{simResult ? `${(simResult.hitRate * 100).toFixed(1)}%` : "—"}</td>
				</tr>
				<tr>
					<td>Weighted Effective AP</td>
					<td>{weightedAP.toFixed(1)}</td>
				</tr>
				<tr>
					<td>Expected Raw Damage (on hit)</td>
					<td>{simResult ? avgRawOnHit.toFixed(1) : "—"}</td>
				</tr>
				<tr>
					<td>Expected Damage After Armor</td>
					<td>{simResult ? pipeline.afterMitigation.toFixed(1) : "—"}</td>
				</tr>
				<tr>
					<td>Expected HP Lost / Attack</td>
					<td>{simResult ? simResult.avgHPLost.toFixed(2) : "—"}</td>
				</tr>
				<tr>
					<td>Attacks to Down</td>
					<td>{attacksToDown != null ? attacksToDown : "∞"}</td>
				</tr>
			</tbody>
		</table>
	);
}
