import type { Signal } from "@preact/signals";
import { Chart, type ChartConfiguration } from "chart.js";
import { useEffect, useRef } from "preact/hooks";
import type { PoolConfig, SimulationResult } from "./constants";
import { poolLabel, RAISE_CHECK_COLORS, RAISE_CHECK_LABELS } from "./constants";

interface RaiseDistChartProps {
	results: Signal<Map<number, SimulationResult>>;
	pools: Signal<PoolConfig[]>;
}

export function RaiseDistChart({ results, pools }: RaiseDistChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const config: ChartConfiguration = {
			type: "bar",
			data: { labels: RAISE_CHECK_LABELS, datasets: [] },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					tooltip: {
						callbacks: {
							label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(1)}%`,
						},
					},
					legend: { display: true, position: "bottom" },
				},
				scales: {
					x: { grid: { display: false } },
					y: {
						title: { display: true, text: "Probability %" },
						min: 0,
						grid: { color: "#1e1e24" },
					},
				},
			},
		};

		chartRef.current = new Chart(ctx, config);
		return () => {
			chartRef.current?.destroy();
			chartRef.current = null;
		};
	}, []);

	useEffect(() => {
		const chart = chartRef.current;
		if (!chart) return;

		const datasets = pools.value
			.map((pool, i) => {
				const data = results.value.get(i);
				if (!data) return null;
				return {
					label: poolLabel(pool),
					data: data.raiseChecks,
					backgroundColor: RAISE_CHECK_COLORS,
					borderColor: "#0d0d0f",
					borderWidth: 1,
				};
			})
			.filter(Boolean);

		chart.data.datasets = datasets as Chart["data"]["datasets"];
		chart.update("none");
	});

	return (
		<div class="bg-surface border border-border rounded-md overflow-hidden min-h-[320px] print:break-inside-avoid print:border-[#ccc]">
			<div class="px-md py-sm border-b border-border">
				<h3 class="m-0 text-[0.95rem] text-accent">Raise / Check Distribution</h3>
			</div>
			<div class="relative w-full min-h-[280px] p-sm">
				<canvas ref={canvasRef} class="w-full! h-full!" />
			</div>
		</div>
	);
}
