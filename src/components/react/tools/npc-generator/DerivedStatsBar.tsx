import type { DerivedStats } from "./constants";

interface DerivedStatsBarProps {
	stats: DerivedStats;
}

export function DerivedStatsBar({ stats }: DerivedStatsBarProps) {
	return (
		<div className="no-print flex flex-wrap gap-md rounded-md border border-border bg-surface-raised px-md py-sm">
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-text-dim text-xs uppercase tracking-wide-px">SD</span>
				<span className="font-bold text-accent text-xl">{stats.sd}</span>
			</div>
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-text-dim text-xs uppercase tracking-wide-px">HP</span>
				<span className="font-bold text-accent text-xl">{stats.hp}</span>
			</div>
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-text-dim text-xs uppercase tracking-wide-px">Resilience</span>
				<span className="font-bold text-accent text-xl">{stats.resilience}</span>
			</div>
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-text-dim text-xs uppercase tracking-wide-px">Mental Def</span>
				<span className="font-bold text-accent text-xl">{stats.mentalDef}</span>
			</div>
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-text-dim text-xs uppercase tracking-wide-px">Aura</span>
				<span className="font-bold text-accent text-xl">{stats.aura}</span>
			</div>
		</div>
	);
}
