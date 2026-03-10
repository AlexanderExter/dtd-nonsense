import { Chart, type ChartConfiguration } from "chart.js";
import { useEffect, useRef } from "preact/hooks";
import { ARMOR_COMPARE_COLORS, type AttackerConfig, type DefenderConfig } from "./constants";

interface ArmorTradeoffChartProps {
	defender: DefenderConfig;
	attacker: AttackerConfig;
}

interface ArmorTier {
	label: string;
	ap: number;
	maxDex: number;
}

const ARMOR_TIERS: ArmorTier[] = [
	{ label: "No Armor (AP 0, Dex 5)", ap: 0, maxDex: 5 },
	{ label: "Light (AP 3, MaxDex 5)", ap: 3, maxDex: 5 },
	{ label: "Heavy (AP 7, MaxDex 2)", ap: 7, maxDex: 2 },
	{ label: "Power (AP 10, MaxDex 2)", ap: 10, maxDex: 2 },
];

function calculateMitigation(
	raw: number,
	ap: number,
	pen: number,
	aura: number,
	cover: number,
	resilience: number,
	tearing: boolean,
): number {
	const effectiveAP = Math.max(0, ap - pen);
	let remaining = raw;
	remaining = Math.max(0, remaining - effectiveAP);
	remaining = Math.max(0, remaining - cover);
	remaining = Math.max(0, remaining - aura);

	let hpLost = resilience > 0 ? Math.floor(remaining / resilience) : remaining;
	if (tearing && remaining > 0 && hpLost < 1) hpLost = 1;

	const finalDamage = hpLost * (resilience || 1);
	return raw - finalDamage;
}

export function ArmorTradeoffChart({ defender, attacker }: ArmorTradeoffChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const labels: number[] = [];
		for (let raw = 0; raw <= 40; raw++) {
			labels.push(raw);
		}

		const datasets = ARMOR_TIERS.map((tier, i) => {
			const data = labels.map((raw) =>
				calculateMitigation(
					raw,
					tier.ap,
					attacker.pen,
					defender.aura,
					defender.cover,
					defender.resilience,
					attacker.tearing,
				),
			);
			return {
				label: tier.label,
				data,
				borderColor: ARMOR_COMPARE_COLORS[i],
				backgroundColor: "transparent",
				tension: 0.1,
			};
		});

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
						title: { display: true, text: "Total Mitigation" },
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
		<div class="chart-container">
			<canvas ref={canvasRef} />
		</div>
	);
}
