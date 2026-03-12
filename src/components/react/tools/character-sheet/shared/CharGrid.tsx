import { CHAR_GROUPS, CHAR_NAMES } from "@/lib/dtd/constants";
import { CHAR_ABBREV, getEffChars } from "../constants";
import { useCharSheetStore } from "../store";

export function CharGrid() {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);
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
		<div className="grid grid-cols-3 gap-md max-[768px]:grid-cols-1">
			{Object.entries(CHAR_GROUPS).map(([groupKey, group]) => (
				<div key={groupKey} className="bg-bg border border-border rounded-sm p-md">
					<h4 className="m-0 mb-sm text-accent text-[0.85rem] uppercase tracking-[0.5px]">{group.label}</h4>
					{group.chars.map((id) => {
						const base = chars[id] || 1;
						const eff = effChars[id] || 1;
						const showSpec = base >= 3;
						const abbrev = CHAR_ABBREV[id] || id;
						const isBonus = char.raceCharBonus === id;
						return (
							<div key={id} className="flex items-center gap-sm py-1">
								<span className="flex-1 font-medium text-[0.9rem]" title={CHAR_NAMES[id] || id}>
									{abbrev}
								</span>
								<input
									type="number"
									className="w-11 py-0.5 px-1 text-center font-semibold text-[0.9rem]"
									value={base}
									min={1}
									max={6}
									onInput={(e) => handleCharChange(id, Number((e.target as HTMLInputElement).value))}
								/>
								<span
									className={[
										"font-bold text-accent min-w-5 text-center text-base",
										isBonus && "text-info",
									]
										.filter(Boolean)
										.join(" ")}
									title={isBonus ? "+1 racial bonus" : ""}
								>
									{eff}
								</span>
								{showSpec && (
									<input
										type="text"
										className="w-full text-[0.78rem] px-sm py-0.5 mt-0.5 text-text-muted bg-surface-raised border border-border rounded-[3px] placeholder:text-text-dim"
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
