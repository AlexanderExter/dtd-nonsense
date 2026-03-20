import { useRef } from "react";
import { GameInput } from "@/components/react/ui/GameInput";

interface SearchBarProps {
	query: string;
	setQuery: (q: string) => void;
	inputRef: { current: HTMLInputElement | null };
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
			<div className="flex gap-sm items-center">
				<GameInput
					type="search"
					className="flex-1"
					placeholder="Search actions, conditions, modifiers, schools…"
					autoComplete="off"
					value={query}
					onInput={onInput}
					ref={(el) => {
						if (el) inputRef.current = el;
					}}
				/>
			</div>
			<div className="text-text-dim text-[0.75rem] mt-xs">
				<kbd className="inline-block px-[5px] py-[1px] bg-surface-raised border border-border rounded-[3px] font-mono text-[0.7rem]">
					/
				</kbd>{" "}
				or{" "}
				<kbd className="inline-block px-[5px] py-[1px] bg-surface-raised border border-border rounded-[3px] font-mono text-[0.7rem]">
					Ctrl+K
				</kbd>{" "}
				to focus ·{" "}
				<kbd className="inline-block px-[5px] py-[1px] bg-surface-raised border border-border rounded-[3px] font-mono text-[0.7rem]">
					Esc
				</kbd>{" "}
				to clear
			</div>
		</>
	);
}
