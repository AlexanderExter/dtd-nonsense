import { useEffect } from "react";
import { CHAR_GROUPS, CHAR_NAMES } from "@/lib/dtd/constants";
import { BASE_CHAR_DOT, CHAR_PRIORITY_DOTS, CREATION_CHAR_CAP, capitalize, findRaceData } from "../constants";
import { DotControl } from "../shared/DotControl";
import { SortablePriority } from "../shared/SortablePriority";
import { useBuilderStore } from "../store";

export function CharacteristicsStep() {
	const meta = useBuilderStore((s) => s.meta);
	const char = useBuilderStore((s) => s.char);
	const data = useBuilderStore((s) => s.gameData);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);
	const raceData = findRaceData(data, char.race);
	const racialBonuses = new Set<string>();

	if (raceData && char.raceCharBonus) {
		// charBonus.options lists the eligible characteristics; the chosen one is raceCharBonus
		racialBonuses.add(char.raceCharBonus.toLowerCase());
	}

	const allAssigned =
		meta.charPriority.physical !== null && meta.charPriority.social !== null && meta.charPriority.mental !== null;

	// Auto-assign default priorities if none are set (so dot controls work immediately)
	useEffect(() => {
		if (
			meta.charPriority.physical === null &&
			meta.charPriority.social === null &&
			meta.charPriority.mental === null
		) {
			updateMeta((m) => {
				m.charPriority.physical = "primary";
				m.charPriority.social = "secondary";
				m.charPriority.mental = "tertiary";
				m.stepsCompleted[3] = true;
			});
		}
	}, [meta.charPriority.physical, meta.charPriority.social, meta.charPriority.mental, updateMeta]);

	// Mark step complete when all priorities assigned
	useEffect(() => {
		if (allAssigned !== meta.stepsCompleted[3]) {
			updateMeta((m) => {
				m.stepsCompleted[3] = allAssigned;
			});
		}
	}, [allAssigned, meta.stepsCompleted, updateMeta]);

	const handlePriorityChange = (group: string, value: string) => {
		updateMeta((m) => {
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

	// Priority order state: derive from current assignments or default
	const priorityOrder = (() => {
		const groups = Object.keys(CHAR_GROUPS);
		const priorities = ["primary", "secondary", "tertiary"];
		// Build order from current assignments
		const ordered: string[] = [];
		for (const p of priorities) {
			const g = groups.find((g) => meta.charPriority[g] === p);
			if (g) ordered.push(g);
		}
		// Add any unassigned groups at the end
		for (const g of groups) {
			if (!ordered.includes(g)) ordered.push(g);
		}
		return ordered;
	})();

	const handleReorder = (newOrder: string[]) => {
		const priorities = ["primary", "secondary", "tertiary"];
		for (let i = 0; i < newOrder.length; i++) {
			handlePriorityChange(newOrder[i], priorities[i]);
		}
	};

	const sortableItems = priorityOrder.map((groupKey, idx) => ({
		id: groupKey,
		label: CHAR_GROUPS[groupKey].label,
		dotLabel: `${CHAR_PRIORITY_DOTS[["primary", "secondary", "tertiary"][idx]]} dots`,
	}));

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
			<p className="mb-sm text-text-muted text-xs">Drag to reorder — top gets most dots.</p>
			<div className="mx-auto mb-lg max-w-[320px]">
				<SortablePriority items={sortableItems} onReorder={handleReorder} />
			</div>

			{/* Dot allocation columns */}
			<div className="grid grid-cols-3 gap-md max-tool-lg:grid-cols-1">
				{Object.entries(CHAR_GROUPS).map(([groupKey, group]) => {
					const priority = meta.charPriority[groupKey];
					const pool = priority ? CHAR_PRIORITY_DOTS[priority] || 0 : 0;
					const spent = meta.charDotsSpent[groupKey] || 0;

					return (
						<div className="rounded-md border border-border bg-surface p-md" key={groupKey}>
							<h4 className="mb-xs border-border border-b pb-xs text-center text-accent">
								{group.label}{" "}
								{priority && (
									<span className="font-normal text-text-dim text-xs">
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
										className="flex items-center justify-between border-border border-b py-xs last:border-b-0"
										key={charKey}
									>
										<span className="flex-1 text-sm">
											{CHAR_NAMES[charKey] || capitalize(charKey)}
										</span>
										<DotControl
											disabled={!priority}
											max={CREATION_CHAR_CAP}
											min={BASE_CHAR_DOT}
											onChange={(v) => handleDotChange(groupKey, charKey, v)}
											racialDots={hasRacial ? 1 : 0}
											value={baseVal}
										/>
										{hasRacial && <span className="ml-xs text-success text-xs">+1 racial</span>}
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
