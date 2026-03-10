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
		<section
			class="max-w-[1100px] mx-auto px-md py-lg flex flex-col gap-md print:hidden"
			aria-label="Dice pool configuration"
		>
			<div id="pool-rows" class="flex flex-col gap-sm">
				{pools.value.map((pool, i) => (
					<div
						class="flex items-center gap-sm bg-surface border border-border rounded-md px-md py-sm flex-wrap"
						key={i}
					>
						<span class="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: POOL_COLORS[i] }} />
						<label class="flex items-center gap-xs m-0">
							<span class="text-[0.75rem] text-text-muted uppercase tracking-[0.5px] w-12 shrink-0">
								Rolled
							</span>
							<input
								type="range"
								class="w-[90px] max-[600px]:w-[70px] accent-accent"
								min={1}
								max={15}
								value={pool.numDice}
								onInput={(e) =>
									handlePoolInput(i, "numDice", parseInt((e.target as HTMLInputElement).value, 10))
								}
							/>
							<input
								type="number"
								class="w-14 text-center px-sm py-xs"
								min={1}
								max={15}
								value={pool.numDice}
								onInput={(e) =>
									handlePoolInput(i, "numDice", parseInt((e.target as HTMLInputElement).value, 10))
								}
							/>
						</label>
						<span class="text-[1.1rem] font-bold text-accent mx-xs">k</span>
						<label class="flex items-center gap-xs m-0">
							<span class="text-[0.75rem] text-text-muted uppercase tracking-[0.5px] w-12 shrink-0">
								Kept
							</span>
							<input
								type="range"
								class="w-[90px] max-[600px]:w-[70px] accent-accent"
								min={1}
								max={Math.min(pool.numDice, 10)}
								value={pool.keepDice}
								onInput={(e) =>
									handlePoolInput(i, "keepDice", parseInt((e.target as HTMLInputElement).value, 10))
								}
							/>
							<input
								type="number"
								class="w-14 text-center px-sm py-xs"
								min={1}
								max={Math.min(pool.numDice, 10)}
								value={pool.keepDice}
								onInput={(e) =>
									handlePoolInput(i, "keepDice", parseInt((e.target as HTMLInputElement).value, 10))
								}
							/>
						</label>
						<label class="flex items-center gap-xs m-0">
							<span class="text-[0.75rem] text-text-muted uppercase tracking-[0.5px] w-12 shrink-0">
								Mod
							</span>
							<input
								type="number"
								class="w-14 text-center px-sm py-xs"
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
								class="ml-auto px-sm bg-transparent border-none text-text-dim text-[1.1rem] cursor-pointer rounded-sm hover:text-error hover:bg-error-bg"
								title="Remove pool"
								onClick={() => onRemovePool(i)}
							>
								×
							</button>
						)}
					</div>
				))}
			</div>

			<div class="flex items-center gap-md bg-surface border border-border rounded-md px-md py-sm max-[600px]:flex-wrap">
				<label class="flex items-center gap-xs m-0 flex-1">
					<span class="text-[0.75rem] text-text-muted uppercase tracking-[0.5px] w-auto shrink-0">
						Target Number
					</span>
					<input
						type="range"
						class="flex-1 min-w-[120px] accent-accent"
						min={TN_MIN}
						max={TN_MAX}
						step={1}
						value={selectedTN}
						onInput={(e) => onSetTN(parseInt((e.target as HTMLInputElement).value, 10))}
					/>
					<input
						type="number"
						class="w-14 text-center px-sm py-xs"
						min={TN_MIN}
						max={TN_MAX}
						value={selectedTN}
						onInput={(e) => {
							const v = parseInt((e.target as HTMLInputElement).value, 10);
							if (!Number.isNaN(v) && v >= TN_MIN && v <= TN_MAX) onSetTN(v);
						}}
					/>
				</label>
				<span class="text-[0.85rem] text-accent font-semibold min-w-40 text-right max-[600px]:min-w-0 max-[600px]:text-left">
					{getDifficultyLabel(selectedTN.value)}
				</span>
			</div>
		</section>
	);
}
