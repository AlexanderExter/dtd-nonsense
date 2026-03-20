import { AddButton } from "@/components/react/ui/AddButton";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { SectionHeading } from "@/components/react/ui/SectionHeading";
import type { ArmorEntry } from "@/lib/dtd/types";
import { ARMOR_TYPES, LOCATIONS } from "../constants";
import { useCharSheetStore } from "../store";

function emptyArmor(): ArmorEntry {
	return { name: "", type: "", locations: [], ap: 0, qualities: "" };
}

export function ArmorSection() {
	const char = useCharSheetStore((s) => s.char);
	const updateChar = useCharSheetStore((s) => s.updateChar);
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
			<table className="w-full border-collapse text-[0.85rem]">
				<thead>
					<tr>
						<th className="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							Name
						</th>
						<th className="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							Type
						</th>
						<th className="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							AP
						</th>
						{LOCATIONS.map((loc) => (
							<th
								key={loc}
								className="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-center font-semibold whitespace-nowrap"
								title={loc}
							>
								{loc.replace("Left ", "L ").replace("Right ", "R ")}
							</th>
						))}
						<th className="text-[0.7rem] uppercase tracking-[0.5px] px-sm py-xs text-text-muted border-b border-border text-left font-semibold whitespace-nowrap">
							Notes
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{armor.map((a, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list items identified by position
						<tr key={`armor-${idx}`}>
							<td className="py-[3px] px-sm border-b border-border align-middle">
								<GameInput
									value={a.name}
									onInput={(e) =>
										handleFieldChange(idx, "name", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td className="py-[3px] px-sm border-b border-border align-middle">
								<GameSelect
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
								</GameSelect>
							</td>
							<td className="py-[3px] px-sm border-b border-border align-middle">
								<GameInput
									type="number"
									value={a.ap}
									min={0}
									onInput={(e) =>
										handleFieldChange(idx, "ap", Number((e.target as HTMLInputElement).value))
									}
								/>
							</td>
							{LOCATIONS.map((loc) => (
								<td
									key={loc}
									className="py-[3px] px-sm border-b border-border align-middle text-center"
								>
									<GameCheckbox
										checked={(a.locations || []).includes(loc)}
										onChange={() => handleLocationToggle(idx, loc)}
									/>
								</td>
							))}
							<td className="py-[3px] px-sm border-b border-border align-middle">
								<GameInput
									value={a.qualities || ""}
									onInput={(e) =>
										handleFieldChange(idx, "qualities", (e.target as HTMLInputElement).value)
									}
								/>
							</td>
							<td className="py-[3px] px-sm border-b border-border align-middle text-center">
								<button
									type="button"
									className="bg-transparent border-none text-error cursor-pointer text-base p-0.5 leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
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
			<AddButton label="Armor" className="mt-sm" onClick={handleAdd} />
		</div>
	);
}
