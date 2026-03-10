import { calculateOutcome } from "@/lib/dtd/dice";
import type { DiceResult } from "@/lib/dtd/types";

interface DiceResultDisplayProps {
	result: DiceResult;
	targetNumber: number;
}

function buildKeptIndices(allRolls: DiceResult["allRolls"], keptRolls: DiceResult["keptRolls"]): Set<number> {
	const keptSet = new Set<number>();
	const keptValues = keptRolls.map((d) => d.value);
	for (const keptVal of keptValues) {
		for (let i = 0; i < allRolls.length; i++) {
			if (allRolls[i].value === keptVal && !keptSet.has(i)) {
				keptSet.add(i);
				break;
			}
		}
	}
	return keptSet;
}

function renderOutcomeText(outcome: { success: boolean; raises: number; checks: number }): {
	text: string;
	className: string;
} {
	if (outcome.success) {
		if (outcome.raises > 0) {
			return {
				text: `Success +${outcome.raises} Raise${outcome.raises > 1 ? "s" : ""}`,
				className: "bg-outcome-raises-bg text-gold",
			};
		}
		return {
			text: "Success",
			className: "bg-outcome-success-bg text-outcome-success",
		};
	}
	const text = outcome.checks > 0 ? `Failure (${outcome.checks} Check${outcome.checks > 1 ? "s" : ""})` : "Failure";
	return { text, className: "bg-outcome-failure-bg text-outcome-failure" };
}

export function DiceResultDisplay({ result, targetNumber }: DiceResultDisplayProps) {
	const outcome = calculateOutcome(result.total, targetNumber);
	const keptSet = buildKeptIndices(result.allRolls, result.keptRolls);
	const { text: outcomeText, className: outcomeClass } = renderOutcomeText(outcome);

	return (
		<div class="bg-bg rounded-md p-lg mt-lg animate-slide-in">
			<div class="flex flex-wrap gap-sm justify-center mb-md">
				{result.allRolls.map((die, i) => {
					const isKept = keptSet.has(i);
					const dieClasses = [
						"w-10 h-10 flex items-center justify-center rounded-sm font-bold text-lg border-2 relative",
						isKept ? "bg-accent text-bg border-accent" : "bg-surface border-surface-alt",
						die.exploded && isKept ? "border-gold animate-pulse-once" : "",
						!isKept ? "opacity-40 line-through" : "",
					]
						.filter(Boolean)
						.join(" ");
					return (
						<div key={i} class={dieClasses}>
							{die.value}
							{die.exploded && isKept && <span class="absolute -top-2 -right-2 text-xs">💥</span>}
						</div>
					);
				})}
			</div>
			<div class="flex items-center justify-center gap-lg flex-wrap">
				<div class="text-center">
					<span class="block text-text-dim text-xs uppercase">Total</span>
					<span class="text-5xl font-bold text-text-primary">{result.total}</span>
					{result.modifier !== 0 && (
						<span class="text-base text-text-dim ml-xs">
							({result.diceTotal}
							{result.modifier >= 0 ? "+" : ""}
							{result.modifier})
						</span>
					)}
				</div>
				<div class="flex flex-col items-center text-text-dim text-sm">
					<span>vs TN</span>
					<span class="text-2xl text-text-primary">{targetNumber}</span>
				</div>
				<div class={`p-sm px-lg rounded-md font-bold text-lg ${outcomeClass}`}>{outcomeText}</div>
			</div>
		</div>
	);
}
