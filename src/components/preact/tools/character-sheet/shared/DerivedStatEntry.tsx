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
		<div class="derived-stat-entry">
			<div class="derived-label">{label}</div>
			<div class="derived-formula" id={formulaId}>
				{formulaText}
			</div>
			<div class="derived-values">
				<span class="derived-base" title="Base value">
					{baseValue}
				</span>
				<span class="derived-plus">+</span>
				<input
					type="number"
					class="derived-mod"
					title="Modifier"
					value={modValue}
					onInput={(e) => onModChange(Number((e.target as HTMLInputElement).value))}
				/>
				<span class="derived-eq">=</span>
				<span class="derived-eff" title="Effective value">
					{effValue}
				</span>
			</div>
		</div>
	);
}
