import { useCallback } from "preact/hooks";
import { QUICK_SKILLS } from "./constants";

interface SkillListProps {
	skills: Array<{ name: string; dots: number }>;
	skillNames: string[];
	onChange: (skills: Array<{ name: string; dots: number }>) => void;
}

export function SkillList({ skills, skillNames, onChange }: SkillListProps) {
	const addSkill = useCallback(
		(name = "", dots = 1) => {
			onChange([...skills, { name, dots }]);
		},
		[skills, onChange],
	);

	const removeSkill = useCallback(
		(index: number) => {
			onChange(skills.filter((_, i) => i !== index));
		},
		[skills, onChange],
	);

	const updateSkill = useCallback(
		(index: number, field: "name" | "dots", value: string | number) => {
			const updated = skills.map((s, i) => {
				if (i !== index) return s;
				if (field === "name") return { ...s, name: value as string };
				return { ...s, dots: value as number };
			});
			onChange(updated);
		},
		[skills, onChange],
	);

	const addQuickPack = useCallback(
		(packKey: string) => {
			const pack = QUICK_SKILLS[packKey];
			if (!pack) return;
			onChange([...skills, ...pack.map((s) => ({ ...s }))]);
		},
		[skills, onChange],
	);

	return (
		<div class="mb-lg pb-md border-b border-border last:border-b-0">
			<div class="flex items-center justify-between mb-sm">
				<h2 class="text-[0.9rem] uppercase tracking-[0.5px] text-accent m-0">Skills</h2>
				<button type="button" class="btn btn-ghost btn-sm" onClick={() => addSkill()}>
					+ Add
				</button>
			</div>
			<div class="flex gap-xs mb-sm flex-wrap">
				<button type="button" class="btn btn-ghost btn-xs" onClick={() => addQuickPack("combat")}>
					+ Combat
				</button>
				<button type="button" class="btn btn-ghost btn-xs" onClick={() => addQuickPack("social")}>
					+ Social
				</button>
				<button type="button" class="btn btn-ghost btn-xs" onClick={() => addQuickPack("stealth")}>
					+ Stealth
				</button>
			</div>
			<div class="flex flex-col gap-xs">
				{skills.map((skill, i) => (
					<div
						class="flex items-center gap-sm px-sm py-xs bg-surface border border-border rounded-sm"
						key={i}
					>
						<input
							type="text"
							class="flex-1 min-w-0 py-[2px] px-xs text-[0.85rem]"
							value={skill.name}
							placeholder="Skill name"
							list="skill-datalist"
							onInput={(e) => updateSkill(i, "name", (e.target as HTMLInputElement).value)}
						/>
						<input
							type="number"
							class="w-[50px] text-center py-[2px] px-xs text-[0.85rem]"
							min={1}
							max={6}
							value={skill.dots}
							onInput={(e) =>
								updateSkill(i, "dots", Number.parseInt((e.target as HTMLInputElement).value, 10) || 1)
							}
						/>
						<button
							type="button"
							class="bg-transparent border-none text-text-dim cursor-pointer px-[4px] py-[2px] text-base leading-none hover:text-error"
							title="Remove"
							onClick={() => removeSkill(i)}
						>
							×
						</button>
					</div>
				))}
			</div>
			<datalist id="skill-datalist">
				{skillNames.map((name) => (
					<option key={name} value={name} />
				))}
			</datalist>
		</div>
	);
}
