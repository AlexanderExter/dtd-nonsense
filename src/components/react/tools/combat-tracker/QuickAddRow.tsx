import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameInput } from "@/components/react/ui/GameInput";

interface QuickAddRowProps {
	onImportSheet: () => void;
	onQuickAdd: (name: string, initTotal: number) => void;
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
		<div className="mb-lg flex flex-wrap items-center gap-sm rounded-md border border-border bg-surface p-sm max-tool-md:flex-col max-tool-md:items-stretch">
			<GameInput
				className="min-w-[100px] flex-1 max-tool-md:w-full max-tool-md:flex-none"
				onInput={(e) => setName((e.target as HTMLInputElement).value)}
				onKeyDown={handleKeyDown}
				placeholder="Quick add name"
				type="text"
				value={name}
			/>
			<GameInput
				className="w-[100px] flex-none max-tool-md:w-full"
				onInput={(e) => setInitTotal(Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)}
				onKeyDown={handleKeyDown}
				placeholder="Init"
				type="number"
				value={initTotal}
			/>
			<Button onClick={handleAdd} size="sm" variant="primary">
				Quick Add
			</Button>
			<Button onClick={onImportSheet} size="sm">
				Import from Sheet
			</Button>
			<Button onClick={onRollAll} size="sm">
				Roll All Initiative
			</Button>
		</div>
	);
}
