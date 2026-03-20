import { useCallback } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameTextarea } from "@/components/react/ui/GameTextarea";

interface AbilityEntry {
	description: string;
	name: string;
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
		<div className="mb-lg border-border border-b pb-md last:border-b-0">
			<div className="mb-sm flex items-center justify-between">
				<h2 className="m-0 text-[0.9rem] text-accent uppercase tracking-[0.5px]">Abilities</h2>
				<Button onClick={addAbility} size="sm" variant="ghost">
					+ Add
				</Button>
			</div>
			<div className="flex flex-col gap-xs">
				{abilities.map((a, i) => (
					<div
						className="flex flex-col items-stretch gap-sm rounded-sm border border-border bg-surface px-sm py-xs"
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
						key={`ability-${i}`}
					>
						<div className="flex items-center gap-sm">
							<GameInput
								className="flex-1"
								onInput={(e) => updateAbility(i, "name", (e.target as HTMLInputElement).value)}
								placeholder="Ability name"
								value={a.name}
							/>
							<button
								className="cursor-pointer border-none bg-transparent px-[4px] py-[2px] text-base text-text-dim leading-none hover:text-error"
								onClick={() => removeAbility(i)}
								title="Remove"
								type="button"
							>
								×
							</button>
						</div>
						<GameTextarea
							onInput={(e) => updateAbility(i, "description", (e.target as HTMLTextAreaElement).value)}
							placeholder="Description"
							rows={2}
							value={a.description}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
