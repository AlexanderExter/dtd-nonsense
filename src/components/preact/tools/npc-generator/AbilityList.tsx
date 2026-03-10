import { useCallback } from "preact/hooks";

interface AbilityEntry {
	name: string;
	description: string;
}

interface AbilityListProps {
	abilities: AbilityEntry[];
	onChange: (abilities: AbilityEntry[]) => void;
}

export function AbilityList({ abilities, onChange }: AbilityListProps) {
	const addAbility = useCallback(() => {
		onChange([...abilities, { name: "", description: "" }]);
	}, [abilities, onChange]);

	const removeAbility = useCallback(
		(index: number) => {
			onChange(abilities.filter((_, i) => i !== index));
		},
		[abilities, onChange],
	);

	const updateAbility = useCallback(
		(index: number, field: "name" | "description", value: string) => {
			const updated = abilities.map((a, i) => (i === index ? { ...a, [field]: value } : a));
			onChange(updated);
		},
		[abilities, onChange],
	);

	return (
		<div class="input-section">
			<div class="section-header">
				<h2 class="section-title">Abilities</h2>
				<button type="button" class="btn btn-ghost btn-sm" onClick={addAbility}>
					+ Add
				</button>
			</div>
			<div class="list-entries">
				{abilities.map((a, i) => (
					<div class="list-entry ability-entry" key={i}>
						<div class="ability-header">
							<input
								type="text"
								class="ability-name"
								placeholder="Ability name"
								value={a.name}
								onInput={(e) => updateAbility(i, "name", (e.target as HTMLInputElement).value)}
							/>
							<button type="button" class="entry-remove" title="Remove" onClick={() => removeAbility(i)}>
								×
							</button>
						</div>
						<textarea
							class="ability-desc"
							placeholder="Description"
							rows={2}
							value={a.description}
							onInput={(e) => updateAbility(i, "description", (e.target as HTMLTextAreaElement).value)}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
