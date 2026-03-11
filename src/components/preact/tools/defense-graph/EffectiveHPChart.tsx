import { Chart, type ChartConfiguration } from "chart.js";
import { useEffect, useRef } from "preact/hooks";
import { type AttackerConfig, COLORS, computePipeline, type DefenderConfig } from "./constants";

interface EffectiveHPChartProps {
	defender: DefenderConfig;
	attacker: AttackerConfig;
}

export function EffectiveHPChart({ defender, attacker }: EffectiveHPChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const labels: number[] = [];
		const hpLostData: number[] = [];
		const tearingData: number[] = [];

		for (let raw = 0; raw <= 40; raw++) {
			labels.push(raw);
			const result = computePipeline(raw, defender, attacker);
			hpLostData.push(result.hpLost);
			if (attacker.tearing && result.afterMitigation > 0) {
				tearingData.push(Math.max(1, result.hpLost));
			} else {
				tearingData.push(result.hpLost);
			}
		}

		const datasets = [
			{
				label: "HP Lost",
				data: hpLostData,
				borderColor: COLORS.hpLost,
				backgroundColor: `${COLORS.hpLost}33`,
				fill: true,
				tension: 0.1,
			},
		];

		if (attacker.tearing) {
			datasets.push({
				label: "Tearing Minimum",
				data: tearingData,
				borderColor: COLORS.raw,
				backgroundColor: "transparent",
				fill: false,
				tension: 0.1,
				// @ts-expect-error Chart.js accepts borderDash on dataset
				borderDash: [5, 5],
			});
		}

		if (chartRef.current) {
			chartRef.current.data.labels = labels;
			chartRef.current.data.datasets = datasets;
			chartRef.current.update();
			return;
		}

		const config: ChartConfiguration = {
			type: "line",
			data: { labels, datasets },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: "index", intersect: false },
				plugins: {
					legend: { display: true, position: "bottom" },
				},
				scales: {
					x: {
						title: { display: true, text: "Raw Incoming Damage" },
						grid: { color: "#1e1e24" },
					},
					y: {
						title: { display: true, text: "HP Lost" },
						beginAtZero: true,
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
	}, [defender, attacker]);

	return (
		<div class="relative w-full min-h-[280px]">
			<canvas ref={canvasRef} class="w-full! h-full!" />
		</div>
	);
}
