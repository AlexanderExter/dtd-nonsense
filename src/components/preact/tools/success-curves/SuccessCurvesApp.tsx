import { signal } from "@preact/signals";
import { Chart, registerables } from "chart.js";
import { useEffect, useRef } from "preact/hooks";
import { useWorker } from "@/hooks/use-worker";
import { ControlsRow } from "./ControlsRow";
import type { PoolConfig, SimulationResult } from "./constants";
import { CACHE_MAX, DEBOUNCE_MS, MAX_POOLS, TN_MAX, TN_MIN, TN_STEP, TRIALS } from "./constants";
import { HistogramChart } from "./HistogramChart";
import { RaiseDistChart } from "./RaiseDistChart";
import { ShareButton } from "./ShareButton";
import { SimulationInput } from "./SimulationInput";
import { StatsTable } from "./StatsTable";
import { SuccessRateChart } from "./SuccessRateChart";

// =========================================================================
// Module-level signals
// =========================================================================

const pools = signal<PoolConfig[]>([{ numDice: 5, keepDice: 3, modifier: 0 }]);
const selectedTN = signal(15);
const activeStunt = signal(0);
const results = signal<Map<number, SimulationResult>>(new Map());
const toastMessage = signal("");

// =========================================================================
// Simulation cache
// =========================================================================

const simulationCache = new Map<string, SimulationResult>();

function cacheKey(pool: PoolConfig): string {
	return `${pool.numDice}k${pool.keepDice}+${pool.modifier}`;
}

function cacheSet(key: string, value: SimulationResult) {
	simulationCache.set(key, value);
	if (simulationCache.size > CACHE_MAX) {
		const firstKey = simulationCache.keys().next().value;
		if (firstKey !== undefined) simulationCache.delete(firstKey);
	}
}

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
// Root component
// =========================================================================

export function SuccessCurvesApp() {
	const workerUrl = new URL("../../../../workers/simulation-worker.ts", import.meta.url);
	const worker = useWorker<SimulationResult>(workerUrl);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// ---------------------------------------------------------------
	// Simulation
	// ---------------------------------------------------------------

	function runAllSimulations() {
		const currentPools = pools.value;
		const pending: Promise<SimulationResult>[] = [];
		const indices: number[] = [];
		const cached = new Map<number, SimulationResult>();

		for (let i = 0; i < currentPools.length; i++) {
			const pool = currentPools[i];
			const key = cacheKey(pool);
			const hit = simulationCache.get(key);
			if (hit) {
				cached.set(i, hit);
			} else {
				indices.push(i);
				pending.push(
					worker.run({
						numDice: pool.numDice,
						keepDice: pool.keepDice,
						modifier: pool.modifier,
						trials: TRIALS,
						tnMin: TN_MIN,
						tnMax: TN_MAX,
						tnStep: TN_STEP,
						selectedTN: selectedTN.value,
					}),
				);
			}
		}

		if (pending.length === 0) {
			results.value = cached;
			return;
		}

		Promise.all(pending).then((workerResults) => {
			const merged = new Map(cached);
			for (let j = 0; j < workerResults.length; j++) {
				const poolIdx = indices[j];
				const result = workerResults[j];
				const key = cacheKey(currentPools[poolIdx]);
				cacheSet(key, result);
				merged.set(poolIdx, result);
			}
			results.value = merged;
		});
	}

	function scheduleSimulation() {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => runAllSimulations(), DEBOUNCE_MS);
	}

	// ---------------------------------------------------------------
	// Pool management
	// ---------------------------------------------------------------

	function updatePool(index: number, partial: Partial<PoolConfig>) {
		const updated = pools.value.map((p, i) => (i === index ? { ...p, ...partial } : p));
		pools.value = updated;
		scheduleSimulation();
	}

	function removePool(index: number) {
		pools.value = pools.value.filter((_, i) => i !== index);
		scheduleSimulation();
	}

	function addPool() {
		if (pools.value.length >= MAX_POOLS) return;
		pools.value = [...pools.value, { numDice: 5, keepDice: 3, modifier: 0 }];
		scheduleSimulation();
	}

	function clearAll() {
		pools.value = [{ numDice: 5, keepDice: 3, modifier: 0 }];
		activeStunt.value = 0;
		scheduleSimulation();
	}

	function setTN(tn: number) {
		selectedTN.value = tn;
		scheduleSimulation();
	}

	// ---------------------------------------------------------------
	// Presets, stunts, helper
	// ---------------------------------------------------------------

	function handlePreset(numDice: number, keepDice: number) {
		const updated = [...pools.value];
		updated[0] = { numDice, keepDice, modifier: 0 };
		pools.value = updated;
		scheduleSimulation();
	}

	function handleStunt(level: number) {
		activeStunt.value = activeStunt.value === level ? 0 : level;
	}

	function handleHelperApply(rolled: number, kept: number) {
		const updated = [...pools.value];
		updated[0] = { numDice: rolled, keepDice: kept, modifier: 0 };
		pools.value = updated;
		scheduleSimulation();
	}

	// ---------------------------------------------------------------
	// URL sharing & toast
	// ---------------------------------------------------------------

	function shareURL() {
		const params = pools.value.map(
			(p) => `${p.numDice}k${p.keepDice}${p.modifier ? (p.modifier > 0 ? "+" : "") + p.modifier : ""}`,
		);
		const hash = `#pools=${params.join(",")}&tn=${selectedTN.value}`;
		const url = `${window.location.href.split("#")[0]}${hash}`;

		if (navigator.clipboard) {
			navigator.clipboard.writeText(url).then(
				() => showToast("URL copied to clipboard"),
				() => showToast("URL updated in address bar"),
			);
		}
		window.location.hash = hash.slice(1);
	}

	function loadFromURL() {
		const hash = window.location.hash.slice(1);
		if (!hash) return;
		const params = new URLSearchParams(hash);
		const poolStr = params.get("pools");
		const tnStr = params.get("tn");

		if (poolStr) {
			const parsed = poolStr
				.split(",")
				.map((s) => {
					const m = s.trim().match(/^(\d+)k(\d+)([+-]\d+)?$/);
					if (!m) return null;
					return {
						numDice: parseInt(m[1], 10),
						keepDice: parseInt(m[2], 10),
						modifier: m[3] ? parseInt(m[3], 10) : 0,
					};
				})
				.filter(Boolean)
				.slice(0, MAX_POOLS) as PoolConfig[];
			if (parsed.length > 0) pools.value = parsed;
		}

		if (tnStr) {
			const tn = parseInt(tnStr, 10);
			if (!Number.isNaN(tn) && tn >= TN_MIN && tn <= TN_MAX) {
				selectedTN.value = tn;
			}
		}
	}

	function showToast(message: string) {
		toastMessage.value = message;
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => {
			toastMessage.value = "";
		}, 2500);
	}

	// ---------------------------------------------------------------
	// Effects
	// ---------------------------------------------------------------

	// Chart.js setup + initial load
	useEffect(() => {
		ensureChartSetup();
		loadFromURL();
		runAllSimulations();
		return () => {
			worker.cleanup();
			if (debounceRef.current) clearTimeout(debounceRef.current);
			if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		};
	}, []);

	// ---------------------------------------------------------------
	// Render
	// ---------------------------------------------------------------

	return (
		<div class="dtd-tool">
			<SimulationInput
				pools={pools}
				selectedTN={selectedTN}
				onUpdatePool={updatePool}
				onRemovePool={removePool}
				onSetTN={setTN}
			/>
			<ControlsRow
				activeStunt={activeStunt}
				onPresetClick={handlePreset}
				onStuntClick={handleStunt}
				onHelperApply={handleHelperApply}
			/>
			<div class="pool-actions">
				<button
					type="button"
					class="btn btn-secondary"
					onClick={addPool}
					disabled={pools.value.length >= MAX_POOLS}
				>
					+ Add Pool
				</button>
				<button type="button" class="btn btn-ghost" onClick={clearAll}>
					Clear All
				</button>
				<ShareButton onShare={shareURL} />
			</div>
			<main class="graphs-grid">
				<SuccessRateChart results={results} pools={pools} selectedTN={selectedTN} onSetTN={setTN} />
				<HistogramChart results={results} pools={pools} selectedTN={selectedTN} />
				<RaiseDistChart results={results} pools={pools} />
				<StatsTable results={results} pools={pools} selectedTN={selectedTN} />
			</main>
			{toastMessage.value && (
				<output class="toast visible" aria-live="polite">
					{toastMessage.value}
				</output>
			)}
		</div>
	);
}
