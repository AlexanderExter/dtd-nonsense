export const POOL_COLORS = ["#d4a84b", "#60a5fa", "#4ade80", "#f87171"];
export const MAX_POOLS = 4;
export const TRIALS = 100_000;
export const TN_MIN = 5;
export const TN_MAX = 50;
export const TN_STEP = 1;
export const DEBOUNCE_MS = 300;
export const CACHE_MAX = 20;

export const TN_LABELS: Record<number, string> = {
	5: "Mundane",
	10: "Easy",
	15: "Average",
	20: "Hard",
	25: "Very Hard",
	30: "Heroic",
	35: "Never Done Before",
	40: "Never to be Done Again",
};

export const RAISE_CHECK_LABELS = [
	"3+ Checks",
	"2 Checks",
	"1 Check / Near Miss",
	"Success (0 Raises)",
	"1 Raise",
	"2 Raises",
	"3+ Raises",
];

export const RAISE_CHECK_COLORS = ["#dc2626", "#f87171", "#fbbf24", "#4ade80", "#22d3ee", "#818cf8", "#c084fc"];

export interface PoolConfig {
	numDice: number;
	keepDice: number;
	modifier: number;
}

export interface SimulationResult {
	id: number;
	mean: number;
	median: number;
	stdDev: number;
	min: number;
	max: number;
	histogram: number[];
	successRates: Record<number, number>;
	raiseChecks: number[];
}

export function poolLabel(pool: PoolConfig): string {
	const mod = pool.modifier > 0 ? `+${pool.modifier}` : pool.modifier < 0 ? `${pool.modifier}` : "";
	return `${pool.numDice}k${pool.keepDice}${mod}`;
}
