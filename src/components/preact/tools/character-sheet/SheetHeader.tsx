import { charSignal, derivedStats, gameData, updateChar } from "./CharacterSheetApp";
import { getEffChars, getWoundStatus } from "./constants";

export function SheetHeader() {
	const char = charSignal.value;
	const stats = derivedStats.value;
	const data = gameData.value;

	const effChars = getEffChars(char, data?.races);

	// Resource name from exaltation
	let resourceName = "Resource";
	if (char.exaltation && data?.exaltations) {
		const exalt = (data.exaltations.exaltations || []).find((e: any) => e.id === char.exaltation);
		if (exalt?.resourceStat?.name) resourceName = exalt.resourceStat.name;
	}

	const wound = getWoundStatus(stats.hp, char.currentHP ?? 0, effChars.willpower || 1, effChars.constitution || 1);

	return (
		<div class="flex items-center justify-between flex-wrap gap-md px-lg py-md bg-surface-raised border-b border-border max-[768px]:flex-col max-[768px]:items-stretch">
			<div class="flex items-center gap-md flex-1 min-w-[280px] max-[768px]:flex-col">
				<label class="flex flex-col flex-1 min-w-[180px]">
					<span class="text-[0.78rem] text-text-muted uppercase tracking-[0.3px]">Name</span>
					<input
						type="text"
						class="text-2xl font-bold text-accent bg-transparent border border-transparent rounded-sm px-sm py-xs flex-1 min-w-[180px] focus:border-accent focus:bg-surface"
						value={char.name}
						onInput={(e) =>
							updateChar((c) => {
								c.name = (e.target as HTMLInputElement).value;
							})
						}
						placeholder="Character Name"
					/>
				</label>
				<span class="text-[0.85rem] text-text-muted">
					Level <strong class="text-accent">{stats.level}</strong>
				</span>
				<span class="text-[0.85rem] text-text-muted">
					XP{" "}
					<strong class={(char.totalXP || 0) - (char.xpSpent || 0) < 0 ? "text-error" : "text-accent"}>
						{(char.totalXP || 0) - (char.xpSpent || 0)}
					</strong>
					<span class="text-text-dim"> / {char.totalXP || 0}</span>
				</span>
			</div>

			<div class="flex gap-sm items-center flex-wrap">
				<div class="flex items-center gap-1 px-sm py-xs bg-surface border border-border rounded-sm text-[0.85rem]">
					<span class="text-text-muted font-semibold uppercase text-[0.65rem] tracking-[0.5px] mr-0.5">
						HP
					</span>
					<input
						type="number"
						class="w-[38px] py-0.5 px-1 text-center font-bold text-[0.95rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent"
						value={char.currentHP ?? 0}
						onInput={(e) =>
							updateChar((c) => {
								c.currentHP = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span class="text-text-dim text-[0.85rem]">/</span>
					<span class="font-bold text-text-primary min-w-4">{stats.hp}</span>
				</div>

				<div class="flex items-center gap-1 px-sm py-xs bg-surface border border-border rounded-sm text-[0.85rem]">
					<span class="text-text-muted font-semibold uppercase text-[0.65rem] tracking-[0.5px] mr-0.5">
						{resourceName}
					</span>
					<input
						type="number"
						class="w-[38px] py-0.5 px-1 text-center font-bold text-[0.95rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent"
						value={char.resourceCurrent ?? 0}
						min={0}
						max={stats.resourceMax}
						onInput={(e) =>
							updateChar((c) => {
								c.resourceCurrent = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span class="text-text-dim text-[0.85rem]">/</span>
					<span class="font-bold text-text-primary min-w-4">{stats.resourceMax}</span>
				</div>

				<div class="flex items-center gap-1 px-sm py-xs bg-surface border border-border rounded-sm text-[0.85rem]">
					<span class="text-text-muted font-semibold uppercase text-[0.65rem] tracking-[0.5px] mr-0.5">
						Resolve
					</span>
					<input
						type="number"
						class="w-[38px] py-0.5 px-1 text-center font-bold text-[0.95rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent"
						value={char.currentResolve ?? 0}
						min={0}
						max={stats.resolve}
						onInput={(e) =>
							updateChar((c) => {
								c.currentResolve = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span class="text-text-dim text-[0.85rem]">/</span>
					<span class="font-bold text-text-primary min-w-4">{stats.resolve}</span>
				</div>

				<div class="flex items-center gap-1 px-sm py-xs bg-surface border border-border rounded-sm text-[0.85rem]">
					<span class="text-text-muted font-semibold uppercase text-[0.65rem] tracking-[0.5px] mr-0.5">
						Hero Points
					</span>
					<input
						type="number"
						class="w-[38px] py-0.5 px-1 text-center font-bold text-[0.95rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent"
						value={char.heroPointsCurrent ?? 0}
						min={0}
						max={(char.heroPointsMax || 2) - (char.heroPointsBurnt || 0)}
						onInput={(e) =>
							updateChar((c) => {
								c.heroPointsCurrent = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span class="text-text-dim text-[0.85rem]">/</span>
					<span class="font-bold text-text-primary min-w-4">
						{(char.heroPointsMax || 2) - (char.heroPointsBurnt || 0)}
					</span>
				</div>
			</div>

			<div
				class={[
					"mt-md p-sm rounded-sm text-center font-semibold text-[0.82rem]",
					wound.cssClass === "wound-ok" && "bg-success-bg text-success",
					wound.cssClass === "wound-light" && "bg-warning-bg text-warning",
					wound.cssClass === "wound-heavy" && "bg-error-bg text-error",
					wound.cssClass === "wound-critical" && "bg-error text-white",
				]
					.filter(Boolean)
					.join(" ")}
			>
				<strong>{wound.status}</strong> <span>{wound.description}</span>
			</div>
		</div>
	);
}
