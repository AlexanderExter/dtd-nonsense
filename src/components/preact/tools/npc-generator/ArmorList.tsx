import { useCallback } from "preact/hooks";
import { ARMOR_LOCATIONS } from "./constants";

interface ArmorEntry {
	name: string;
	ap: number;
	locations: string[];
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
		<div class="mb-lg pb-md border-b border-border last:border-b-0">
			<div class="flex items-center justify-between mb-sm">
				<h2 class="text-[0.9rem] uppercase tracking-[0.5px] text-accent m-0">Armor</h2>
				<button type="button" class="btn btn-ghost btn-sm" onClick={addArmor}>
					+ Add
				</button>
			</div>
			<div class="flex flex-col gap-xs">
				{armor.map((a, i) => (
					<div
						class="flex items-center gap-sm px-sm py-xs bg-surface border border-border rounded-sm flex-wrap"
						key={i}
					>
						<input
							type="text"
							class="flex-1 min-w-[100px] py-[2px] px-xs text-[0.85rem]"
							placeholder="Armor name"
							value={a.name}
							onInput={(e) => updateField(i, "name", (e.target as HTMLInputElement).value)}
						/>
						<span class="text-[0.8rem] text-text-muted">AP</span>
						<input
							type="number"
							class="w-[50px] text-center py-[2px] px-xs text-[0.85rem]"
							min={0}
							max={30}
							value={a.ap}
							onInput={(e) =>
								updateField(i, "ap", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
						/>
						<div class="flex gap-xs flex-wrap">
							{ARMOR_LOCATIONS.map((loc) => (
								<label
									class="flex items-center gap-[2px] text-[0.75rem] m-0 cursor-pointer text-text-muted"
									key={loc}
								>
									<input
										type="checkbox"
										class="w-auto p-0 m-0"
										value={loc}
										checked={a.locations.includes(loc)}
										onChange={(e) => toggleLocation(i, loc, (e.target as HTMLInputElement).checked)}
									/>
									{loc}
								</label>
							))}
						</div>
						<button
							type="button"
							class="bg-transparent border-none text-text-dim cursor-pointer px-[4px] py-[2px] text-base leading-none hover:text-error"
							title="Remove"
							onClick={() => removeArmor(i)}
						>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
