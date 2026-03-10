import { useState } from "preact/hooks";

interface QuickAddRowProps {
	onQuickAdd: (name: string, initTotal: number) => void;
	onImportSheet: () => void;
	onRollAll: () => void;
}

export function QuickAddRow({ onQuickAdd, onImportSheet, onRollAll }: QuickAddRowProps) {
	const [name, setName] = useState("");
	const [initTotal, setInitTotal] = useState(0);

	const handleAdd = () => {
		const trimmed = name.trim();
		if (!trimmed) return;
		onQuickAdd(trimmed, initTotal);
		setName("");
		setInitTotal(0);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") handleAdd();
	};

	return (
		<div class="flex flex-wrap gap-sm items-center mb-lg p-sm bg-surface border border-border rounded-md max-[768px]:flex-col max-[768px]:items-stretch">
			<input
				type="text"
				class="flex-1 min-w-[100px] max-[768px]:flex-none max-[768px]:w-full"
				placeholder="Quick add name"
				value={name}
				onInput={(e) => setName((e.target as HTMLInputElement).value)}
				onKeyDown={handleKeyDown}
			/>
			<input
				type="number"
				class="flex-none w-[100px] max-[768px]:w-full"
				placeholder="Init"
				value={initTotal}
				onInput={(e) => setInitTotal(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
				onKeyDown={handleKeyDown}
			/>
			<button type="button" class="btn btn-primary btn-sm" onClick={handleAdd}>
				Quick Add
			</button>
			<button type="button" class="btn btn-secondary btn-sm" onClick={onImportSheet}>
				Import from Sheet
			</button>
			<button type="button" class="btn btn-secondary btn-sm" onClick={onRollAll}>
				Roll All Initiative
			</button>
		</div>
	);
}
