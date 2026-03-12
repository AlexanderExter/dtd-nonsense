import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { calculateOutcome, roll } from "@/lib/dtd/dice";
import type { DiceResult } from "@/lib/dtd/types";
import { DiceInput } from "./DiceInput";
import { DiceResultDisplay } from "./DiceResultDisplay";
import { PresetBar } from "./PresetBar";
import type { HistoryEntry } from "./RollHistory";
import { RollHistory } from "./RollHistory";
import { TNReference } from "./TNReference";

const numDice = signal(5);
const keepDice = signal(3);
const modifier = signal(0);
const targetNumber = signal(15);
const currentResult = signal<DiceResult | null>(null);

const MAX_HISTORY = 50;

export function DiceRollerApp() {
	const history = useLocalStorage<HistoryEntry[]>("dtd-roll-history", []);

	const executeRoll = () => {
		const num = Math.max(1, numDice.value);
		const keep = Math.max(1, Math.min(num, keepDice.value));
		numDice.value = num;
		keepDice.value = keep;

		const result = roll(num, keep, modifier.value);
		const outcome = calculateOutcome(result.total, targetNumber.value);

		currentResult.value = result;

		const modStr = modifier.value !== 0 ? (modifier.value > 0 ? `+${modifier.value}` : `${modifier.value}`) : "";
		const entry: HistoryEntry = {
			notation: `${num}k${keep}${modStr}`,
			num,
			keep,
			modifier: modifier.value,
			tn: targetNumber.value,
			total: result.total,
			success: outcome.success,
			raises: outcome.raises,
			checks: outcome.checks,
			timestamp: Date.now(),
		};

		history.value = [entry, ...history.value].slice(0, MAX_HISTORY);
	};

	const replayRoll = (index: number) => {
		const entry = history.value[index];
		if (!entry) return;
		numDice.value = entry.num;
		keepDice.value = entry.keep;
		modifier.value = entry.modifier;
		targetNumber.value = entry.tn;
		executeRoll();
	};

	const clearHistory = () => {
		history.value = [];
		currentResult.value = null;
	};

	const applyPreset = (rolled: number, kept: number) => {
		numDice.value = rolled;
		keepDice.value = kept;
		executeRoll();
	};

	useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "BUTTON") {
				e.preventDefault();
				executeRoll();
			}
			if (e.key === "Escape") {
				numDice.value = 5;
				keepDice.value = 3;
				modifier.value = 0;
				targetNumber.value = 15;
			}
		};
		document.addEventListener("keydown", handleKeydown);
		return () => document.removeEventListener("keydown", handleKeydown);
	}, []);

	return (
		<div class="grid grid-cols-[1fr_320px] gap-lg max-w-[1200px] mx-auto p-lg max-[900px]:grid-cols-1">
			<section>
				<div class="panel p-xl">
					<h2 class="text-center m-0 mb-lg text-accent">Roll Dice</h2>
					<DiceInput
						numDice={numDice}
						keepDice={keepDice}
						modifier={modifier}
						targetNumber={targetNumber}
						onRoll={executeRoll}
					/>
					<PresetBar onPreset={applyPreset} />
					{currentResult.value && (
						<DiceResultDisplay result={currentResult.value} targetNumber={targetNumber.value} />
					)}
				</div>
				<TNReference targetNumber={targetNumber} />
			</section>
			<aside class="self-start sticky top-lg max-[900px]:order-first">
				<RollHistory history={history} onReplay={replayRoll} onClear={clearHistory} />
			</aside>
		</div>
	);
}
