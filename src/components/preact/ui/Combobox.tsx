import {
	Combobox as AriakitCombobox,
	ComboboxItem as AriakitComboboxItem,
	ComboboxPopover,
	ComboboxProvider,
} from "@ariakit/react";
import { useMemo, useState } from "preact/hooks";

/**
 * Searchable dropdown backed by Ariakit Combobox.
 *
 * ```tsx
 * <Combobox
 *   value={selected}
 *   onChange={setSelected}
 *   options={[{ value: "a", label: "Alpha" }]}
 *   placeholder="Search…"
 * />
 * ```
 */

interface ComboboxOption {
	value: string;
	label: string;
}

interface ComboboxProps {
	value: string;
	onChange: (value: string) => void;
	options: ComboboxOption[];
	placeholder?: string;
	label?: string;
	class?: string;
}

export function Combobox({ value, onChange, options, placeholder = "Search…", label, class: cls }: ComboboxProps) {
	const [searchValue, setSearchValue] = useState(value);

	const filteredOptions = useMemo(() => {
		if (!searchValue) return options;
		const lower = searchValue.toLowerCase();
		return options.filter((o) => o.label.toLowerCase().includes(lower));
	}, [searchValue, options]);

	return (
		<ComboboxProvider
			value={searchValue}
			setValue={(v) => {
				if (typeof v === "string") setSearchValue(v);
			}}
			selectedValue={value}
			setSelectedValue={(v) => {
				if (typeof v === "string") {
					onChange(v);
					setSearchValue(v);
				}
			}}
		>
			{label && (
				<span class="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim font-semibold block mb-[2px]">
					{label}
				</span>
			)}
			<AriakitCombobox
				placeholder={placeholder}
				class={[
					"w-full px-sm py-xs text-[0.9rem] bg-surface border border-border rounded-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent",
					cls,
				]
					.filter(Boolean)
					.join(" ")}
			/>
			<ComboboxPopover
				gutter={4}
				sameWidth
				class="z-[300] bg-surface-raised border border-border rounded-md p-xs max-h-[200px] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
			>
				{filteredOptions.length === 0 ? (
					<div class="py-sm px-sm text-text-dim text-[0.8rem]">No matches</div>
				) : (
					filteredOptions.map((opt) => (
						<AriakitComboboxItem
							key={opt.value}
							value={opt.value}
							class={[
								"block w-full py-1 px-sm bg-transparent border-none text-text-primary text-[0.85rem] text-left cursor-pointer rounded-sm hover:bg-surface hover:text-accent",
								opt.value === value && "text-accent font-semibold",
							]
								.filter(Boolean)
								.join(" ")}
						>
							{opt.label}
						</AriakitComboboxItem>
					))
				)}
			</ComboboxPopover>
		</ComboboxProvider>
	);
}
