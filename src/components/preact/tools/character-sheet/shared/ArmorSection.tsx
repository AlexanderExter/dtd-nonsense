import { AddButton, SectionHeading } from "@/components/preact/ui";
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
		<div>
			<SectionHeading>Armor</SectionHeading>
			<table class="w-full border-collapse text-[0.85rem]">
				<thead>
					<tr>
						<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							Name
						</th>
						<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							Type
						</th>
						<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							AP
						</th>
						{LOCATIONS.map((loc) => (
							<th
								key={loc}
								class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-center font-semibold whitespace-nowrap"
								title={loc}
							>
								{loc.replace("Left ", "L ").replace("Right ", "R ")}
							</th>
						))}
						<th class="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							Notes
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{armor.map((a, idx) => (
						<tr key={idx}>
							<td class="py-[3px] px-sm border-b border-border align-middle">
								<input
									type="text"
									class="w-full py-0.5 px-1 text-[0.82rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
									value={a.name}
									onInput={(e) =>
										handleFieldChange(idx, "name", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td class="py-[3px] px-sm border-b border-border align-middle">
								<select
									class="w-full py-0.5 px-1 text-[0.82rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
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
							<td class="py-[3px] px-sm border-b border-border align-middle">
								<input
									type="number"
									class="w-full py-0.5 px-1 text-[0.82rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
									value={a.ap}
									min={0}
									onInput={(e) =>
										handleFieldChange(idx, "ap", Number((e.target as HTMLInputElement).value))
									}
								/>
							</td>
							{LOCATIONS.map((loc) => (
								<td key={loc} class="py-[3px] px-sm border-b border-border align-middle text-center">
									<input
										type="checkbox"
										checked={(a.locations || []).includes(loc)}
										onChange={() => handleLocationToggle(idx, loc)}
									/>
								</td>
							))}
							<td class="py-[3px] px-sm border-b border-border align-middle">
								<input
									type="text"
									class="w-full py-0.5 px-1 text-[0.82rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none"
									value={a.qualities || ""}
									onInput={(e) =>
										handleFieldChange(idx, "qualities", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td class="py-[3px] px-sm border-b border-border align-middle text-center">
								<button
									type="button"
									class="bg-transparent border-none text-error cursor-pointer text-base p-0.5 leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
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
			<AddButton label="Armor" class="mt-sm" onClick={handleAdd} />
		</div>
	);
}
