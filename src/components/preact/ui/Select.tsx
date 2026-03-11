import {
	Select as AriakitSelect,
	SelectItem as AriakitSelectItem,
	SelectLabel,
	SelectPopover,
	SelectProvider,
} from "@ariakit/react";

/**
 * Accessible dropdown backed by Ariakit Select.
 *
 * ```tsx
 * <Select
 *   value={race}
 *   onChange={setRace}
 *   options={[{ value: "human", label: "Human" }]}
 *   label="Race"
 * />
 * ```
 */

interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface SelectProps {
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	label?: string;
	class?: string;
	disabled?: boolean;
}

export function Select({
	value,
	onChange,
	options,
	placeholder = "Select…",
	label,
	class: cls,
	disabled,
}: SelectProps) {
	const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

	return (
		<SelectProvider
			value={value}
			setValue={(v) => {
				if (typeof v === "string") onChange(v);
			}}
		>
			{label && (
				<SelectLabel class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim font-semibold block mb-[2px]">
					{label}
				</SelectLabel>
			)}
			<AriakitSelect
				class={[
					"inline-flex items-center justify-between gap-sm min-w-[120px] px-sm py-xs text-[0.9rem] bg-surface border border-border rounded-sm text-text-primary cursor-pointer transition-colors duration-150 hover:border-accent focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed",
					cls,
				]
					.filter(Boolean)
					.join(" ")}
				disabled={disabled}
			>
				{selectedLabel}
				<span class="text-text-dim text-[0.7rem]">▾</span>
			</AriakitSelect>
			<SelectPopover
				gutter={4}
				sameWidth
				class="z-[300] bg-surface-raised border border-border rounded-md p-xs max-h-[240px] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
			>
				{placeholder && (
					<AriakitSelectItem
						value=""
						class="block w-full py-1 px-sm bg-transparent border-none text-text-dim text-[0.85rem] text-left cursor-pointer rounded-sm hover:bg-surface hover:text-accent"
					>
						{placeholder}
					</AriakitSelectItem>
				)}
				{options.map((opt) => (
					<AriakitSelectItem
						key={opt.value}
						value={opt.value}
						disabled={opt.disabled}
						class={[
							"block w-full py-1 px-sm bg-transparent border-none text-text-primary text-[0.85rem] text-left cursor-pointer rounded-sm hover:bg-surface hover:text-accent",
							"disabled:opacity-40 disabled:pointer-events-none",
							opt.value === value && "text-accent font-semibold",
						]
							.filter(Boolean)
							.join(" ")}
					>
						{opt.label}
					</AriakitSelectItem>
				))}
			</SelectPopover>
		</SelectProvider>
	);
}
