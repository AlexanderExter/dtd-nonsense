import { GameSelect } from "@/components/react/ui/GameSelect";
import { CHAR_GROUPS } from "@/lib/dtd/constants";
import { CREATION_SKILL_CAP, capitalize, findRaceData, SKILL_PRIORITY_DOTS } from "../constants";
import { DotControl } from "../shared/DotControl";
import { useBuilderStore } from "../store";

const PRIORITY_OPTIONS = [
	{ value: "primary", label: "Primary (8 dots)" },
	{ value: "secondary", label: "Secondary (6 dots)" },
	{ value: "tertiary", label: "Tertiary (4 dots)" },
];

export function SkillsStep() {
	const meta = useBuilderStore((s) => s.meta);
	const char = useBuilderStore((s) => s.char);
	const data = useBuilderStore((s) => s.gameData);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	if (!data?.skills?.skills) return <p>Loading skill data…</p>;

	const skillGroups = data.skills.skills as Record<string, any[]>;
	const raceData = findRaceData(data, char.race);

	// Build racial skill bonus map
	const racialSkillBonuses: Record<string, number> = {};
	if (raceData?.skillBonus) {
		for (const sb of raceData.skillBonus) {
			const name = typeof sb === "string" ? sb : sb.skill || sb.id;
			const bonus = typeof sb === "string" ? 1 : (sb.value ?? 1);
			if (name) racialSkillBonuses[name.toLowerCase()] = bonus;
		}
	}

	const allAssigned =
		meta.skillPriority.physical !== null &&
		meta.skillPriority.social !== null &&
		meta.skillPriority.mental !== null;

	if (allAssigned !== meta.stepsCompleted[4]) {
		updateMeta((m) => {
			m.stepsCompleted[4] = allAssigned;
		});
	}

	const handlePriorityChange = (group: string, value: string) => {
		updateMeta((m) => {
			for (const g of Object.keys(m.skillPriority)) {
				if (g !== group && m.skillPriority[g] === value) {
					m.skillPriority[g] = null;
					m.skillDotsSpent[g] = 0;
					// Reset skills in that group
					const groupSkills = skillGroups[g] || [];
					for (const sk of groupSkills) {
						const key = sk.id || sk.name;
						updateChar((c) => {
							delete c.skills[key];
						});
					}
				}
			}
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
			<h3>Assign Priorities</h3>
			<div className="mb-lg grid grid-cols-3 gap-md max-[900px]:grid-cols-1">
				{Object.keys(CHAR_GROUPS).map((groupKey) => {
					const currentPriority = meta.skillPriority[groupKey];
					return (
						<div className="rounded-md border-2 border-border bg-surface p-md text-center" key={groupKey}>
							<h4 className="mb-xs text-accent">{CHAR_GROUPS[groupKey].label}</h4>
							<GameSelect
								onChange={(e) => {
									const val = (e.target as HTMLSelectElement).value;
									if (val) handlePriorityChange(groupKey, val);
								}}
								value={currentPriority || ""}
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

			<div className="grid grid-cols-3 gap-md max-[900px]:grid-cols-1">
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
									<span className="font-normal text-[0.8rem] text-text-dim">
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
										<span className="flex-1 text-[0.9rem]">
											{sk.name || capitalize(key)}
											{sk.isAdvanced && <span className="ml-1 text-[0.7rem] text-accent">★</span>}
										</span>
										<DotControl
											disabled={!priority}
											max={CREATION_SKILL_CAP}
											min={0}
											onChange={(v) => handleDotChange(groupKey, key, v)}
											value={dots}
										/>
										{racialBonus > 0 && (
											<span className="ml-xs text-[0.7rem] text-success">
												+{racialBonus} racial
											</span>
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
