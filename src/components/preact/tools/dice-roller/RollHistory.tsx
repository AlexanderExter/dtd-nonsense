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
		<div class="panel max-h-[calc(100vh-150px)] flex flex-col">
			<div class="flex justify-between items-center mb-md">
				<h3 class="m-0">Roll History</h3>
				{entries.length > 0 && (
					<button type="button" class="btn btn-sm btn-secondary" onClick={onClear}>
						Clear
					</button>
				)}
			</div>
			<div class="flex-1 overflow-y-auto flex flex-col gap-sm">
				{entries.length === 0 ? (
					<p class="text-center text-text-dim p-lg">No rolls yet. Press Enter or click Roll!</p>
				) : (
					entries.map((entry, i) => {
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
								class={`bg-bg p-sm rounded-md border-l-[3px] cursor-pointer transition-[border-color] duration-150 hover:border-l-accent ${
									entry.success ? "border-l-outcome-success" : "border-l-outcome-failure"
								}`}
								onClick={() => onReplay(i)}
							>
								<div class="font-mono text-accent font-bold">
									{entry.notation} vs TN {entry.tn}
								</div>
								<div class="flex justify-between items-center mt-xs">
									<span class="text-xl font-bold">{entry.total}</span>
									<span
										class={`text-xs px-2 py-[2px] rounded-sm ${
											entry.success
												? "bg-outcome-success-bg text-outcome-success"
												: "bg-outcome-failure-bg text-outcome-failure"
										}`}
									>
										{outcomeText}
									</span>
								</div>
								<div class="text-[0.7rem] text-text-dim mt-xs">{formatTime(entry.timestamp)}</div>
							</button>
						);
					})
				)}
			</div>
		</div>
	);
}
