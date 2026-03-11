import { Badge } from "@/components/preact/ui";
import { charSignal, gameData, updateChar } from "../CharacterSheetApp";

export function SkillGrid() {
	const char = charSignal.value;
	const data = gameData.value;
	const skills = char.skills || {};
	const specs = char.skillSpecialties || {};

	if (!data?.skills) return <div class="text-text-muted p-md">Loading skills…</div>;

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
		<div class="grid grid-cols-3 gap-md max-[768px]:grid-cols-1">
			{Object.entries(groups).map(([groupKey, skillList]) => (
				<div key={groupKey} class="bg-bg border border-border rounded-sm p-md">
					<h4 class="m-0 mb-sm text-accent text-[0.85rem] uppercase tracking-[0.5px]">
						{groupKey.charAt(0).toUpperCase() + groupKey.slice(1)}
					</h4>
					{(skillList as Array<{ id: string; name: string; advanced?: boolean }>).map((sk) => {
						const dots = skills[sk.id] || 0;
						const showSpec = dots >= 1;
						return (
							<div key={sk.id} class="flex items-center gap-sm py-[3px] text-[0.85rem]">
								<span class="flex-1 font-medium" title={sk.advanced ? "Advanced skill" : ""}>
									{sk.name}
									{sk.advanced && (
										<Badge variant="warning" size="sm" class="ml-1">
											★
										</Badge>
									)}
								</span>
								<input
									type="number"
									class="w-11 py-0.5 px-1 text-center font-semibold text-[0.9rem]"
									value={dots}
									min={0}
									max={6}
									onInput={(e) =>
										handleDotsChange(sk.id, Number((e.target as HTMLInputElement).value))
									}
								/>
								{showSpec && (
									<input
										type="text"
										class="w-full text-[0.78rem] px-sm py-0.5 mt-0.5 text-text-muted bg-surface-raised border border-border rounded-[3px] placeholder:text-text-dim"
										placeholder="Specialty"
										value={specs[sk.id] || ""}
										onInput={(e) => handleSpecChange(sk.id, (e.target as HTMLInputElement).value)}
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
