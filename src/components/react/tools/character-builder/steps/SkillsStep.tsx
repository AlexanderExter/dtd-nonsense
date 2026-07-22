import { useEffect } from "react";
import { CHAR_GROUPS } from "@/lib/dtd/constants";
import { CREATION_SKILL_CAP, capitalize, findRaceData, SKILL_PRIORITY_DOTS } from "../constants";
import { DotControl } from "../shared/DotControl";
import { SortablePriority } from "../shared/SortablePriority";
import { useBuilderStore } from "../store";

export function SkillsStep() {
	const meta = useBuilderStore((s) => s.meta);
	const char = useBuilderStore((s) => s.char);
	const data = useBuilderStore((s) => s.gameData);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	const allAssigned =
		meta.skillPriority.physical !== null &&
		meta.skillPriority.social !== null &&
		meta.skillPriority.mental !== null;

	// Auto-assign default priorities if none are set (so dot controls work immediately)
	useEffect(() => {
		if (
			meta.skillPriority.physical === null &&
			meta.skillPriority.social === null &&
			meta.skillPriority.mental === null
		) {
			updateMeta((m) => {
				m.skillPriority.physical = "primary";
				m.skillPriority.social = "secondary";
				m.skillPriority.mental = "tertiary";
				m.stepsCompleted[4] = true;
			});
		}
	}, [meta.skillPriority.physical, meta.skillPriority.social, meta.skillPriority.mental, updateMeta]);

	useEffect(() => {
		if (allAssigned !== meta.stepsCompleted[4]) {
			updateMeta((m) => {
				m.stepsCompleted[4] = allAssigned;
			});
		}
	}, [allAssigned, meta.stepsCompleted, updateMeta]);

	if (!data?.skills?.skills) return <p>Loading skill data…</p>;

	const skillGroups = data.skills.skills as Record<string, any[]>;
	const raceData = findRaceData(data, char.race);

	// Build racial skill bonus map (skip "any" entries - those are free choices)
	const racialSkillBonuses: Record<string, number> = {};
	let freeSkillBonusCount = 0;
	if (raceData?.skillBonus) {
		for (const sb of raceData.skillBonus) {
			const name = typeof sb === "string" ? sb : sb.skill || sb.id;
			const bonus = typeof sb === "string" ? 1 : (sb.value ?? 1);
			if (name === "any") {
				freeSkillBonusCount += typeof sb === "object" ? (sb.count ?? 1) : 1;
			} else if (name) {
				racialSkillBonuses[name.toLowerCase()] = bonus;
			}
		}
	}

	const handlePriorityChange = (group: string, value: string) => {
		updateMeta((m) => {
			m.skillPriority[group] = value;
			m.skillDotsSpent[group] = 0;
			const groupSkills = skillGroups[group] || [];
			for (const sk of groupSkills) {
				const key = sk.id || sk.name;
				updateChar((c) => {
					delete c.skills[key];
				});
			}
		});
	};

	// Priority order state: derive from current assignments or default
	const priorityOrder = (() => {
		const groups = Object.keys(CHAR_GROUPS);
		const priorities = ["primary", "secondary", "tertiary"];
		const ordered: string[] = [];
		for (const p of priorities) {
			const g = groups.find((g) => meta.skillPriority[g] === p);
			if (g) ordered.push(g);
		}
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
		dotLabel: `${SKILL_PRIORITY_DOTS[["primary", "secondary", "tertiary"][idx]]} dots`,
	}));

	const handleDotChange = (group: string, skillKey: string, newVal: number) => {
		const priority = meta.skillPriority[group];
		if (!priority) return;

		const pool = SKILL_PRIORITY_DOTS[priority] || 0;
		const groupSkills = skillGroups[group] || [];

		let otherSpent = 0;
		for (const sk of groupSkills) {
			const key = sk.id || sk.name;
			if (key !== skillKey) {
				otherSpent += char.skills[key] || 0;
			}
		}

		if (newVal < 0 || newVal > CREATION_SKILL_CAP) return;
		if (otherSpent + newVal > pool) return;

		updateChar((c) => {
			if (newVal === 0) {
				delete c.skills[skillKey];
			} else {
				c.skills[skillKey] = newVal;
			}
		});
		updateMeta((m) => {
			m.skillDotsSpent[group] = otherSpent + newVal;
		});
	};

	return (
		<div>
			{freeSkillBonusCount > 0 && (
				<p className="mb-md rounded-sm bg-accent/10 px-md py-sm text-accent text-sm">
					Your race grants{" "}
					<strong>
						+1 to any {freeSkillBonusCount} skill{freeSkillBonusCount > 1 ? "s" : ""}
					</strong>{" "}
					of your choice (applied on the character sheet).
				</p>
			)}
			<h3>Assign Priorities</h3>
			<p className="mb-sm text-text-muted text-xs">Drag to reorder — top gets most dots.</p>
			<div className="mx-auto mb-lg max-w-[320px]">
				<SortablePriority items={sortableItems} onReorder={handleReorder} />
			</div>

			<div className="grid grid-cols-3 gap-md max-tool-lg:grid-cols-1">
				{Object.keys(CHAR_GROUPS).map((groupKey) => {
					const priority = meta.skillPriority[groupKey];
					const pool = priority ? SKILL_PRIORITY_DOTS[priority] || 0 : 0;
					const spent = meta.skillDotsSpent[groupKey] || 0;
					const skills = skillGroups[groupKey] || [];

					return (
						<div className="rounded-md border border-border bg-surface p-md" key={groupKey}>
							<h4 className="mb-xs border-border border-b pb-xs text-center text-accent">
								{CHAR_GROUPS[groupKey].label}{" "}
								{priority && (
									<span className="font-normal text-text-dim text-xs">
										{spent} / {pool} dots
									</span>
								)}
							</h4>
							{skills.map((sk: any) => {
								const key = sk.id || sk.name;
								const dots = char.skills[key] || 0;
								const racialBonus = racialSkillBonuses[key.toLowerCase()] || 0;

								return (
									<div
										className="flex items-center justify-between border-border border-b py-xs last:border-b-0"
										key={key}
									>
										<span className="flex-1 text-sm">
											{sk.name || capitalize(key)}
											{sk.isAdvanced && <span className="ml-1 text-accent text-xs">★</span>}
										</span>
										<DotControl
											disabled={!priority}
											max={CREATION_SKILL_CAP}
											min={0}
											onChange={(v) => handleDotChange(groupKey, key, v)}
											value={dots}
										/>
										{racialBonus > 0 && (
											<span className="ml-xs text-success text-xs">+{racialBonus} racial</span>
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
