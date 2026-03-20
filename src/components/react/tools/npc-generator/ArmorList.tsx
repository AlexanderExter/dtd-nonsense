import { useCallback } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import { ARMOR_LOCATIONS } from "./constants";

interface ArmorEntry {
	ap: number;
	locations: string[];
	name: string;
}

interface ArmorListProps {
	armor: ArmorEntry[];
	onChange: (armor: ArmorEntry[]) => void;
}

export function ArmorList({ armor, onChange }: ArmorListProps) {
	const addArmor = useCallback(() => {
		onChange([...armor, { name: "", ap: 0, locations: [] }]);
	}, [armor, onChange]);

	const removeArmor = useCallback(
		(index: number) => {
			onChange(armor.filter((_, i) => i !== index));
		},
		[armor, onChange],
	);

	const updateField = useCallback(
		(index: number, field: "name" | "ap", value: string | number) => {
			const updated = armor.map((a, i) => {
				if (i !== index) return a;
				if (field === "name") return { ...a, name: value as string };
				return { ...a, ap: value as number };
			});
			onChange(updated);
		},
		[armor, onChange],
	);

	const toggleLocation = useCallback(
		(index: number, loc: string, checked: boolean) => {
			const updated = armor.map((a, i) => {
				if (i !== index) return a;
				const locs = checked ? [...a.locations, loc] : a.locations.filter((l) => l !== loc);
				return { ...a, locations: locs };
			});
			onChange(updated);
		},
		[armor, onChange],
	);

	return (
		<div className="mb-lg border-border border-b pb-md last:border-b-0">
			<div className="mb-sm flex items-center justify-between">
				<h2 className="m-0 text-[0.9rem] text-accent uppercase tracking-[0.5px]">Armor</h2>
				<Button onClick={addArmor} size="sm" variant="ghost">
					+ Add
				</Button>
			</div>
			<div className="flex flex-col gap-xs">
				{armor.map((a, i) => (
					<div
						className="flex flex-wrap items-center gap-sm rounded-sm border border-border bg-surface px-sm py-xs"
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
						key={`armor-${i}`}
					>
						<GameInput
							className="min-w-[100px] flex-1"
							onInput={(e) => updateField(i, "name", (e.target as HTMLInputElement).value)}
							placeholder="Armor name"
							value={a.name}
						/>
						<span className="text-[0.8rem] text-text-muted">AP</span>
						<GameInput
							className="w-[50px]"
							max={30}
							min={0}
							onInput={(e) =>
								updateField(i, "ap", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
							type="number"
							value={a.ap}
						/>
						<div className="flex flex-wrap gap-xs">
							{ARMOR_LOCATIONS.map((loc) => (
								<label
									className="m-0 flex cursor-pointer items-center gap-[2px] text-[0.75rem] text-text-muted"
									key={loc}
								>
									<GameCheckbox
										checked={a.locations.includes(loc)}
										onChange={(e) => toggleLocation(i, loc, (e.target as HTMLInputElement).checked)}
										value={loc}
									/>
									{loc}
								</label>
							))}
						</div>
						<button
							className="cursor-pointer border-none bg-transparent px-[4px] py-[2px] text-base text-text-dim leading-none hover:text-error"
							onClick={() => removeArmor(i)}
							title="Remove"
							type="button"
						>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
