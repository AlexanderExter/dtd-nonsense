import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Searchable dropdown (custom implementation).
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
	className?: string;
}

export function Combobox({ value, onChange, options, placeholder = "Search…", label, className }: ComboboxProps) {
	const [searchValue, setSearchValue] = useState(() => options.find((o) => o.value === value)?.label ?? value);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const containerRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLUListElement>(null);

	const filteredOptions = useMemo(() => {
		if (!searchValue) return options;
		const lower = searchValue.toLowerCase();
		return options.filter((o) => o.label.toLowerCase().includes(lower));
	}, [searchValue, options]);

	// Close on outside click
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	function selectOption(opt: ComboboxOption) {
		onChange(opt.value);
		setSearchValue(opt.label);
		setIsOpen(false);
		setActiveIndex(-1);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!isOpen) {
			if (e.key === "ArrowDown" || e.key === "Enter") {
				setIsOpen(true);
				setActiveIndex(0);
				e.preventDefault();
			}
			return;
		}
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
				break;
			case "ArrowUp":
				e.preventDefault();
				setActiveIndex((prev) => Math.max(prev - 1, 0));
				break;
			case "Enter":
				e.preventDefault();
				if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
					selectOption(filteredOptions[activeIndex]);
				}
				break;
			case "Escape":
				setIsOpen(false);
				setActiveIndex(-1);
				break;
		}
	}

	return (
		<div ref={containerRef} className="relative">
			{label && (
				<span className="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim font-semibold block mb-[2px]">
					{label}
				</span>
			)}
			<input
				type="text"
				role="combobox"
				aria-expanded={isOpen}
				aria-autocomplete="list"
				aria-activedescendant={activeIndex >= 0 ? `cb-opt-${activeIndex}` : undefined}
				value={searchValue}
				placeholder={placeholder}
				className={[
					"w-full px-sm py-xs text-[0.9rem] bg-surface border border-border rounded-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				onChange={(e) => {
					setSearchValue(e.target.value);
					setIsOpen(true);
					setActiveIndex(0);
				}}
				onFocus={() => setIsOpen(true)}
				onKeyDown={handleKeyDown}
			/>
			{isOpen && (
				<div
					ref={listRef}
					role="listbox"
					className="absolute left-0 right-0 top-full mt-1 z-[300] bg-surface-raised border border-border rounded-md p-xs max-h-[200px] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.5)] list-none m-0"
				>
					{filteredOptions.length === 0 ? (
						<div className="py-sm px-sm text-text-dim text-[0.8rem]">No matches</div>
					) : (
						filteredOptions.map((opt, i) => (
							<div
								key={opt.value}
								id={`cb-opt-${i}`}
								role="option"
								tabIndex={-1}
								aria-selected={opt.value === value}
								className={[
									"block w-full py-1 px-sm bg-transparent border-none text-text-primary text-[0.85rem] text-left cursor-pointer rounded-sm hover:bg-surface hover:text-accent",
									opt.value === value && "text-accent font-semibold",
									i === activeIndex && "bg-surface text-accent",
								]
									.filter(Boolean)
									.join(" ")}
								onMouseDown={(e) => {
									e.preventDefault();
									selectOption(opt);
								}}
							>
								{opt.label}
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
