import type { Signal } from "@preact/signals";
import type { PoolConfig } from "./constants";
import { POOL_COLORS, TN_LABELS, TN_MAX, TN_MIN } from "./constants";

interface SimulationInputProps {
	pools: Signal<PoolConfig[]>;
	selectedTN: Signal<number>;
	onUpdatePool: (index: number, partial: Partial<PoolConfig>) => void;
	onRemovePool: (index: number) => void;
	onSetTN: (tn: number) => void;
}

function getDifficultyLabel(tn: number): string {
	let best = "";
	for (const [threshold, text] of Object.entries(TN_LABELS)) {
		if (tn >= parseInt(threshold, 10)) best = `${text} (TN ${threshold})`;
	}
	return best || `TN ${tn}`;
}

export function SimulationInput({ pools, selectedTN, onUpdatePool, onRemovePool, onSetTN }: SimulationInputProps) {
	const handlePoolInput = (index: number, param: keyof PoolConfig, value: number) => {
		if (Number.isNaN(value)) return;
		const update: Partial<PoolConfig> = { [param]: value };
		if (param === "numDice" && pools.value[index].keepDice > value) {
			update.keepDice = value;
		}
		onUpdatePool(index, update);
	};

	return (
		<section class="input-panel no-print" aria-label="Dice pool configuration">
			<div id="pool-rows">
				{pools.value.map((pool, i) => (
					<div class="pool-row" key={i}>
						<span class="pool-color-swatch" style={{ background: POOL_COLORS[i] }} />
						<label class="pool-field">
							<span class="field-label">Rolled</span>
							<input
								type="range"
								class="pool-slider"
								min={1}
								max={15}
								value={pool.numDice}
								onInput={(e) =>
									handlePoolInput(i, "numDice", parseInt((e.target as HTMLInputElement).value, 10))
								}
							/>
							<input
								type="number"
								class="pool-input"
								min={1}
								max={15}
								value={pool.numDice}
								onInput={(e) =>
									handlePoolInput(i, "numDice", parseInt((e.target as HTMLInputElement).value, 10))
								}
							/>
						</label>
						<span class="k-separator">k</span>
						<label class="pool-field">
							<span class="field-label">Kept</span>
							<input
								type="range"
								class="pool-slider"
								min={1}
								max={Math.min(pool.numDice, 10)}
								value={pool.keepDice}
								onInput={(e) =>
									handlePoolInput(i, "keepDice", parseInt((e.target as HTMLInputElement).value, 10))
								}
							/>
							<input
								type="number"
								class="pool-input"
								min={1}
								max={Math.min(pool.numDice, 10)}
								value={pool.keepDice}
								onInput={(e) =>
									handlePoolInput(i, "keepDice", parseInt((e.target as HTMLInputElement).value, 10))
								}
							/>
						</label>
						<label class="pool-field pool-field-narrow">
							<span class="field-label">Mod</span>
							<input
								type="number"
								class="pool-input"
								min={-10}
								max={30}
								value={pool.modifier}
								onInput={(e) =>
									handlePoolInput(i, "modifier", parseInt((e.target as HTMLInputElement).value, 10))
								}
							/>
						</label>
						{i > 0 && (
							<button
								type="button"
								class="remove-pool-btn"
								title="Remove pool"
								onClick={() => onRemovePool(i)}
							>
								×
							</button>
						)}
					</div>
				))}
			</div>

			<div class="tn-row">
				<label class="pool-field tn-field">
					<span class="field-label">Target Number</span>
					<input
						type="range"
						min={TN_MIN}
						max={TN_MAX}
						step={1}
						value={selectedTN}
						onInput={(e) => onSetTN(parseInt((e.target as HTMLInputElement).value, 10))}
					/>
					<input
						type="number"
						min={TN_MIN}
						max={TN_MAX}
						value={selectedTN}
						onInput={(e) => {
							const v = parseInt((e.target as HTMLInputElement).value, 10);
							if (!Number.isNaN(v) && v >= TN_MIN && v <= TN_MAX) onSetTN(v);
						}}
					/>
				</label>
				<span class="tn-difficulty">{getDifficultyLabel(selectedTN.value)}</span>
			</div>
		</section>
	);
}
