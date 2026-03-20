import { useCallback } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameTextarea } from "@/components/react/ui/GameTextarea";

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
		<div className="mb-lg pb-md border-b border-border last:border-b-0">
			<div className="flex items-center justify-between mb-sm">
				<h2 className="text-[0.9rem] uppercase tracking-[0.5px] text-accent m-0">Abilities</h2>
				<Button variant="ghost" size="sm" onClick={addAbility}>
					+ Add
				</Button>
			</div>
			<div className="flex flex-col gap-xs">
				{abilities.map((a, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
						key={`ability-${i}`}
						className="flex flex-col items-stretch gap-sm px-sm py-xs bg-surface border border-border rounded-sm"
					>
						<div className="flex items-center gap-sm">
							<GameInput
								className="flex-1"
								placeholder="Ability name"
								value={a.name}
								onInput={(e) => updateAbility(i, "name", (e.target as HTMLInputElement).value)}
							/>
							<button
								type="button"
								className="bg-transparent border-none text-text-dim cursor-pointer px-[4px] py-[2px] text-base leading-none hover:text-error"
								title="Remove"
								onClick={() => removeAbility(i)}
							>
								×
							</button>
						</div>
						<GameTextarea
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
