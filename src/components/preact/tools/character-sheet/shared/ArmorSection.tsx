import type { ArmorEntry } from "@/lib/dtd/types";
import { charSignal, updateChar } from "../CharacterSheetApp";
import { ARMOR_TYPES, LOCATIONS } from "../constants";

function emptyArmor(): ArmorEntry {
	return { name: "", type: "", locations: [], ap: 0, qualities: "" };
}

export function ArmorSection() {
	const char = charSignal.value;
	const armor = char.armor || [];

	const handleFieldChange = (idx: number, field: string, value: any) => {
		updateChar((c) => {
			if (c.armor[idx]) (c.armor[idx] as any)[field] = value;
		});
	};

	const handleLocationToggle = (idx: number, loc: string) => {
		updateChar((c) => {
			const entry = c.armor[idx];
			if (!entry) return;
			if (!entry.locations) entry.locations = [];
			const locIdx = entry.locations.indexOf(loc);
			if (locIdx >= 0) {
				entry.locations.splice(locIdx, 1);
			} else {
				entry.locations.push(loc);
			}
		});
	};

	const handleAdd = () => {
		updateChar((c) => {
			c.armor = [...c.armor, emptyArmor()];
		});
	};

	const handleRemove = (idx: number) => {
		updateChar((c) => {
			c.armor = c.armor.filter((_, i) => i !== idx);
		});
	};

	return (
		<div class="armor-section">
			<h4>Armor</h4>
			<table class="armor-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>AP</th>
						{LOCATIONS.map((loc) => (
							<th key={loc} class="loc-col" title={loc}>
								{loc.replace("Left ", "L ").replace("Right ", "R ")}
							</th>
						))}
						<th>Notes</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{armor.map((a, idx) => (
						<tr key={idx}>
							<td>
								<input
									type="text"
									value={a.name}
									onInput={(e) =>
										handleFieldChange(idx, "name", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td>
								<select
									value={a.type}
									onChange={(e) =>
										handleFieldChange(idx, "type", (e.target as HTMLSelectElement).value)
									}
								>
									<option value="">—</option>
									{ARMOR_TYPES.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</td>
							<td>
								<input
									type="number"
									value={a.ap}
									min={0}
									onInput={(e) =>
										handleFieldChange(idx, "ap", Number((e.target as HTMLInputElement).value))
									}
								/>
							</td>
							{LOCATIONS.map((loc) => (
								<td key={loc} class="loc-col">
									<input
										type="checkbox"
										checked={(a.locations || []).includes(loc)}
										onChange={() => handleLocationToggle(idx, loc)}
									/>
								</td>
							))}
							<td>
								<input
									type="text"
									value={a.qualities || ""}
									onInput={(e) =>
										handleFieldChange(idx, "qualities", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td>
								<button
									type="button"
									class="btn-remove"
									onClick={() => handleRemove(idx)}
									title="Remove"
								>
									×
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<button type="button" class="btn btn-sm" onClick={handleAdd}>
				+ Add Armor
			</button>
		</div>
	);
}
