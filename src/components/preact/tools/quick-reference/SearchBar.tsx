import type { Signal } from "@preact/signals";
import { useRef } from "preact/hooks";

interface SearchBarProps {
	query: Signal<string>;
	inputRef: { current: HTMLInputElement | null };
}

export function SearchBar({ query, inputRef }: SearchBarProps) {
	const localRef = useRef(query.value);
	const timeoutRef = useRef<number | undefined>(undefined);

	function onInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		localRef.current = val;
		clearTimeout(timeoutRef.current);
		timeoutRef.current = window.setTimeout(() => {
			query.value = val;
		}, 200);
	}

	return (
		<>
			<div class="flex gap-sm items-center">
				<input
					type="search"
					class="flex-1 px-md py-sm text-base bg-surface border border-border rounded-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent"
					placeholder="Search actions, conditions, modifiers, schools…"
					autocomplete="off"
					value={query}
					onInput={onInput}
					ref={(el) => {
						if (el) inputRef.current = el;
					}}
				/>
			</div>
			<div class="text-text-dim text-[0.75rem] mt-xs">
				<kbd class="inline-block px-[5px] py-[1px] bg-surface-raised border border-border rounded-[3px] font-mono text-[0.7rem]">
					/
				</kbd>{" "}
				or{" "}
				<kbd class="inline-block px-[5px] py-[1px] bg-surface-raised border border-border rounded-[3px] font-mono text-[0.7rem]">
					Ctrl+K
				</kbd>{" "}
				to focus ·{" "}
				<kbd class="inline-block px-[5px] py-[1px] bg-surface-raised border border-border rounded-[3px] font-mono text-[0.7rem]">
					Esc
				</kbd>{" "}
				to clear
			</div>
		</>
	);
}
