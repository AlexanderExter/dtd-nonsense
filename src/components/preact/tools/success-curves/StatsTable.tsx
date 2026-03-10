import type { Signal } from "@preact/signals";
import type { PoolConfig, SimulationResult } from "./constants";
import { POOL_COLORS, poolLabel } from "./constants";

interface StatsTableProps {
	results: Signal<Map<number, SimulationResult>>;
	pools: Signal<PoolConfig[]>;
	selectedTN: Signal<number>;
}

export function StatsTable({ results, pools, selectedTN }: StatsTableProps) {
	const tn = selectedTN.value;

	return (
		<div class="card graph-card stats-card">
			<div class="card-header">
				<h3>Statistics</h3>
			</div>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Pool</th>
							<th>Mean</th>
							<th>Median</th>
							<th>Std Dev</th>
							<th>P(≥TN)</th>
							<th>P(≥TN+5)</th>
							<th>P(≥TN+10)</th>
							<th>E[Raises]</th>
						</tr>
					</thead>
					<tbody>
						{pools.value.map((pool, i) => {
							const data = results.value.get(i);
							if (!data) return null;

							const pTN = data.successRates[tn] ?? 0;
							const pTN5 = data.successRates[tn + 5] ?? 0;
							const pTN10 = data.successRates[tn + 10] ?? 0;

							let expRaises = 0;
							for (let r = 1; r <= 10; r++) {
								const rate = data.successRates[tn + r * 5];
								if (rate != null) expRaises += rate / 100;
							}

							return (
								<tr key={i}>
									<td>
										<span class="stats-pool-swatch" style={{ background: POOL_COLORS[i] }} />
										{poolLabel(pool)}
									</td>
									<td>{data.mean.toFixed(1)}</td>
									<td>{data.median.toFixed(1)}</td>
									<td>{data.stdDev.toFixed(1)}</td>
									<td>{pTN.toFixed(1)}%</td>
									<td>{pTN5.toFixed(1)}%</td>
									<td>{pTN10.toFixed(1)}%</td>
									<td>{expRaises.toFixed(1)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
