interface DerivedStatEntryProps {
	baseValue: number;
	effValue: number;
	formulaId?: string;
	formulaText: string;
	label: string;
	modField: string;
	modValue: number;
	onModChange: (value: number) => void;
}

export function DerivedStatEntry({
	label,
	formulaText,
	baseValue,
	modValue,
	effValue,
	onModChange,
	formulaId,
}: DerivedStatEntryProps) {
	return (
		<div className="border-border border-b py-xs last:border-b-0">
			<div className="mb-0.5 text-[0.7rem] text-text-muted uppercase tracking-[0.3px]">{label}</div>
			<div className="mt-[1px] text-[0.65rem] text-text-muted tracking-[0.02em] opacity-70" id={formulaId}>
				{formulaText}
			</div>
			<div className="flex items-center gap-1">
				<span className="min-w-[22px] text-center text-[0.85rem] text-text-dim" title="Base value">
					{baseValue}
				</span>
				<span className="text-text-dim text-xs">+</span>
				<GameInput
					className="w-[38px] px-[3px] py-[1px] text-center font-semibold text-[0.8rem]"
					onInput={(e) => onModChange(Number((e.target as HTMLInputElement).value))}
					title="Modifier"
					type="number"
					value={modValue}
				/>
				<span className="text-text-dim text-xs">=</span>
				<span
					className="ml-auto min-w-[26px] text-center font-bold text-[1.15rem] text-accent"
					title="Effective value"
				>
					{effValue}
				</span>
			</div>
		</div>
	);
}
