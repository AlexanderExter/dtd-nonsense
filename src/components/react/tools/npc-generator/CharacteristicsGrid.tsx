import { GameInput } from "@/components/react/ui/GameInput";
import { CHAR_ABBREV, CHAR_KEYS } from "./constants";

interface CharacteristicsGridProps {
	characteristics: Record<string, number>;
	onChange: (key: string, value: number) => void;
}

export function CharacteristicsGrid({ characteristics, onChange }: CharacteristicsGridProps) {
	return (
		<div className="mb-lg border-border border-b pb-md last:border-b-0">
			<h2 className="m-0 mb-sm text-accent text-sm uppercase tracking-wide-px">Characteristics</h2>
			<div className="grid grid-cols-3 gap-sm">
				{CHAR_KEYS.map((key) => (
					<div className="flex flex-col items-center" key={key}>
						<label
							className="mb-[2px] font-bold text-text-muted text-xs uppercase"
							htmlFor={`char-${CHAR_ABBREV[key].toLowerCase()}`}
						>
							{CHAR_ABBREV[key]}
						</label>
						<GameInput
							className="w-[60px] text-center"
							id={`char-${CHAR_ABBREV[key].toLowerCase()}`}
							max={10}
							min={0}
							onInput={(e) => {
								const val = Number.parseInt((e.target as HTMLInputElement).value, 10) || 0;
								onChange(key, val);
							}}
							type="number"
							value={characteristics[key]}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
