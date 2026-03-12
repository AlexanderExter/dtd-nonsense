import type { Signal } from "@preact/signals";

interface TNReferenceProps {
	targetNumber: Signal<number>;
}

export function TNReference({ targetNumber }: TNReferenceProps) {
	const difficulties = [
		{ name: "Trivial", value: 5 },
		{ name: "Easy", value: 10 },
		{ name: "Average", value: 15 },
		{ name: "Challenging", value: 20 },
		{ name: "Hard", value: 25 },
		{ name: "Very Hard", value: 30 },
		{ name: "Legendary", value: 35 },
	];

	const tn = targetNumber.value;
	const matchedValue = difficulties.find((d) => d.value === tn)?.value;

	return (
		<div class="panel mt-lg">
			<h3 class="text-center m-0 mb-md text-text-dim">Target Number Reference</h3>
			<div class="grid gap-xs">
				{difficulties.map((d) => (
					<button
						type="button"
						key={d.name}
						class={[
							"flex justify-between p-xs px-sm rounded-sm border-0 cursor-pointer text-[inherit] font-[inherit] transition-colors duration-100",
							d.value === matchedValue ? "bg-accent/20 ring-1 ring-accent" : "bg-bg hover:bg-surface",
						].join(" ")}
						onClick={() => {
							targetNumber.value = d.value;
						}}
					>
						<span class="text-text-dim">{d.name}</span>
						<span class="font-bold font-mono text-accent">
							{d.value}
							{d.value === 35 ? "+" : ""}
						</span>
					</button>
				))}
			</div>
			<div class="mt-md">
				<label class="flex items-center gap-sm text-text-dim text-sm">
					<span>Custom TN:</span>
					<input
						type="number"
						min={1}
						max={99}
						value={tn}
						onInput={(e) => {
							const v = Number.parseInt((e.target as HTMLInputElement).value, 10);
							if (!Number.isNaN(v) && v >= 1) targetNumber.value = v;
						}}
						class="w-16 px-sm py-xs bg-bg border border-border rounded-sm text-center font-mono text-accent"
					/>
				</label>
			</div>
			<p class="mt-md text-text-dim text-sm leading-relaxed">
				<strong>Raises:</strong> Every 5 above TN = 1 Raise
				<br />
				<strong>Checks:</strong> Every 5 below TN = 1 Check
			</p>
		</div>
	);
}
