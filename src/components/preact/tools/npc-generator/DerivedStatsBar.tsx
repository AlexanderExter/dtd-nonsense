import type { DerivedStats } from "./constants";

interface DerivedStatsBarProps {
	stats: DerivedStats;
}

export function DerivedStatsBar({ stats }: DerivedStatsBarProps) {
	return (
		<div class="derived-bar no-print">
			<div class="derived-stat">
				<span class="derived-label">SD</span>
				<span class="derived-value">{stats.sd}</span>
			</div>
			<div class="derived-stat">
				<span class="derived-label">HP</span>
				<span class="derived-value">{stats.hp}</span>
			</div>
			<div class="derived-stat">
				<span class="derived-label">Resilience</span>
				<span class="derived-value">{stats.resilience}</span>
			</div>
			<div class="derived-stat">
				<span class="derived-label">Mental Def</span>
				<span class="derived-value">{stats.mentalDef}</span>
			</div>
			<div class="derived-stat">
				<span class="derived-label">Aura</span>
				<span class="derived-value">{stats.aura}</span>
			</div>
		</div>
	);
}
