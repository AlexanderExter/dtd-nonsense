import { GameInput } from "@/components/react/ui/GameInput";
import { CHAR_GROUPS, CHAR_NAMES } from "@/lib/dtd/constants";
import { cn } from "@/lib/utils";
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
				<div className="rounded-sm border border-border bg-bg p-md" key={groupKey}>
					<h4 className="m-0 mb-sm text-[0.85rem] text-accent uppercase tracking-[0.5px]">{group.label}</h4>
					{group.chars.map((id) => {
						const base = chars[id] || 1;
						const eff = effChars[id] || 1;
						const showSpec = base >= 3;
						const abbrev = CHAR_ABBREV[id] || id;
						const isBonus = char.raceCharBonus === id;
						return (
							<div className="flex items-center gap-sm py-1" key={id}>
								<span className="flex-1 font-medium text-[0.9rem]" title={CHAR_NAMES[id] || id}>
									{abbrev}
								</span>
								<GameInput
									className="w-11 text-center font-semibold text-[0.9rem]"
									max={6}
									min={1}
									onInput={(e) => handleCharChange(id, Number((e.target as HTMLInputElement).value))}
									type="number"
									value={base}
								/>
								<span
									className={cn(
										"min-w-5 text-center font-bold text-accent text-base",
										isBonus && "text-info",
									)}
									title={isBonus ? "+1 racial bonus" : ""}
								>
									{eff}
								</span>
								{showSpec && (
									<GameInput
										className="w-full bg-surface-raised text-[0.78rem] text-text-muted placeholder:text-text-dim"
										onInput={(e) => handleSpecChange(id, (e.target as HTMLInputElement).value)}
										placeholder="Specialty"
										type="text"
										value={specs[id] || ""}
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
