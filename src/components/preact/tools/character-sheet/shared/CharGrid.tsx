import { CHAR_GROUPS, CHAR_NAMES } from "@/lib/dtd/constants";
import { charSignal, gameData, updateChar } from "../CharacterSheetApp";
import { CHAR_ABBREV, getEffChars } from "../constants";

export function CharGrid() {
	const char = charSignal.value;
	const data = gameData.value;
	const effChars = getEffChars(char, data?.races);
	const chars = char.characteristics as unknown as Record<string, number>;
	const specs = char.charSpecialties || {};

	const handleCharChange = (id: string, value: number) => {
		const clamped = Math.max(1, Math.min(6, value));
		updateChar((c) => {
			(c.characteristics as unknown as Record<string, number>)[id] = clamped;
		});
	};

	const handleSpecChange = (id: string, value: string) => {
		updateChar((c) => {
			if (!c.charSpecialties) c.charSpecialties = {};
			c.charSpecialties[id] = value;
		});
	};

	return (
		<div class="char-grid">
			{Object.entries(CHAR_GROUPS).map(([groupKey, group]) => (
				<div key={groupKey} class="char-group">
					<h4 class="group-label">{group.label}</h4>
					{group.chars.map((id) => {
						const base = chars[id] || 1;
						const eff = effChars[id] || 1;
						const showSpec = base >= 3;
						const abbrev = CHAR_ABBREV[id] || id;
						const isBonus = char.raceCharBonus === id;
						return (
							<div key={id} class="char-row">
								<span class="char-name" title={CHAR_NAMES[id] || id}>
									{abbrev}
								</span>
								<input
									type="number"
									class="char-base"
									value={base}
									min={1}
									max={6}
									onInput={(e) => handleCharChange(id, Number((e.target as HTMLInputElement).value))}
								/>
								<span
									class={`char-eff ${isBonus ? "has-bonus" : ""}`}
									title={isBonus ? "+1 racial bonus" : ""}
								>
									{eff}
								</span>
								{showSpec && (
									<input
										type="text"
										class="char-spec"
										placeholder="Specialty"
										value={specs[id] || ""}
										onInput={(e) => handleSpecChange(id, (e.target as HTMLInputElement).value)}
									/>
								)}
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}
