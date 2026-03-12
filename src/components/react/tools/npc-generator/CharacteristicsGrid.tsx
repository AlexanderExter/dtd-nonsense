import { CHAR_ABBREV, CHAR_KEYS } from "./constants";

interface CharacteristicsGridProps {
	characteristics: Record<string, number>;
	onChange: (key: string, value: number) => void;
}

export function CharacteristicsGrid({ characteristics, onChange }: CharacteristicsGridProps) {
	return (
		<div className="mb-lg pb-md border-b border-border last:border-b-0">
			<h2 className="text-[0.9rem] uppercase tracking-[0.5px] text-accent m-0 mb-sm">Characteristics</h2>
			<div className="grid grid-cols-3 gap-sm">
				{CHAR_KEYS.map((key) => (
					<div className="flex flex-col items-center" key={key}>
						<label
							className="text-[0.75rem] font-bold uppercase text-text-muted mb-[2px]"
							htmlFor={`char-${CHAR_ABBREV[key].toLowerCase()}`}
						>
							{CHAR_ABBREV[key]}
						</label>
						<input
							type="number"
							id={`char-${CHAR_ABBREV[key].toLowerCase()}`}
							className="w-[60px] text-center py-xs text-base font-semibold"
							min={0}
							max={10}
							value={characteristics[key]}
							onInput={(e) => {
								const val = Number.parseInt((e.target as HTMLInputElement).value, 10) || 0;
								onChange(key, val);
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
