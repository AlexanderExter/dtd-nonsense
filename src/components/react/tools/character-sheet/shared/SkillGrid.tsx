import { Badge } from "@/components/react/ui/Badge";
import { GameInput } from "@/components/react/ui/GameInput";
import { NumberInput } from "@/components/react/ui/NumberInput";
import { useCharSheetStore } from "../store";

export function SkillGrid() {
	const char = useCharSheetStore((s) => s.char);
	const data = useCharSheetStore((s) => s.gameData);
	const updateChar = useCharSheetStore((s) => s.updateChar);
	const skills = char.skills || {};
	const specs = char.skillSpecialties || {};

	if (!data?.skills) return <div className="p-md text-text-muted">Loading skills…</div>;

	const groups = data.skills.skills || {};

	const handleDotsChange = (id: string, value: number) => {
		const clamped = Math.max(0, Math.min(6, value));
		updateChar((c) => {
			c.skills[id] = clamped;
		});
	};

	const handleSpecChange = (id: string, value: string) => {
		updateChar((c) => {
			if (!c.skillSpecialties) c.skillSpecialties = {};
			c.skillSpecialties[id] = value;
		});
	};

	return (
		<div className="grid grid-cols-3 gap-md max-[768px]:grid-cols-1">
			{Object.entries(groups).map(([groupKey, skillList]) => (
				<div className="rounded-sm border border-border bg-bg p-md" key={groupKey}>
					<h4 className="m-0 mb-sm text-[0.85rem] text-accent uppercase tracking-[0.5px]">
						{groupKey.charAt(0).toUpperCase() + groupKey.slice(1)}
					</h4>
					{(skillList as Array<{ id: string; name: string; advanced?: boolean }>).map((sk) => {
						const dots = skills[sk.id] || 0;
						const showSpec = dots >= 4;
						return (
							<div className="flex items-center gap-sm py-[3px] text-[0.85rem]" key={sk.id}>
								<span className="flex-1 font-medium" title={sk.advanced ? "Advanced skill" : ""}>
									{sk.name}
									{sk.advanced && (
										<Badge className="ml-1" size="sm" variant="warning">
											★
										</Badge>
									)}
								</span>
								<NumberInput
									max={6}
									min={0}
									onChange={(v) => handleDotsChange(sk.id, v)}
									value={dots}
								/>
								{showSpec && (
									<GameInput
										className="w-full bg-surface-raised text-[0.78rem] text-text-muted placeholder:text-text-dim"
										onInput={(e) => handleSpecChange(sk.id, (e.target as HTMLInputElement).value)}
										placeholder="Specialty"
										type="text"
										value={specs[sk.id] || ""}
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
