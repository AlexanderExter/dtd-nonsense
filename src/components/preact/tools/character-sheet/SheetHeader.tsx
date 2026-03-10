import { charSignal, derivedStats, gameData, updateChar } from "./CharacterSheetApp";
import { getEffChars, getWoundStatus } from "./constants";

export function SheetHeader() {
	const char = charSignal.value;
	const stats = derivedStats.value;
	const data = gameData.value;

	const effChars = getEffChars(char, data?.races);
	const xpRemaining = (char.totalXP || 0) - (char.xpSpent || 0);

	// Resource name from exaltation
	let resourceName = "Resource";
	if (char.exaltation && data?.exaltations) {
		const exalt = (data.exaltations.exaltations || []).find((e: any) => e.id === char.exaltation);
		if (exalt?.resourceStat?.name) resourceName = exalt.resourceStat.name;
	}

	const wound = getWoundStatus(stats.hp, char.currentHP ?? 0, effChars.willpower || 1, effChars.constitution || 1);

	const numInput = (label: string, value: number, onChange: (v: number) => void, min?: number, max?: number) => (
		<label class="header-field">
			<span>{label}</span>
			<input
				type="number"
				value={value}
				min={min}
				max={max}
				onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
			/>
		</label>
	);

	return (
		<div class="sheet-header">
			<div class="header-row header-identity">
				<label class="header-field name-field">
					<span>Name</span>
					<input
						type="text"
						value={char.name}
						onInput={(e) =>
							updateChar((c) => {
								c.name = (e.target as HTMLInputElement).value;
							})
						}
						placeholder="Character Name"
					/>
				</label>
				<div class="header-badges">
					<span class="badge">Level {stats.level}</span>
				</div>
			</div>

			<div class="header-row header-xp">
				{numInput(
					"Total XP",
					char.totalXP,
					(v) =>
						updateChar((c) => {
							c.totalXP = v;
						}),
					0,
				)}
				{numInput(
					"XP Spent",
					char.xpSpent,
					(v) =>
						updateChar((c) => {
							c.xpSpent = v;
						}),
					0,
				)}
				<label class="header-field">
					<span>Remaining</span>
					<output class={xpRemaining < 0 ? "xp-negative" : ""}>{xpRemaining}</output>
				</label>
			</div>

			<div class="header-row header-trackers">
				<div class="tracker">
					<span class="tracker-label">HP</span>
					<input
						type="number"
						class="tracker-input"
						value={char.currentHP ?? 0}
						onInput={(e) =>
							updateChar((c) => {
								c.currentHP = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span class="tracker-sep">/</span>
					<span class="tracker-max">{stats.hp}</span>
				</div>

				<div class="tracker">
					<span class="tracker-label">{resourceName}</span>
					<input
						type="number"
						class="tracker-input"
						value={char.resourceCurrent ?? 0}
						min={0}
						max={stats.resourceMax}
						onInput={(e) =>
							updateChar((c) => {
								c.resourceCurrent = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span class="tracker-sep">/</span>
					<span class="tracker-max">{stats.resourceMax}</span>
				</div>

				<div class="tracker">
					<span class="tracker-label">Resolve</span>
					<input
						type="number"
						class="tracker-input"
						value={char.currentResolve ?? 0}
						min={0}
						max={stats.resolve}
						onInput={(e) =>
							updateChar((c) => {
								c.currentResolve = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span class="tracker-sep">/</span>
					<span class="tracker-max">{stats.resolve}</span>
				</div>

				<div class="tracker">
					<span class="tracker-label">Hero Points</span>
					<input
						type="number"
						class="tracker-input"
						value={char.heroPointsCurrent ?? 0}
						min={0}
						max={(char.heroPointsMax || 2) - (char.heroPointsBurnt || 0)}
						onInput={(e) =>
							updateChar((c) => {
								c.heroPointsCurrent = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span class="tracker-sep">/</span>
					<span class="tracker-max">{(char.heroPointsMax || 2) - (char.heroPointsBurnt || 0)}</span>
				</div>
			</div>

			<div class={`wound-status ${wound.cssClass}`}>
				<strong>{wound.status}</strong>
				<span>{wound.description}</span>
			</div>
		</div>
	);
}
