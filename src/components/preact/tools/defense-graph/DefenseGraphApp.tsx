import { signal } from "@preact/signals";
import { Chart, registerables } from "chart.js";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { useWorker } from "@/hooks/use-worker";
import { derived } from "@/lib/dtd/derived";
import { ArmorTradeoffChart } from "./ArmorTradeoffChart";
import { AttackerInput } from "./AttackerInput";
import {
	ATTACKER_PRESETS,
	type AttackerConfig,
	buildSimConfig,
	DEBOUNCE_MS,
	DEFENDER_PRESETS,
	type DefenderConfig,
	type DefenderPreset,
	HIT_LOCATIONS,
	type SimulationResult,
} from "./constants";
import { DefenderInput } from "./DefenderInput";
import { EffectiveHPChart } from "./EffectiveHPChart";
import { HitLocationHeatmap } from "./HitLocationHeatmap";
import { HitProbabilityChart } from "./HitProbabilityChart";
import { SummaryTable } from "./SummaryTable";
import { WaterfallChart } from "./WaterfallChart";

// =========================================================================
// Chart.js one-time setup
// =========================================================================

let chartRegistered = false;
function ensureChartSetup() {
	if (chartRegistered) return;
	Chart.register(...registerables);
	Chart.defaults.color = "#94929d";
	Chart.defaults.borderColor = "#2a2a32";
	chartRegistered = true;
}

// =========================================================================
// Module-level signals
// =========================================================================

const defender = signal<DefenderPreset>({ ...DEFENDER_PRESETS.unarmored });

const attacker = signal<AttackerConfig>({ ...ATTACKER_PRESETS.lasgun });

const locationAP = signal<Record<string, number>>(
	Object.fromEntries(Object.keys(HIT_LOCATIONS).map((loc) => [loc, 0])),
);

const sdOverride = signal<number | null>(null);
const simResult = signal<SimulationResult | null>(null);
const toastMessage = signal("");

// =========================================================================
// Root component
// =========================================================================

export function DefenseGraphApp() {
	const workerUrl = new URL("../../../../workers/defense-worker.ts", import.meta.url);
	const worker = useWorker<SimulationResult>(workerUrl);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Build full DefenderConfig from signals + derived stats
	function buildDefenderConfig(): DefenderConfig {
		const d = defender.value;
		const effectiveDex = Math.min(d.dex, d.maxDex);
		const sd =
			sdOverride.value != null ? sdOverride.value : derived.calculateSD(effectiveDex, d.wis, d.size, d.halfling);
		const hp = derived.calculateHP(d.con, d.wil);
		const resilience = derived.calculateResilience(d.size, d.level);
		const mentalDef = derived.calculateMentalDefense(d.composure);

		return {
			...d,
			sd,
			hp,
			resilience,
			mentalDef,
			locationAP: locationAP.value,
		};
	}

	function runSimulation() {
		const def = buildDefenderConfig();
		const atk = attacker.value;
		const simInput = buildSimConfig(def, atk);

		worker.run(simInput as unknown as Record<string, unknown>).then((result) => {
			simResult.value = result;
		});
	}

	function scheduleSimulation() {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => runSimulation(), DEBOUNCE_MS);
	}

	function showToast(message: string) {
		toastMessage.value = message;
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => {
			toastMessage.value = "";
		}, 2500);
	}

	// Preset handlers
	const handleDefenderPreset = useCallback((key: string) => {
		const preset = DEFENDER_PRESETS[key];
		if (!preset) return;
		defender.value = { ...preset };

		const ap = preset.ap;
		locationAP.value = Object.fromEntries(Object.keys(HIT_LOCATIONS).map((loc) => [loc, ap]));
		sdOverride.value = null;

		showToast(`Defender: ${key}`);
		scheduleSimulation();
	}, []);

	const handleAttackerPreset = useCallback((key: string) => {
		const preset = ATTACKER_PRESETS[key];
		if (!preset) return;
		attacker.value = { ...preset };

		showToast(`Attacker: ${key}`);
		scheduleSimulation();
	}, []);

	// Worker-based simulation runner for child components
	const runChildSimulation = useCallback(
		(cfg: Record<string, unknown>): Promise<SimulationResult> => {
			return worker.run(cfg);
		},
		[worker],
	);

	// Init + reactive simulation
	useEffect(() => {
		ensureChartSetup();
		runSimulation();
		return () => {
			worker.cleanup();
			if (debounceRef.current) clearTimeout(debounceRef.current);
			if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		};
	}, []);

	// Re-run simulation when inputs change
	useEffect(() => {
		scheduleSimulation();
	}, [defender.value, attacker.value, locationAP.value, sdOverride.value]);

	const def = buildDefenderConfig();
	const atk = attacker.value;

	return (
		<>
			<section class="input-panel">
				<DefenderInput
					defender={defender}
					locationAP={locationAP}
					sdOverride={sdOverride}
					onPresetApply={handleDefenderPreset}
				/>
				<AttackerInput attacker={attacker} onPresetApply={handleAttackerPreset} />
			</section>

			<main class="graphs-grid">
				<div class="card graph-card graph-card-wide">
					<div class="card-header">
						<h3>Damage Pipeline Waterfall</h3>
					</div>
					<WaterfallChart defender={def} attacker={atk} />
				</div>

				<div class="card graph-card">
					<div class="card-header">
						<h3>Effective HP Graph</h3>
					</div>
					<EffectiveHPChart defender={def} attacker={atk} />
				</div>

				<div class="card graph-card">
					<div class="card-header">
						<h3>Hit Probability &amp; Expected Damage</h3>
					</div>
					<HitProbabilityChart defender={def} attacker={atk} runSimulation={runChildSimulation} />
				</div>

				<div class="card graph-card">
					<div class="card-header">
						<h3>Armor Weight Trade-off</h3>
					</div>
					<ArmorTradeoffChart defender={def} attacker={atk} />
				</div>

				<div class="card graph-card">
					<div class="card-header">
						<h3>Location Coverage Heat Map</h3>
					</div>
					<HitLocationHeatmap defender={def} attacker={atk} />
				</div>

				<div class="card graph-card stats-card graph-card-wide">
					<div class="card-header">
						<h3>Defense Summary</h3>
					</div>
					<SummaryTable defender={def} attacker={atk} simResult={simResult.value} />
				</div>
			</main>

			{toastMessage.value && (
				<output class="toast visible" aria-live="polite">
					{toastMessage.value}
				</output>
			)}
		</>
	);
}
