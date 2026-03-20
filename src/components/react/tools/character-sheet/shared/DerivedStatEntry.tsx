interface DerivedStatEntryProps {
	label: string;
	formulaText: string;
	baseValue: number;
	modValue: number;
	effValue: number;
	modField: string;
	onModChange: (value: number) => void;
	formulaId?: string;
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
		<div className="py-xs border-b border-border last:border-b-0">
			<div className="text-[0.7rem] text-text-muted uppercase tracking-[0.3px] mb-0.5">{label}</div>
			<div className="text-[0.65rem] text-text-muted opacity-70 tracking-[0.02em] mt-[1px]" id={formulaId}>
				{formulaText}
			</div>
			<div className="flex items-center gap-1">
				<span className="text-[0.85rem] text-text-dim min-w-[22px] text-center" title="Base value">
					{baseValue}
				</span>
				<span className="text-xs text-text-dim">+</span>
				<GameInput
					type="number"
					className="w-[38px] py-[1px] px-[3px] text-center text-[0.8rem] font-semibold"
					title="Modifier"
					value={modValue}
					onInput={(e) => onModChange(Number((e.target as HTMLInputElement).value))}
				/>
				<span className="text-xs text-text-dim">=</span>
				<span
					className="font-bold text-[1.15rem] text-accent min-w-[26px] text-center ml-auto"
					title="Effective value"
				>
					{effValue}
				</span>
			</div>
		</div>
	);
}
