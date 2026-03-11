import type { DerivedStats } from "./constants";

interface DerivedStatsBarProps {
	stats: DerivedStats;
}

export function DerivedStatsBar({ stats }: DerivedStatsBarProps) {
	return (
		<div class="flex gap-md px-md py-sm bg-surface-raised border border-border rounded-md flex-wrap no-print">
			<div class="flex flex-col items-center min-w-[50px]">
				<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">SD</span>
				<span class="text-[1.3rem] font-bold text-accent">{stats.sd}</span>
			</div>
			<div class="flex flex-col items-center min-w-[50px]">
				<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">HP</span>
				<span class="text-[1.3rem] font-bold text-accent">{stats.hp}</span>
			</div>
			<div class="flex flex-col items-center min-w-[50px]">
				<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">Resilience</span>
				<span class="text-[1.3rem] font-bold text-accent">{stats.resilience}</span>
			</div>
			<div class="flex flex-col items-center min-w-[50px]">
				<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">Mental Def</span>
				<span class="text-[1.3rem] font-bold text-accent">{stats.mentalDef}</span>
			</div>
			<div class="flex flex-col items-center min-w-[50px]">
				<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">Aura</span>
				<span class="text-[1.3rem] font-bold text-accent">{stats.aura}</span>
			</div>
		</div>
	);
}
