import { Chart, type ChartConfiguration } from "chart.js";
import { useEffect, useRef } from "preact/hooks";
import { type AttackerConfig, buildSimConfig, COLORS, type DefenderConfig, type SimulationResult } from "./constants";

interface HitProbabilityChartProps {
	defender: DefenderConfig;
	attacker: AttackerConfig;
	runSimulation: (cfg: Record<string, unknown>) => Promise<SimulationResult>;
}

export function HitProbabilityChart({ defender, attacker, runSimulation }: HitProbabilityChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const sdValues: number[] = [];
		for (let sd = 10; sd <= 40; sd += 2) {
			sdValues.push(sd);
		}

		const simPromises = sdValues.map((sd) => {
			const simInput = buildSimConfig(defender, attacker, sd);
			return runSimulation(simInput as unknown as Record<string, unknown>);
		});

		Promise.all(simPromises).then((results) => {
			if (!isMounted.current) return;

			const hitProbs = results.map((r) => r.hitRate * 100);
			const expDamage = results.map((r) => r.avgHPLost);

			const datasets = [
				{
					label: "P(Hit) %",
					data: hitProbs,
					borderColor: COLORS.hitProb,
					backgroundColor: `${COLORS.hitProb}33`,
					yAxisID: "y",
					tension: 0.2,
				},
				{
					label: "Expected HP Lost",
					data: expDamage,
					borderColor: COLORS.expDamage,
					backgroundColor: `${COLORS.expDamage}33`,
					yAxisID: "y1",
					tension: 0.2,
				},
			];

			if (chartRef.current) {
				chartRef.current.data.labels = sdValues;
				chartRef.current.data.datasets = datasets;
				chartRef.current.update();
				return;
			}

			const config: ChartConfiguration = {
				type: "line",
				data: { labels: sdValues, datasets },
				options: {
					responsive: true,
					maintainAspectRatio: false,
					interaction: { mode: "index", intersect: false },
					plugins: {
						legend: { display: true, position: "bottom" },
					},
					scales: {
						x: {
							title: { display: true, text: "Defender SD" },
							grid: { color: "#1e1e24" },
						},
						y: {
							type: "linear",
							position: "left",
							title: { display: true, text: "P(Hit) %" },
							min: 0,
							max: 100,
							grid: { color: "#1e1e24" },
						},
						y1: {
							type: "linear",
							position: "right",
							title: { display: true, text: "Expected HP Lost" },
							min: 0,
							grid: { drawOnChartArea: false },
						},
					},
				},
			};

			chartRef.current = new Chart(ctx, config);
		});

		return () => {
			chartRef.current?.destroy();
			chartRef.current = null;
		};
	}, [defender, attacker, runSimulation]);

	return (
		<div class="relative w-full min-h-[280px]">
			<canvas ref={canvasRef} class="w-full! h-full!" />
		</div>
	);
}
