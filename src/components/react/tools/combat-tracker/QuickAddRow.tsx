import { useState } from "react";
import { Button } from "@/components/react/ui/Button";

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

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleAdd();
	};

	return (
		<div className="flex flex-wrap gap-sm items-center mb-lg p-sm bg-surface border border-border rounded-md max-[768px]:flex-col max-[768px]:items-stretch">
			<input
				type="text"
				className="flex-1 min-w-[100px] max-[768px]:flex-none max-[768px]:w-full"
				placeholder="Quick add name"
				value={name}
				onInput={(e) => setName((e.target as HTMLInputElement).value)}
				onKeyDown={handleKeyDown}
			/>
			<input
				type="number"
				className="flex-none w-[100px] max-[768px]:w-full"
				placeholder="Init"
				value={initTotal}
				onInput={(e) => setInitTotal(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
				onKeyDown={handleKeyDown}
			/>
			<Button variant="primary" size="sm" onClick={handleAdd}>
				Quick Add
			</Button>
			<Button size="sm" onClick={onImportSheet}>
				Import from Sheet
			</Button>
			<Button size="sm" onClick={onRollAll}>
				Roll All Initiative
			</Button>
		</div>
	);
}
