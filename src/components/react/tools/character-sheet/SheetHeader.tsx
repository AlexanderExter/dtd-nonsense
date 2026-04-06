import { GameInput } from "@/components/react/ui/GameInput";
import { NumberInput } from "@/components/react/ui/NumberInput";
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
		<div className="flex flex-wrap items-center justify-between gap-md border-border border-b bg-surface-raised px-lg py-md max-[768px]:flex-col max-[768px]:items-stretch">
			<div className="flex min-w-[280px] flex-1 items-center gap-md max-[768px]:flex-col">
				<label className="flex min-w-[180px] flex-1 flex-col">
					<span className="text-[0.78rem] text-text-muted uppercase tracking-[0.3px]">Name</span>
					<GameInput
						className="min-w-[180px] flex-1 border-transparent bg-transparent px-sm py-xs font-bold text-2xl text-accent focus:bg-surface"
						onInput={(e) =>
							updateChar((c) => {
								c.name = (e.target as HTMLInputElement).value;
							})
						}
						placeholder="Character Name"
						type="text"
						value={char.name}
					/>
				</label>
				<span className="text-[0.85rem] text-text-muted">
					Level <strong className="text-accent">{stats.level}</strong>
				</span>
			</div>

			<div className="flex flex-wrap items-center gap-sm">
				<div className="flex items-center gap-1 rounded-sm border border-border bg-surface px-sm py-xs text-[0.85rem]">
					<span className="mr-0.5 font-semibold text-[0.65rem] text-text-muted uppercase tracking-[0.5px]">
						HP
					</span>
					<NumberInput
						max={stats.hp}
						min={0}
						onChange={(v) =>
							updateChar((c) => {
								c.currentHP = v;
							})
						}
						value={char.currentHP ?? 0}
					/>
					<span className="text-[0.85rem] text-text-dim">/</span>
					<span className="min-w-4 font-bold text-text-primary">{stats.hp}</span>
				</div>

				<div className="flex items-center gap-1 rounded-sm border border-border bg-surface px-sm py-xs text-[0.85rem]">
					<span className="mr-0.5 font-semibold text-[0.65rem] text-text-muted uppercase tracking-[0.5px]">
						{resourceName}
					</span>
					<NumberInput
						max={stats.resourceMax}
						min={0}
						onChange={(v) =>
							updateChar((c) => {
								c.resourceCurrent = v;
							})
						}
						value={char.resourceCurrent ?? 0}
					/>
					<span className="text-[0.85rem] text-text-dim">/</span>
					<span className="min-w-4 font-bold text-text-primary">{stats.resourceMax}</span>
				</div>

				<div className="flex items-center gap-1 rounded-sm border border-border bg-surface px-sm py-xs text-[0.85rem]">
					<span className="mr-0.5 font-semibold text-[0.65rem] text-text-muted uppercase tracking-[0.5px]">
						Resolve
					</span>
					<NumberInput
						max={stats.resolve}
						min={0}
						onChange={(v) =>
							updateChar((c) => {
								c.currentResolve = v;
							})
						}
						value={char.currentResolve ?? 0}
					/>
					<span className="text-[0.85rem] text-text-dim">/</span>
					<span className="min-w-4 font-bold text-text-primary">{stats.resolve}</span>
				</div>

				<div className="flex items-center gap-1 rounded-sm border border-border bg-surface px-sm py-xs text-[0.85rem]">
					<span className="mr-0.5 font-semibold text-[0.65rem] text-text-muted uppercase tracking-[0.5px]">
						Hero Points
					</span>
					<NumberInput
						max={(char.heroPointsMax || 2) - (char.heroPointsBurnt || 0)}
						min={0}
						onChange={(v) =>
							updateChar((c) => {
								c.heroPointsCurrent = v;
							})
						}
						value={char.heroPointsCurrent ?? 0}
					/>
					<span className="text-[0.85rem] text-text-dim">/</span>
					<span className="min-w-4 font-bold text-text-primary">
						{(char.heroPointsMax || 2) - (char.heroPointsBurnt || 0)}
					</span>
				</div>
			</div>

			<div
				className={cn(
					"mt-md rounded-sm p-sm text-center font-semibold text-[0.82rem]",
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
