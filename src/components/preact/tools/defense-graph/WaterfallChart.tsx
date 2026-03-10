import { Chart, type ChartConfiguration } from "chart.js";
import { useEffect, useRef, useState } from "preact/hooks";
import { type AttackerConfig, COLORS, computePipeline, type DefenderConfig } from "./constants";

interface WaterfallChartProps {
	defender: DefenderConfig;
	attacker: AttackerConfig;
}

export function WaterfallChart({ defender, attacker }: WaterfallChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);
	const [rawDmg, setRawDmg] = useState(15);

	const pipeline = computePipeline(rawDmg, defender, attacker);
	const resilRemainder = defender.resilience > 0 ? pipeline.afterMitigation % defender.resilience : 0;

	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const labels = ["Damage Pipeline"];
		const datasets = [
			{
				label: "HP Lost",
				data: [pipeline.hpLost * (defender.resilience || 1)],
				backgroundColor: COLORS.hpLost,
			},
			{
				label: "Resilience Remainder",
				data: [resilRemainder],
				backgroundColor: COLORS.resilConvert,
			},
			{
				label: "Aura Soak",
				data: [pipeline.auraSoak],
				backgroundColor: COLORS.auraSoak,
			},
			{
				label: "Cover Soak",
				data: [pipeline.coverSoak],
				backgroundColor: COLORS.coverSoak,
			},
			{
				label: "Armor Soak",
				data: [pipeline.armorSoak],
				backgroundColor: COLORS.armorSoak,
			},
		];

		if (chartRef.current) {
			chartRef.current.data.datasets = datasets;
			chartRef.current.options.plugins!.title = {
				display: true,
				text: `Raw ${rawDmg} → ${pipeline.hpLost} HP lost (AP ${defender.ap}, Pen ${attacker.pen}, Res ${defender.resilience})`,
				color: "#e0dfe6",
			};
			chartRef.current.update();
			return;
		}

		const config: ChartConfiguration = {
			type: "bar",
			data: { labels, datasets },
			options: {
				indexAxis: "y",
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: `Raw ${rawDmg} → ${pipeline.hpLost} HP lost (AP ${defender.ap}, Pen ${attacker.pen}, Res ${defender.resilience})`,
						color: "#e0dfe6",
					},
					legend: { display: true, position: "bottom" },
				},
				scales: {
					x: {
						stacked: true,
						title: { display: true, text: "Damage" },
						grid: { color: "#1e1e24" },
					},
					y: {
						stacked: true,
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
	}, [rawDmg, defender, attacker]);

	return (
		<div>
			<div class="field-row" style={{ marginBottom: "0.5rem" }}>
				<label class="compact-field" style={{ flex: 1 }}>
					<span class="field-label">Raw Damage: {rawDmg}</span>
					<input
						type="range"
						min={0}
						max={40}
						value={rawDmg}
						onInput={(e) => setRawDmg(parseInt((e.target as HTMLInputElement).value, 10))}
						style={{ width: "100%" }}
					/>
				</label>
			</div>
			<div class="chart-container">
				<canvas ref={canvasRef} />
			</div>
		</div>
	);
}
