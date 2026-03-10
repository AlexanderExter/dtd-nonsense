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
			<div class="search-row">
				<input
					type="search"
					placeholder="Search actions, conditions, modifiers, schools…"
					autocomplete="off"
					value={query}
					onInput={onInput}
					ref={(el) => {
						if (el) inputRef.current = el;
					}}
				/>
			</div>
			<div class="search-hint">
				<kbd>/</kbd> or <kbd>Ctrl+K</kbd> to focus · <kbd>Esc</kbd> to clear
			</div>
		</>
	);
}
