import type { Signal } from "@preact/signals";

export interface HistoryEntry {
	notation: string;
	num: number;
	keep: number;
	modifier: number;
	tn: number;
	total: number;
	success: boolean;
	raises: number;
	checks: number;
	timestamp: number;
}

interface RollHistoryProps {
	history: Signal<HistoryEntry[]>;
	onReplay: (index: number) => void;
	onClear: () => void;
}

function formatTime(timestamp: number): string {
	const diff = Date.now() - timestamp;
	if (diff < 60_000) return "Just now";
	if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
	if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
	return new Date(timestamp).toLocaleDateString();
}

export function RollHistory({ history, onReplay, onClear }: RollHistoryProps) {
	const entries = history.value;

	return (
		<div class="panel history-panel">
			<div class="history-header">
				<h3>Roll History</h3>
				{entries.length > 0 && (
					<button type="button" class="btn btn-sm btn-secondary" onClick={onClear}>
						Clear
					</button>
				)}
			</div>
			<div class="roll-history">
				{entries.length === 0 ? (
					<p class="empty-state">No rolls yet. Press Enter or click Roll!</p>
				) : (
					entries.map((entry, i) => {
						const outcomeClass = entry.success ? "success" : "failure";
						const outcomeText = entry.success
							? entry.raises > 0
								? `+${entry.raises}R`
								: "Pass"
							: entry.checks > 0
								? `${entry.checks}C`
								: "Fail";
						return (
							<button
								key={entry.timestamp + i}
								type="button"
								class={`history-entry ${outcomeClass}`}
								onClick={() => onReplay(i)}
							>
								<div class="history-roll">
									{entry.notation} vs TN {entry.tn}
								</div>
								<div class="history-result">
									<span class="history-total">{entry.total}</span>
									<span class={`history-outcome ${outcomeClass}`}>{outcomeText}</span>
								</div>
								<div class="history-time">{formatTime(entry.timestamp)}</div>
							</button>
						);
					})
				)}
			</div>
		</div>
	);
}
