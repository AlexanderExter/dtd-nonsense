import type { Signal } from "@preact/signals";

interface DiceInputProps {
	numDice: Signal<number>;
	keepDice: Signal<number>;
	modifier: Signal<number>;
	targetNumber: Signal<number>;
	onRoll: () => void;
}

export function DiceInput({ numDice, keepDice, modifier, targetNumber, onRoll }: DiceInputProps) {
	const handleNumChange = (e: Event) => {
		const val = Math.max(1, Math.min(10, parseInt((e.target as HTMLInputElement).value, 10) || 1));
		numDice.value = val;
		if (keepDice.value > val) keepDice.value = val;
	};

	const handleKeepChange = (e: Event) => {
		const val = Math.max(1, Math.min(numDice.value, parseInt((e.target as HTMLInputElement).value, 10) || 1));
		keepDice.value = val;
	};

	const handleModChange = (e: Event) => {
		modifier.value = parseInt((e.target as HTMLInputElement).value, 10) || 0;
	};

	const handleTNChange = (e: Event) => {
		targetNumber.value = Math.max(1, parseInt((e.target as HTMLInputElement).value, 10) || 5);
	};

	return (
		<div class="dice-controls">
			<div class="dice-input-group">
				<label htmlFor="dice-rolled">Roll</label>
				<div class="dice-notation">
					<input
						id="dice-rolled"
						type="number"
						min={1}
						max={10}
						value={numDice}
						class="dice-input"
						onInput={handleNumChange}
					/>
					<span class="dice-k">k</span>
					<input
						type="number"
						min={1}
						max={10}
						value={keepDice}
						class="dice-input"
						onInput={handleKeepChange}
					/>
					<span class="dice-k">+</span>
					<input
						type="number"
						min={-20}
						max={20}
						value={modifier}
						class="dice-input mod-input"
						onInput={handleModChange}
					/>
				</div>
			</div>

			<div class="dice-input-group">
				<label htmlFor="dice-tn">Target Number</label>
				<input
					id="dice-tn"
					type="number"
					min={5}
					max={50}
					value={targetNumber}
					class="dice-input tn-input"
					onInput={handleTNChange}
				/>
			</div>

			<button type="button" class="btn btn-accent btn-roll" onClick={onRoll}>
				🎲 Roll!
			</button>
		</div>
	);
}
