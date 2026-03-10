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
				className: "raises",
			};
		}
		return { text: "Success", className: "success" };
	}
	const text = outcome.checks > 0 ? `Failure (${outcome.checks} Check${outcome.checks > 1 ? "s" : ""})` : "Failure";
	return { text, className: "failure" };
}

export function DiceResultDisplay({ result, targetNumber }: DiceResultDisplayProps) {
	const outcome = calculateOutcome(result.total, targetNumber);
	const keptSet = buildKeptIndices(result.allRolls, result.keptRolls);
	const { text: outcomeText, className: outcomeClass } = renderOutcomeText(outcome);

	return (
		<div class="result-area" style={{ animation: "slideIn 0.3s ease-out" }}>
			<div class="result-dice">
				{result.allRolls.map((die, i) => {
					const isKept = keptSet.has(i);
					const classes = ["die"];
					if (isKept) classes.push("kept");
					if (die.exploded && isKept) classes.push("exploded");
					if (!isKept) classes.push("dropped");
					return (
						<div key={i} class={classes.join(" ")}>
							{die.value}
						</div>
					);
				})}
			</div>
			<div class="result-summary">
				<div class="result-total-wrapper">
					<span class="result-label">Total</span>
					<span class="result-total">{result.total}</span>
					{result.modifier !== 0 && (
						<span class="result-modifier">
							({result.diceTotal}
							{result.modifier >= 0 ? "+" : ""}
							{result.modifier})
						</span>
					)}
				</div>
				<div class="result-vs">
					<span>vs TN</span>
					<span>{targetNumber}</span>
				</div>
				<div class={`result-outcome ${outcomeClass}`}>{outcomeText}</div>
			</div>
		</div>
	);
}
