import { charSignal, gameData, updateChar } from "../CharacterSheetApp";

export function SkillGrid() {
	const char = charSignal.value;
	const data = gameData.value;
	const skills = char.skills || {};
	const specs = char.skillSpecialties || {};

	if (!data?.skills) return <div class="skill-grid-empty">Loading skills…</div>;

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
		<div class="skill-grid">
			{Object.entries(groups).map(([groupKey, skillList]) => (
				<div key={groupKey} class="skill-group">
					<h4 class="group-label">{groupKey.charAt(0).toUpperCase() + groupKey.slice(1)}</h4>
					{(skillList as Array<{ id: string; name: string; advanced?: boolean }>).map((sk) => {
						const dots = skills[sk.id] || 0;
						const showSpec = dots >= 1;
						return (
							<div key={sk.id} class="skill-row">
								<span class="skill-name" title={sk.advanced ? "Advanced skill" : ""}>
									{sk.name}
									{sk.advanced && <span class="advanced-marker"> ★</span>}
								</span>
								<input
									type="number"
									class="skill-dots"
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
										class="skill-spec"
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
