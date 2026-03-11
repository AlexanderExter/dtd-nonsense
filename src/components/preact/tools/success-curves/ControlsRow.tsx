import type { Signal } from "@preact/signals";
import { Button, PresetGroup } from "@/components/preact/ui";

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
		<div class="flex flex-wrap gap-lg items-start max-[600px]:flex-col">
			<PresetGroup
				label="Presets"
				presets={PRESETS.map(([num, keep]) => ({ label: `${num}k${keep}`, value: `${num}k${keep}` }))}
				onSelect={(v) => {
					const [num, keep] = String(v).split("k").map(Number);
					onPresetClick(num, keep);
				}}
			/>
			<PresetGroup
				label="Stunt"
				presets={STUNT_LEVELS.map((level) => ({ label: `+${level}`, value: level }))}
				activeValue={activeStunt.value}
				onSelect={(v) => onStuntClick(Number(v))}
			/>
			<div class="flex flex-col gap-xs">
				<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">Skill Test Helper</span>
				<div class="flex items-center gap-sm">
					<label class="flex items-center gap-xs text-[0.85rem] m-0">
						Skill
						<input
							type="number"
							id="helper-skill"
							class="w-12 text-center px-sm py-xs"
							min={0}
							max={6}
							value={0}
						/>
					</label>
					<span class="text-text-muted">+</span>
					<label class="flex items-center gap-xs text-[0.85rem] m-0">
						Char
						<input
							type="number"
							id="helper-char"
							class="w-12 text-center px-sm py-xs"
							min={1}
							max={6}
							value={1}
						/>
					</label>
					<Button onClick={handleApply}>Apply</Button>
				</div>
			</div>
		</div>
	);
}
