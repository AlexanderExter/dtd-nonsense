import { GameInput } from "@/components/react/ui/GameInput";
import { cn } from "@/lib/utils";
import type { DerivedStats } from "./constants";
import { getEffChars, getWoundStatus } from "./constants";
import { useCharSheetStore } from "./store";

export function SheetHeader({ derivedStats }: { derivedStats: DerivedStats }) {
	const char = useCharSheetStore((s) => s.char);
	const stats = derivedStats;
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);

	const effChars = getEffChars(char, data?.races);

	// Resource name from exaltation
	let resourceName = "Resource";
	if (char.exaltation && data?.exaltations) {
		const exalt = (data.exaltations.exaltations || []).find((e: any) => e.id === char.exaltation);
		if (exalt?.resourceStat?.name) resourceName = exalt.resourceStat.name;
	}

	const wound = getWoundStatus(stats.hp, char.currentHP ?? 0, effChars.willpower || 1, effChars.constitution || 1);

	return (
		<div className="flex items-center justify-between flex-wrap gap-md px-lg py-md bg-surface-raised border-b border-border max-[768px]:flex-col max-[768px]:items-stretch">
			<div className="flex items-center gap-md flex-1 min-w-[280px] max-[768px]:flex-col">
				<label className="flex flex-col flex-1 min-w-[180px]">
					<span className="text-[0.78rem] text-text-muted uppercase tracking-[0.3px]">Name</span>
					<GameInput
						type="text"
						className="text-2xl font-bold text-accent bg-transparent border-transparent px-sm py-xs flex-1 min-w-[180px] focus:bg-surface"
						value={char.name}
						onInput={(e) =>
							updateChar((c) => {
								c.name = (e.target as HTMLInputElement).value;
							})
						}
						placeholder="Character Name"
					/>
				</label>
				<span className="text-[0.85rem] text-text-muted">
					Level <strong className="text-accent">{stats.level}</strong>
				</span>
				<span className="text-[0.85rem] text-text-muted">
					XP{" "}
					<strong className={(char.totalXP || 0) - (char.xpSpent || 0) < 0 ? "text-error" : "text-accent"}>
						{(char.totalXP || 0) - (char.xpSpent || 0)}
					</strong>
					<span className="text-text-dim"> / {char.totalXP || 0}</span>
				</span>
			</div>

			<div className="flex gap-sm items-center flex-wrap">
				<div className="flex items-center gap-1 px-sm py-xs bg-surface border border-border rounded-sm text-[0.85rem]">
					<span className="text-text-muted font-semibold uppercase text-[0.65rem] tracking-[0.5px] mr-0.5">
						HP
					</span>
					<GameInput
						type="number"
						className="w-[38px] text-center font-bold text-[0.95rem]"
						value={char.currentHP ?? 0}
						onInput={(e) =>
							updateChar((c) => {
								c.currentHP = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span className="text-text-dim text-[0.85rem]">/</span>
					<span className="font-bold text-text-primary min-w-4">{stats.hp}</span>
				</div>

				<div className="flex items-center gap-1 px-sm py-xs bg-surface border border-border rounded-sm text-[0.85rem]">
					<span className="text-text-muted font-semibold uppercase text-[0.65rem] tracking-[0.5px] mr-0.5">
						{resourceName}
					</span>
					<GameInput
						type="number"
						className="w-[38px] text-center font-bold text-[0.95rem]"
						value={char.resourceCurrent ?? 0}
						min={0}
						max={stats.resourceMax}
						onInput={(e) =>
							updateChar((c) => {
								c.resourceCurrent = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span className="text-text-dim text-[0.85rem]">/</span>
					<span className="font-bold text-text-primary min-w-4">{stats.resourceMax}</span>
				</div>

				<div className="flex items-center gap-1 px-sm py-xs bg-surface border border-border rounded-sm text-[0.85rem]">
					<span className="text-text-muted font-semibold uppercase text-[0.65rem] tracking-[0.5px] mr-0.5">
						Resolve
					</span>
					<GameInput
						type="number"
						className="w-[38px] text-center font-bold text-[0.95rem]"
						value={char.currentResolve ?? 0}
						min={0}
						max={stats.resolve}
						onInput={(e) =>
							updateChar((c) => {
								c.currentResolve = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span className="text-text-dim text-[0.85rem]">/</span>
					<span className="font-bold text-text-primary min-w-4">{stats.resolve}</span>
				</div>

				<div className="flex items-center gap-1 px-sm py-xs bg-surface border border-border rounded-sm text-[0.85rem]">
					<span className="text-text-muted font-semibold uppercase text-[0.65rem] tracking-[0.5px] mr-0.5">
						Hero Points
					</span>
					<GameInput
						type="number"
						className="w-[38px] text-center font-bold text-[0.95rem]"
						value={char.heroPointsCurrent ?? 0}
						min={0}
						max={(char.heroPointsMax || 2) - (char.heroPointsBurnt || 0)}
						onInput={(e) =>
							updateChar((c) => {
								c.heroPointsCurrent = Number((e.target as HTMLInputElement).value);
							})
						}
					/>
					<span className="text-text-dim text-[0.85rem]">/</span>
					<span className="font-bold text-text-primary min-w-4">
						{(char.heroPointsMax || 2) - (char.heroPointsBurnt || 0)}
					</span>
				</div>
			</div>

			<div
				className={cn(
					"mt-md p-sm rounded-sm text-center font-semibold text-[0.82rem]",
					wound.cssClass === "wound-ok" && "bg-success-bg text-success",
					wound.cssClass === "wound-light" && "bg-warning-bg text-warning",
					wound.cssClass === "wound-heavy" && "bg-error-bg text-error",
					wound.cssClass === "wound-critical" && "bg-error text-white",
				)}
			>
				<strong>{wound.status}</strong> <span>{wound.description}</span>
			</div>
		</div>
	);
}
