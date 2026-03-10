import type { Signal } from "@preact/signals";
import { Chart, type ChartConfiguration } from "chart.js";
import { useEffect, useRef } from "preact/hooks";
import type { PoolConfig, SimulationResult } from "./constants";
import { POOL_COLORS, poolLabel, TN_MAX, TN_MIN, TN_STEP } from "./constants";

interface SuccessRateChartProps {
	results: Signal<Map<number, SimulationResult>>;
	pools: Signal<PoolConfig[]>;
	selectedTN: Signal<number>;
	onSetTN: (tn: number) => void;
}

const fiftyLinePlugin = {
	id: "fiftyLine",
	afterDraw(chart: Chart) {
		const yScale = chart.scales.y;
		if (!yScale) return;
		const y = yScale.getPixelForValue(50);
		const ctx = chart.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.setLineDash([4, 4]);
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#6c6a75";
		ctx.moveTo(chart.chartArea.left, y);
		ctx.lineTo(chart.chartArea.right, y);
		ctx.stroke();
		ctx.fillStyle = "#6c6a75";
		ctx.font = "10px system-ui";
		ctx.textAlign = "right";
		ctx.fillText("50%", chart.chartArea.left - 4, y + 3);
		ctx.restore();
	},
};

const selectedTNPlugin = {
	id: "selectedTN",
	selectedTNValue: 15,
	afterDraw(chart: Chart) {
		const xScale = chart.scales.x;
		const yScale = chart.scales.y;
		if (!xScale || !yScale) return;
		const labels = chart.data.labels as number[];
		const idx = labels.indexOf(selectedTNPlugin.selectedTNValue);
		if (idx === -1) return;
		const x = xScale.getPixelForValue(idx);
		const ctx = chart.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.setLineDash([6, 4]);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#d4a84b88";
		ctx.moveTo(x, yScale.top);
		ctx.lineTo(x, yScale.bottom);
		ctx.stroke();
		ctx.fillStyle = "#d4a84b";
		ctx.font = "bold 11px system-ui";
		ctx.textAlign = "center";
		ctx.fillText(`TN ${selectedTNPlugin.selectedTNValue}`, x, yScale.bottom + 16);
		ctx.restore();
	},
};

export function SuccessRateChart({ results, pools, selectedTN, onSetTN }: SuccessRateChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);

	// Create chart on mount
	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const config: ChartConfiguration = {
			type: "line",
			data: { labels: [], datasets: [] },
			plugins: [fiftyLinePlugin, selectedTNPlugin],
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: "index", intersect: false },
				onClick: (_evt, elements, chart) => {
					if (elements.length > 0) {
						const tn = (chart.data.labels as number[])[elements[0].index];
						onSetTN(tn);
					}
				},
				plugins: {
					tooltip: {
						callbacks: {
							label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(1)}%`,
						},
					},
					legend: { display: true, position: "bottom" },
				},
				scales: {
					x: {
						title: { display: true, text: "Target Number" },
						grid: { color: "#1e1e24" },
					},
					y: {
						title: { display: true, text: "P(Success) %" },
						min: 0,
						max: 100,
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

	// Update chart data when results/pools/selectedTN change
	useEffect(() => {
		const chart = chartRef.current;
		if (!chart) return;

		selectedTNPlugin.selectedTNValue = selectedTN.value;

		const tnLabels: number[] = [];
		for (let tn = TN_MIN; tn <= TN_MAX; tn += TN_STEP) tnLabels.push(tn);

		const datasets = pools.value
			.map((pool, i) => {
				const data = results.value.get(i);
				if (!data) return null;
				return {
					label: poolLabel(pool),
					data: tnLabels.map((tn) => data.successRates[tn] ?? 0),
					borderColor: POOL_COLORS[i],
					backgroundColor: `${POOL_COLORS[i]}33`,
					borderWidth: 2,
					pointRadius: 0,
					pointHoverRadius: 5,
					tension: 0.25,
					fill: false,
				};
			})
			.filter(Boolean);

		chart.data.labels = tnLabels;
		chart.data.datasets = datasets as Chart["data"]["datasets"];
		chart.update("none");
	});

	return (
		<div class="card graph-card">
			<div class="card-header">
				<h3>Success Probability vs TN</h3>
			</div>
			<div class="chart-wrap">
				<canvas ref={canvasRef} />
			</div>
		</div>
	);
}
