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
		<div class="bg-surface border border-border rounded-md overflow-hidden min-h-[320px] print:break-inside-avoid print:border-[#ccc]">
			<div class="px-md py-sm border-b border-border">
				<h3 class="m-0 text-[0.95rem] text-accent">Statistics</h3>
			</div>
			<div class="overflow-x-auto p-sm">
				<table class="m-0 text-[0.85rem] w-full border-collapse">
					<thead>
						<tr>
							<th class="whitespace-nowrap px-sm py-xs text-left text-text-muted border-b border-border">
								Pool
							</th>
							<th class="whitespace-nowrap px-sm py-xs text-left text-text-muted border-b border-border">
								Mean
							</th>
							<th class="whitespace-nowrap px-sm py-xs text-left text-text-muted border-b border-border">
								Median
							</th>
							<th class="whitespace-nowrap px-sm py-xs text-left text-text-muted border-b border-border">
								Std Dev
							</th>
							<th class="whitespace-nowrap px-sm py-xs text-left text-text-muted border-b border-border">
								P(≥TN)
							</th>
							<th class="whitespace-nowrap px-sm py-xs text-left text-text-muted border-b border-border">
								P(≥TN+5)
							</th>
							<th class="whitespace-nowrap px-sm py-xs text-left text-text-muted border-b border-border">
								P(≥TN+10)
							</th>
							<th class="whitespace-nowrap px-sm py-xs text-left text-text-muted border-b border-border">
								E[Raises]
							</th>
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
									<td class="whitespace-nowrap px-sm py-xs text-left">
										<span
											class="inline-block w-2.5 h-2.5 rounded-full mr-xs align-middle"
											style={{ background: POOL_COLORS[i] }}
										/>
										{poolLabel(pool)}
									</td>
									<td class="whitespace-nowrap px-sm py-xs text-left">{data.mean.toFixed(1)}</td>
									<td class="whitespace-nowrap px-sm py-xs text-left">{data.median.toFixed(1)}</td>
									<td class="whitespace-nowrap px-sm py-xs text-left">{data.stdDev.toFixed(1)}</td>
									<td class="whitespace-nowrap px-sm py-xs text-left">{pTN.toFixed(1)}%</td>
									<td class="whitespace-nowrap px-sm py-xs text-left">{pTN5.toFixed(1)}%</td>
									<td class="whitespace-nowrap px-sm py-xs text-left">{pTN10.toFixed(1)}%</td>
									<td class="whitespace-nowrap px-sm py-xs text-left">{expRaises.toFixed(1)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
