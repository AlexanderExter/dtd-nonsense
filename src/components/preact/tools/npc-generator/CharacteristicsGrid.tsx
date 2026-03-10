import { CHAR_ABBREV, CHAR_KEYS } from "./constants";

interface CharacteristicsGridProps {
	characteristics: Record<string, number>;
	onChange: (key: string, value: number) => void;
}

export function CharacteristicsGrid({ characteristics, onChange }: CharacteristicsGridProps) {
	return (
		<div class="input-section">
			<h2 class="section-title">Characteristics</h2>
			<div class="char-grid">
				{CHAR_KEYS.map((key) => (
					<div class="char-cell" key={key}>
						<label for={`char-${CHAR_ABBREV[key].toLowerCase()}`}>{CHAR_ABBREV[key]}</label>
						<input
							type="number"
							id={`char-${CHAR_ABBREV[key].toLowerCase()}`}
							class="char-input"
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
