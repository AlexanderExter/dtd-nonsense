import { GameSelect } from "@/components/react/ui/GameSelect";
import { CHAR_GROUPS, CHAR_NAMES } from "@/lib/dtd/constants";
import { BASE_CHAR_DOT, CHAR_PRIORITY_DOTS, CREATION_CHAR_CAP, capitalize, findRaceData } from "../constants";
import { DotControl } from "../shared/DotControl";
import { useBuilderStore } from "../store";

const PRIORITY_OPTIONS = [
	{ value: "primary", label: "Primary (6 dots)" },
	{ value: "secondary", label: "Secondary (4 dots)" },
	{ value: "tertiary", label: "Tertiary (2 dots)" },
];

export function CharacteristicsStep() {
	const meta = useBuilderStore((s) => s.meta);
	const char = useBuilderStore((s) => s.char);
	const data = useBuilderStore((s) => s.gameData);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);
	const raceData = findRaceData(data, char.race);
	const racialBonuses = new Set<string>();

	if (raceData) {
		// charBonus.options lists the eligible characteristics; the chosen one is raceCharBonus
		if (char.raceCharBonus) racialBonuses.add(char.raceCharBonus.toLowerCase());
	}

	const allAssigned =
		meta.charPriority.physical !== null && meta.charPriority.social !== null && meta.charPriority.mental !== null;

	// Mark step complete when all priorities assigned
	if (allAssigned !== meta.stepsCompleted[3]) {
		updateMeta((m) => {
			m.stepsCompleted[3] = allAssigned;
		});
	}

	const handlePriorityChange = (group: string, value: string) => {
		updateMeta((m) => {
			// Clear any other group that had this priority
			for (const g of Object.keys(m.charPriority)) {
				if (g !== group && m.charPriority[g] === value) {
					m.charPriority[g] = null;
					m.charDotsSpent[g] = 0;
					// Reset chars in that group to base
					const groupChars = CHAR_GROUPS[g]?.chars || [];
					for (const ch of groupChars) {
						updateChar((c) => {
							c.characteristics[ch as keyof typeof c.characteristics] = BASE_CHAR_DOT;
						});
					}
				}
			}
			m.charPriority[group] = value;
			// Reset this group's allocation
			m.charDotsSpent[group] = 0;
			const groupChars = CHAR_GROUPS[group]?.chars || [];
			for (const ch of groupChars) {
				updateChar((c) => {
					c.characteristics[ch as keyof typeof c.characteristics] = BASE_CHAR_DOT;
				});
			}
		});
	};

	const handleDotChange = (group: string, charKey: string, newTotal: number) => {
		const priority = meta.charPriority[group];
		if (!priority) return;

		const pool = CHAR_PRIORITY_DOTS[priority] || 0;
		const allocated = newTotal - BASE_CHAR_DOT;
		const groupChars = CHAR_GROUPS[group]?.chars || [];

		// Sum dots spent on other chars in this group
		let otherSpent = 0;
		for (const ch of groupChars) {
			if (ch !== charKey) {
				otherSpent +=
					(char.characteristics[ch as keyof typeof char.characteristics] || BASE_CHAR_DOT) - BASE_CHAR_DOT;
			}
		}

		if (allocated < 0 || otherSpent + allocated > pool) return;
		if (newTotal > CREATION_CHAR_CAP) return;
		if (newTotal < BASE_CHAR_DOT) return;

		updateChar((c) => {
			c.characteristics[charKey as keyof typeof c.characteristics] = newTotal;
		});
		updateMeta((m) => {
			m.charDotsSpent[group] = otherSpent + allocated;
		});
	};

	return (
		<div>
			<h3>Assign Priorities</h3>
			<div className="grid grid-cols-3 gap-md mb-lg max-[900px]:grid-cols-1">
				{Object.entries(CHAR_GROUPS).map(([groupKey, group]) => {
					const currentPriority = meta.charPriority[groupKey];
					return (
						<div key={groupKey} className="bg-surface border-2 border-border rounded-md p-md text-center">
							<h4 className="text-accent mb-xs">{group.label}</h4>
							<GameSelect
								value={currentPriority || ""}
								onChange={(e) => {
									const val = (e.target as HTMLSelectElement).value;
									if (val) handlePriorityChange(groupKey, val);
								}}
							>
								<option value="">— Select —</option>
								{PRIORITY_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</GameSelect>
						</div>
					);
				})}
			</div>

			{/* Dot allocation columns */}
			<div className="grid grid-cols-3 gap-md max-[900px]:grid-cols-1">
				{Object.entries(CHAR_GROUPS).map(([groupKey, group]) => {
					const priority = meta.charPriority[groupKey];
					const pool = priority ? CHAR_PRIORITY_DOTS[priority] || 0 : 0;
					const spent = meta.charDotsSpent[groupKey] || 0;

					return (
						<div key={groupKey} className="bg-surface border border-border rounded-md p-md">
							<h4 className="text-center text-accent mb-xs pb-xs border-b border-border">
								{group.label}{" "}
								{priority && (
									<span className="text-[0.8rem] text-text-dim font-normal">
										{spent} / {pool} dots
									</span>
								)}
							</h4>
							{group.chars.map((charKey) => {
								const baseVal =
									char.characteristics[charKey as keyof typeof char.characteristics] || BASE_CHAR_DOT;
								const hasRacial = racialBonuses.has(charKey);

								return (
									<div
										key={charKey}
										className="flex justify-between items-center py-xs border-b border-border last:border-b-0"
									>
										<span className="text-[0.9rem] flex-1">
											{CHAR_NAMES[charKey] || capitalize(charKey)}
										</span>
										<DotControl
											value={baseVal}
											max={CREATION_CHAR_CAP}
											min={BASE_CHAR_DOT}
											racialDots={hasRacial ? 1 : 0}
											disabled={!priority}
											onChange={(v) => handleDotChange(groupKey, charKey, v)}
										/>
										{hasRacial && (
											<span className="text-[0.7rem] text-success ml-xs">+1 racial</span>
										)}
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
}
