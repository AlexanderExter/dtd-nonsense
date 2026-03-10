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
		<div class="panel reference-panel">
			<h3>Target Number Reference</h3>
			<div class="tn-table">
				{difficulties.map((d) => (
					<div class="tn-row" key={d.name}>
						<span class="tn-diff">{d.name}</span>
						<span class="tn-value">{d.value}</span>
					</div>
				))}
			</div>
			<p class="tn-note">
				<strong>Raises:</strong> Every 5 above TN = 1 Raise
				<br />
				<strong>Checks:</strong> Every 5 below TN = 1 Check
			</p>
		</div>
	);
}
