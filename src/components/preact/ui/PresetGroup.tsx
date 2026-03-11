/**
 * Row of chip-style toggle buttons for preset selection.
 *
 * ```tsx
 * <PresetGroup
 *   presets={[{ label: "5k3", value: "5k3" }]}
 *   activeValue={current}
 *   onSelect={apply}
 * />
 * ```
 */
interface PresetOption {
	label: string;
	value: string | number;
}

interface PresetGroupProps {
	presets: PresetOption[];
	activeValue?: string | number;
	onSelect: (value: string | number) => void;
	label?: string;
	class?: string;
}

export function PresetGroup({ presets, activeValue, onSelect, label, class: cls }: PresetGroupProps) {
	return (
		<div class={["flex flex-col gap-xs", cls].filter(Boolean).join(" ")}>
			{label && <span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim">{label}</span>}
			<div class="flex flex-wrap gap-xs">
				{presets.map((preset) => (
					<button
						type="button"
						key={String(preset.value)}
						class={[
							"btn btn-ghost font-mono text-[0.8rem] px-sm py-xs",
							activeValue === preset.value && "bg-accent text-bg border-accent",
						]
							.filter(Boolean)
							.join(" ")}
						onClick={() => onSelect(preset.value)}
					>
						{preset.label}
					</button>
				))}
			</div>
		</div>
	);
}
