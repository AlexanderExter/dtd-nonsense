import type { Signal } from "@preact/signals";

interface ControlsRowProps {
	activeStunt: Signal<number>;
	onPresetClick: (numDice: number, keepDice: number) => void;
	onStuntClick: (level: number) => void;
	onHelperApply: (rolled: number, kept: number) => void;
}

const PRESETS = [
	[2, 2],
	[3, 2],
	[3, 3],
	[5, 3],
	[5, 5],
	[7, 4],
	[8, 4],
	[10, 5],
	[10, 10],
] as const;

const STUNT_LEVELS = [1, 2, 3] as const;

export function ControlsRow({ activeStunt, onPresetClick, onStuntClick, onHelperApply }: ControlsRowProps) {
	const handleApply = () => {
		const skillEl = document.getElementById("helper-skill") as HTMLInputElement;
		const charEl = document.getElementById("helper-char") as HTMLInputElement;
		const skill = parseInt(skillEl.value, 10) || 0;
		const char = parseInt(charEl.value, 10) || 1;
		const rolled = skill + char + activeStunt.value;
		onHelperApply(rolled, char);
	};

	return (
		<div class="controls-row">
			<div class="preset-group">
				<span class="field-label">Presets</span>
				<div class="preset-buttons">
					{PRESETS.map(([num, keep]) => (
						<button
							type="button"
							key={`${num}k${keep}`}
							class="btn btn-ghost preset-btn"
							onClick={() => onPresetClick(num, keep)}
						>
							{num}k{keep}
						</button>
					))}
				</div>
			</div>
			<div class="stunt-group">
				<span class="field-label">Stunt</span>
				<div class="stunt-buttons">
					{STUNT_LEVELS.map((level) => (
						<button
							type="button"
							key={level}
							class={`btn btn-ghost stunt-btn${activeStunt.value === level ? " active" : ""}`}
							onClick={() => onStuntClick(level)}
						>
							+{level}
						</button>
					))}
				</div>
			</div>
			<div class="helper-group">
				<span class="field-label">Skill Test Helper</span>
				<div class="helper-inputs">
					<label>
						Skill
						<input type="number" id="helper-skill" min={0} max={6} value={0} />
					</label>
					<span class="text-muted">+</span>
					<label>
						Char
						<input type="number" id="helper-char" min={1} max={6} value={1} />
					</label>
					<button type="button" class="btn btn-secondary" onClick={handleApply}>
						Apply
					</button>
				</div>
			</div>
		</div>
	);
}
