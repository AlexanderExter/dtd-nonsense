interface PresetBarProps {
	onPreset: (rolled: number, kept: number) => void;
}

const PRESETS = [
	[3, 2],
	[4, 3],
	[5, 3],
	[6, 3],
	[7, 4],
	[8, 4],
	[9, 5],
	[10, 5],
] as const;

export function PresetBar({ onPreset }: PresetBarProps) {
	return (
		<div class="mb-lg text-center">
			<h4 class="text-text-dim m-0 mb-sm font-normal">Quick Rolls</h4>
			<div class="flex flex-wrap gap-xs justify-center">
				{PRESETS.map(([rolled, kept]) => (
					<button
						key={`${rolled}k${kept}`}
						class="bg-surface-alt text-text-primary border border-transparent rounded-sm px-md py-xs font-mono cursor-pointer transition-all duration-150 hover:bg-accent hover:text-bg active:scale-95"
						type="button"
						onClick={() => onPreset(rolled, kept)}
					>
						{rolled}k{kept}
					</button>
				))}
			</div>
		</div>
	);
}
