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
		<div class="input-section">
			<div class="section-header">
				<h2 class="section-title">Armor</h2>
				<button type="button" class="btn btn-ghost btn-sm" onClick={addArmor}>
					+ Add
				</button>
			</div>
			<div class="list-entries">
				{armor.map((a, i) => (
					<div class="list-entry armor-entry" key={i}>
						<input
							type="text"
							class="armor-name"
							placeholder="Armor name"
							value={a.name}
							onInput={(e) => updateField(i, "name", (e.target as HTMLInputElement).value)}
						/>
						<span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>AP</span>
						<input
							type="number"
							class="armor-ap"
							min={0}
							max={30}
							value={a.ap}
							onInput={(e) =>
								updateField(i, "ap", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
						/>
						<div class="armor-locations">
							{ARMOR_LOCATIONS.map((loc) => (
								<label key={loc}>
									<input
										type="checkbox"
										value={loc}
										checked={a.locations.includes(loc)}
										onChange={(e) => toggleLocation(i, loc, (e.target as HTMLInputElement).checked)}
									/>
									{loc}
								</label>
							))}
						</div>
						<button type="button" class="entry-remove" title="Remove" onClick={() => removeArmor(i)}>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
