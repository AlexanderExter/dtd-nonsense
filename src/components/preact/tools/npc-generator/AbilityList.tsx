import { useCallback } from "preact/hooks";
import { Button } from "@/components/preact/ui";

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
		<div class="mb-lg pb-md border-b border-border last:border-b-0">
			<div class="flex items-center justify-between mb-sm">
				<h2 class="text-[0.9rem] uppercase tracking-[0.5px] text-accent m-0">Abilities</h2>
				<Button variant="ghost" size="sm" onClick={addAbility}>
					+ Add
				</Button>
			</div>
			<div class="flex flex-col gap-xs">
				{abilities.map((a, i) => (
					<div
						class="flex flex-col items-stretch gap-sm px-sm py-xs bg-surface border border-border rounded-sm"
						key={i}
					>
						<div class="flex items-center gap-sm">
							<input
								type="text"
								class="flex-1 py-[2px] px-xs text-[0.85rem]"
								placeholder="Ability name"
								value={a.name}
								onInput={(e) => updateAbility(i, "name", (e.target as HTMLInputElement).value)}
							/>
							<button
								type="button"
								class="bg-transparent border-none text-text-dim cursor-pointer px-[4px] py-[2px] text-base leading-none hover:text-error"
								title="Remove"
								onClick={() => removeAbility(i)}
							>
								×
							</button>
						</div>
						<textarea
							class="text-[0.85rem] py-xs resize-y min-h-[40px]"
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
