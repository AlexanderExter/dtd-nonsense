import { useEffect, useRef } from "preact/hooks";
import { type AttackerConfig, type DefenderConfig, HIT_LOCATIONS } from "./constants";

interface HitLocationHeatmapProps {
	defender: DefenderConfig;
	attacker: AttackerConfig;
}

interface BodyRegion {
	loc: string;
	label: string;
	x: number;
	y: number;
	w: number;
	h: number;
	prob: number;
}

const BODY_REGIONS: BodyRegion[] = [
	{ loc: "head", label: "Head", x: 115, y: 10, w: 70, h: 50, prob: 0.1 },
	{ loc: "body", label: "Body", x: 90, y: 70, w: 120, h: 100, prob: 0.4 },
	{ loc: "gizzards", label: "Gizzards", x: 100, y: 175, w: 100, h: 40, prob: 0.1 },
	{ loc: "larm", label: "L.Arm", x: 10, y: 70, w: 70, h: 120, prob: 0.1 },
	{ loc: "rarm", label: "R.Arm", x: 220, y: 70, w: 70, h: 120, prob: 0.1 },
	{ loc: "lleg", label: "L.Leg", x: 90, y: 225, w: 55, h: 140, prob: 0.1 },
	{ loc: "rleg", label: "R.Leg", x: 155, y: 225, w: 55, h: 140, prob: 0.1 },
];

function apToColor(effectiveAP: number, maxAP: number): string {
	if (maxAP <= 0) return "rgba(239, 68, 68, 0.7)";
	const ratio = Math.min(effectiveAP / maxAP, 1);
	const r = Math.round(239 * (1 - ratio) + 59 * ratio);
	const g = Math.round(68 * (1 - ratio) + 130 * ratio);
	const b = Math.round(68 * (1 - ratio) + 246 * ratio);
	return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

export function HitLocationHeatmap({ defender, attacker }: HitLocationHeatmapProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const maxAP = Math.max(...Object.values(defender.locationAP).map((v) => Math.max(0, v - attacker.pen)), 1);

	const weightedAP = Object.entries(HIT_LOCATIONS).reduce((sum, [loc, info]) => {
		const locAP = defender.locationAP[loc] || 0;
		return sum + Math.max(0, locAP - attacker.pen) * info.prob;
	}, 0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw body outline
		ctx.strokeStyle = "#3a3a44";
		ctx.lineWidth = 1;

		for (const region of BODY_REGIONS) {
			const locAP = defender.locationAP[region.loc] || 0;
			const effAP = Math.max(0, locAP - attacker.pen);
			const color = apToColor(effAP, maxAP);

			// Fill region
			ctx.fillStyle = color;
			ctx.fillRect(region.x, region.y, region.w, region.h);
			ctx.strokeRect(region.x, region.y, region.w, region.h);

			// Label text
			ctx.fillStyle = "#e0dfe6";
			ctx.font = "bold 11px system-ui";
			ctx.textAlign = "center";
			ctx.fillText(region.label, region.x + region.w / 2, region.y + region.h / 2 - 8);

			ctx.font = "10px system-ui";
			ctx.fillText(`AP ${effAP}`, region.x + region.w / 2, region.y + region.h / 2 + 6);
			ctx.fillText(`${(region.prob * 100).toFixed(0)}%`, region.x + region.w / 2, region.y + region.h / 2 + 20);
		}
	}, [defender, attacker, maxAP]);

	return (
		<div class="flex gap-md items-start p-md max-[600px]:flex-col max-[600px]:items-center">
			<canvas ref={canvasRef} width={300} height={400} class="border border-border rounded-sm" />
			<div class="flex flex-col gap-xs text-[0.8rem] text-text-muted">
				{BODY_REGIONS.map((region) => {
					const locAP = defender.locationAP[region.loc] || 0;
					const effAP = Math.max(0, locAP - attacker.pen);
					return (
						<div key={region.loc} class="flex items-center gap-sm mb-xs">
							<span
								class="inline-block w-3 h-3 border border-border"
								style={{ backgroundColor: apToColor(effAP, maxAP) }}
							/>
							<span class="text-[0.85rem]">
								{region.label}: AP {effAP}
							</span>
						</div>
					);
				})}
				<div class="mt-sm font-bold text-[0.85rem]">Weighted AP: {weightedAP.toFixed(1)}</div>
			</div>
		</div>
	);
}
