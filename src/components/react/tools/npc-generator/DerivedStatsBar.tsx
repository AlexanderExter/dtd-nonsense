import type { DerivedStats } from "./constants";

interface DerivedStatsBarProps {
	stats: DerivedStats;
}

export function DerivedStatsBar({ stats }: DerivedStatsBarProps) {
	return (
		<div className="flex gap-md px-md py-sm bg-surface-raised border border-border rounded-md flex-wrap no-print">
			<div className="flex flex-col items-center min-w-[50px]">
				<span className="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">SD</span>
				<span className="text-[1.3rem] font-bold text-accent">{stats.sd}</span>
			</div>
			<div className="flex flex-col items-center min-w-[50px]">
				<span className="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">HP</span>
				<span className="text-[1.3rem] font-bold text-accent">{stats.hp}</span>
			</div>
			<div className="flex flex-col items-center min-w-[50px]">
				<span className="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">Resilience</span>
				<span className="text-[1.3rem] font-bold text-accent">{stats.resilience}</span>
			</div>
			<div className="flex flex-col items-center min-w-[50px]">
				<span className="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">Mental Def</span>
				<span className="text-[1.3rem] font-bold text-accent">{stats.mentalDef}</span>
			</div>
			<div className="flex flex-col items-center min-w-[50px]">
				<span className="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">Aura</span>
				<span className="text-[1.3rem] font-bold text-accent">{stats.aura}</span>
			</div>
		</div>
	);
}
