import type { Signal } from "@preact/signals";
import { Chart, type ChartConfiguration } from "chart.js";
import { useEffect, useRef } from "preact/hooks";
import type { PoolConfig, SimulationResult } from "./constants";
import { POOL_COLORS, poolLabel } from "./constants";

interface HistogramChartProps {
	results: Signal<Map<number, SimulationResult>>;
	pools: Signal<PoolConfig[]>;
	selectedTN: Signal<number>;
}

const tnLinePlugin = {
	id: "tnLine",
	selectedTNValue: 15,
	afterDraw(chart: Chart) {
		const xScale = chart.scales.x;
		const yScale = chart.scales.y;
		if (!xScale || !yScale) return;
		const labels = chart.data.labels as number[];
		const tnIdx = labels.indexOf(tnLinePlugin.selectedTNValue);
		if (tnIdx === -1) return;
		const x = xScale.getPixelForValue(tnIdx);
		const ctx = chart.ctx;
		ctx.save();
		ctx.beginPath();
		ctx.setLineDash([6, 4]);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#f87171";
		ctx.moveTo(x, yScale.top);
		ctx.lineTo(x, yScale.bottom);
		ctx.stroke();
		ctx.fillStyle = "#f87171";
		ctx.font = "bold 11px system-ui";
		ctx.textAlign = "center";
		ctx.fillText(`TN ${tnLinePlugin.selectedTNValue}`, x, yScale.top - 6);
		ctx.restore();
	},
};

export function HistogramChart({ results, pools, selectedTN }: HistogramChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const config: ChartConfiguration = {
			type: "bar",
			data: { labels: [], datasets: [] },
			plugins: [tnLinePlugin],
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					tooltip: {
						callbacks: {
							label: (ctx) => `${(ctx.parsed.y ?? 0).toFixed(2)}%`,
						},
					},
					legend: { display: true, position: "bottom" },
				},
				scales: {
					x: {
						title: { display: true, text: "Roll Total" },
						grid: { display: false },
						ticks: {
							maxTicksLimit: 20,
							callback(value) {
								return Number(value) % 5 === 0 ? value : "";
							},
						},
					},
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

		tnLinePlugin.selectedTNValue = selectedTN.value;

		let maxLen = 0;
		for (const [, data] of results.value) {
			if (data.histogram.length > maxLen) maxLen = data.histogram.length;
		}
		if (maxLen === 0) return;

		const labels: number[] = [];
		for (let i = 0; i < maxLen; i++) labels.push(i);

		const datasets = pools.value
			.map((pool, i) => {
				const data = results.value.get(i);
				if (!data) return null;
				const padded = new Array<number>(maxLen).fill(0);
				for (let j = 0; j < data.histogram.length; j++) padded[j] = data.histogram[j];
				return {
					label: poolLabel(pool),
					data: padded,
					backgroundColor: `${POOL_COLORS[i]}88`,
					borderColor: POOL_COLORS[i],
					borderWidth: 1,
					barPercentage: 1.0,
					categoryPercentage: 1.0,
				};
			})
			.filter(Boolean);

		chart.data.labels = labels;
		chart.data.datasets = datasets as Chart["data"]["datasets"];
		chart.update("none");
	});

	return (
		<div class="bg-surface border border-border rounded-md overflow-hidden min-h-[320px] print:break-inside-avoid print:border-[#ccc]">
			<div class="px-md py-sm border-b border-border">
				<h3 class="m-0 text-[0.95rem] text-accent">Result Distribution</h3>
			</div>
			<div class="relative w-full min-h-[280px] p-sm">
				<canvas ref={canvasRef} class="w-full! h-full!" />
			</div>
		</div>
	);
}
