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
		<div class="presets">
			<h4>Quick Rolls</h4>
			<div class="preset-grid">
				{PRESETS.map(([rolled, kept]) => (
					<button
						key={`${rolled}k${kept}`}
						class="preset-btn"
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
