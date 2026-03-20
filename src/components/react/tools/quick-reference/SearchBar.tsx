import { useRef } from "react";
import { GameInput } from "@/components/react/ui/GameInput";

interface SearchBarProps {
	inputRef: { current: HTMLInputElement | null };
	query: string;
	setQuery: (q: string) => void;
}

export function SearchBar({ query, setQuery, inputRef }: SearchBarProps) {
	const localRef = useRef(query);
	const timeoutRef = useRef<number | undefined>(undefined);

	function onInput(e: React.FormEvent<HTMLInputElement>) {
		const val = (e.target as HTMLInputElement).value;
		localRef.current = val;
		clearTimeout(timeoutRef.current);
		timeoutRef.current = window.setTimeout(() => {
			setQuery(val);
		}, 200);
	}

	return (
		<>
			<div className="flex items-center gap-sm">
				<GameInput
					autoComplete="off"
					className="flex-1"
					onInput={onInput}
					placeholder="Search actions, conditions, modifiers, schools…"
					ref={(el) => {
						if (el) inputRef.current = el;
					}}
					type="search"
					value={query}
				/>
			</div>
			<div className="mt-xs text-[0.75rem] text-text-dim">
				<kbd className="inline-block rounded-[3px] border border-border bg-surface-raised px-[5px] py-[1px] font-mono text-[0.7rem]">
					/
				</kbd>{" "}
				or{" "}
				<kbd className="inline-block rounded-[3px] border border-border bg-surface-raised px-[5px] py-[1px] font-mono text-[0.7rem]">
					Ctrl+K
				</kbd>{" "}
				to focus ·{" "}
				<kbd className="inline-block rounded-[3px] border border-border bg-surface-raised px-[5px] py-[1px] font-mono text-[0.7rem]">
					Esc
				</kbd>{" "}
				to clear
			</div>
		</>
	);
}
