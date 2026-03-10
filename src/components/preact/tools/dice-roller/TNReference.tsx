export function TNReference() {
	const difficulties = [
		{ name: "Trivial", value: "5" },
		{ name: "Easy", value: "10" },
		{ name: "Average", value: "15" },
		{ name: "Challenging", value: "20" },
		{ name: "Hard", value: "25" },
		{ name: "Very Hard", value: "30" },
		{ name: "Legendary", value: "35+" },
	];

	return (
		<div class="panel mt-lg">
			<h3 class="text-center m-0 mb-md text-text-dim">Target Number Reference</h3>
			<div class="grid gap-xs">
				{difficulties.map((d) => (
					<div class="flex justify-between p-xs px-sm bg-bg rounded-sm" key={d.name}>
						<span class="text-text-dim">{d.name}</span>
						<span class="font-bold font-mono text-accent">{d.value}</span>
					</div>
				))}
			</div>
			<p class="mt-md text-text-dim text-sm leading-relaxed">
				<strong>Raises:</strong> Every 5 above TN = 1 Raise
				<br />
				<strong>Checks:</strong> Every 5 below TN = 1 Check
			</p>
		</div>
	);
}
