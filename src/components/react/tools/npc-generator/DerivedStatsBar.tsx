import type { DerivedStats } from "./constants";

interface DerivedStatsBarProps {
	stats: DerivedStats;
}

export function DerivedStatsBar({ stats }: DerivedStatsBarProps) {
	return (
		<div className="no-print flex flex-wrap gap-md rounded-md border border-border bg-surface-raised px-md py-sm">
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-[0.7rem] text-text-dim uppercase tracking-[0.5px]">SD</span>
				<span className="font-bold text-[1.3rem] text-accent">{stats.sd}</span>
			</div>
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-[0.7rem] text-text-dim uppercase tracking-[0.5px]">HP</span>
				<span className="font-bold text-[1.3rem] text-accent">{stats.hp}</span>
			</div>
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-[0.7rem] text-text-dim uppercase tracking-[0.5px]">Resilience</span>
				<span className="font-bold text-[1.3rem] text-accent">{stats.resilience}</span>
			</div>
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-[0.7rem] text-text-dim uppercase tracking-[0.5px]">Mental Def</span>
				<span className="font-bold text-[1.3rem] text-accent">{stats.mentalDef}</span>
			</div>
			<div className="flex min-w-[50px] flex-col items-center">
				<span className="text-[0.7rem] text-text-dim uppercase tracking-[0.5px]">Aura</span>
				<span className="font-bold text-[1.3rem] text-accent">{stats.aura}</span>
			</div>
		</div>
	);
}
