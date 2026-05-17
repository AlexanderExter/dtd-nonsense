import { useCallback } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameInput } from "@/components/react/ui/GameInput";
import { QUICK_SKILLS } from "./constants";

interface SkillListProps {
	onChange: (skills: Array<{ name: string; dots: number }>) => void;
	skillNames: string[];
	skills: Array<{ name: string; dots: number }>;
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
		<div className="mb-lg border-border border-b pb-md last:border-b-0">
			<div className="mb-sm flex items-center justify-between">
				<h2 className="m-0 text-accent text-sm uppercase tracking-wide-px">Skills</h2>
				<Button onClick={() => addSkill()} size="sm" variant="ghost">
					+ Add
				</Button>
			</div>
			<div className="mb-sm flex flex-wrap gap-xs">
				<Button onClick={() => addQuickPack("combat")} size="xs" variant="ghost">
					+ Combat
				</Button>
				<Button onClick={() => addQuickPack("social")} size="xs" variant="ghost">
					+ Social
				</Button>
				<Button onClick={() => addQuickPack("stealth")} size="xs" variant="ghost">
					+ Stealth
				</Button>
			</div>
			<div className="flex flex-col gap-xs">
				{skills.map((skill, i) => (
					<div
						className="flex items-center gap-sm rounded-sm border border-border bg-surface px-sm py-xs"
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
						key={`skill-${i}`}
					>
						<GameInput
							className="min-w-0 flex-1"
							list="skill-datalist"
							onInput={(e) => updateSkill(i, "name", (e.target as HTMLInputElement).value)}
							placeholder="Skill name"
							value={skill.name}
						/>
						<GameInput
							className="w-[50px]"
							max={6}
							min={1}
							onInput={(e) =>
								updateSkill(i, "dots", Number.parseInt((e.target as HTMLInputElement).value, 10) || 1)
							}
							type="number"
							value={skill.dots}
						/>
						<button
							className="cursor-pointer border-none bg-transparent px-[4px] py-[2px] text-base text-text-dim leading-none hover:text-error"
							onClick={() => removeSkill(i)}
							title="Remove"
							type="button"
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
