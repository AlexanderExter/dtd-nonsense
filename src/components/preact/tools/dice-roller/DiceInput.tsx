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
		<div class="flex flex-wrap items-end gap-lg justify-center mb-lg">
			<div class="flex flex-col gap-xs">
				<label htmlFor="dice-rolled" class="text-text-dim text-sm uppercase tracking-wide">
					Roll
				</label>
				<div class="flex items-center gap-xs bg-bg p-sm rounded-md border border-surface-alt">
					<input
						id="dice-rolled"
						type="number"
						min={1}
						max={10}
						value={numDice}
						class="w-[60px] text-center text-2xl font-bold bg-surface border border-surface-alt rounded-sm text-text-primary p-sm focus:outline-none focus:border-accent"
						onInput={handleNumChange}
					/>
					<span class="text-2xl font-bold text-accent">k</span>
					<input
						type="number"
						min={1}
						max={10}
						value={keepDice}
						class="w-[60px] text-center text-2xl font-bold bg-surface border border-surface-alt rounded-sm text-text-primary p-sm focus:outline-none focus:border-accent"
						onInput={handleKeepChange}
					/>
					<span class="text-2xl font-bold text-accent">+</span>
					<input
						type="number"
						min={-20}
						max={20}
						value={modifier}
						class="w-[60px] text-center text-2xl font-bold bg-surface border border-surface-alt rounded-sm text-text-primary p-sm focus:outline-none focus:border-accent"
						onInput={handleModChange}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-xs">
				<label htmlFor="dice-tn" class="text-text-dim text-sm uppercase tracking-wide">
					Target Number
				</label>
				<input
					id="dice-tn"
					type="number"
					min={5}
					max={50}
					value={targetNumber}
					class="w-[80px] text-center text-2xl font-bold bg-surface border border-surface-alt rounded-sm text-text-primary p-sm focus:outline-none focus:border-accent"
					onInput={handleTNChange}
				/>
			</div>

			<button type="button" class="btn btn-accent p-md px-xl text-xl h-fit" onClick={onRoll}>
				🎲 Roll!
			</button>
		</div>
	);
}
