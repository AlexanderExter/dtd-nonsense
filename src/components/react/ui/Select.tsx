import { Select as RadixSelect } from "radix-ui";

/**
 * Accessible dropdown backed by Radix Select.
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
	className?: string;
	disabled?: boolean;
}

export function Select({ value, onChange, options, placeholder = "Select…", label, className, disabled }: SelectProps) {
	return (
		<div>
			{label && (
				<span className="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim font-semibold block mb-[2px]">
					{label}
				</span>
			)}
			<RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
				<RadixSelect.Trigger
					className={[
						"inline-flex items-center justify-between gap-sm min-w-[120px] px-sm py-xs text-[0.9rem] bg-surface border border-border rounded-sm text-text-primary cursor-pointer transition-colors duration-150 hover:border-accent focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed",
						className,
					]
						.filter(Boolean)
						.join(" ")}
				>
					<RadixSelect.Value placeholder={placeholder} />
					<RadixSelect.Icon>
						<span className="text-text-dim text-[0.7rem]">▾</span>
					</RadixSelect.Icon>
				</RadixSelect.Trigger>
				<RadixSelect.Portal>
					<RadixSelect.Content
						position="popper"
						sideOffset={4}
						className="z-[300] bg-surface-raised border border-border rounded-md p-xs max-h-[240px] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
					>
						<RadixSelect.Viewport>
							{placeholder && (
								<RadixSelect.Item
									value=""
									className="block w-full py-1 px-sm bg-transparent border-none text-text-dim text-[0.85rem] text-left cursor-pointer rounded-sm outline-none hover:bg-surface hover:text-accent data-[highlighted]:bg-surface data-[highlighted]:text-accent"
								>
									<RadixSelect.ItemText>{placeholder}</RadixSelect.ItemText>
								</RadixSelect.Item>
							)}
							{options.map((opt) => (
								<RadixSelect.Item
									key={opt.value}
									value={opt.value}
									disabled={opt.disabled}
									className={[
										"block w-full py-1 px-sm bg-transparent border-none text-text-primary text-[0.85rem] text-left cursor-pointer rounded-sm outline-none hover:bg-surface hover:text-accent data-[highlighted]:bg-surface data-[highlighted]:text-accent",
										"data-[disabled]:opacity-40 data-[disabled]:pointer-events-none",
										opt.value === value && "text-accent font-semibold",
									]
										.filter(Boolean)
										.join(" ")}
								>
									<RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
								</RadixSelect.Item>
							))}
						</RadixSelect.Viewport>
					</RadixSelect.Content>
				</RadixSelect.Portal>
			</RadixSelect.Root>
		</div>
	);
}
