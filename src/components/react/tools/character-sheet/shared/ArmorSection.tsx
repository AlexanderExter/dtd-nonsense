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
						<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
							Name
						</th>
						<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
							Type
						</th>
						<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
							AP
						</th>
						{LOCATIONS.map((loc) => (
							<th
								className="whitespace-nowrap border-border border-b px-sm py-xs text-center font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]"
								key={loc}
								title={loc}
							>
								{loc.replace("Left ", "L ").replace("Right ", "R ")}
							</th>
						))}
						<th className="whitespace-nowrap border-border border-b px-sm py-xs text-left font-semibold text-[0.7rem] text-text-muted uppercase tracking-[0.5px]">
							Notes
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{armor.map((a, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list items identified by position
						<tr key={`armor-${idx}`}>
							<td className="border-border border-b px-sm py-[3px] align-middle">
								<GameInput
									onInput={(e) =>
										handleFieldChange(idx, "name", (e.target as HTMLInputElement).value)
									}
									value={a.name}
								/>
							</td>
							<td className="border-border border-b px-sm py-[3px] align-middle">
								<GameSelect
									onChange={(e) =>
										handleFieldChange(idx, "type", (e.target as HTMLSelectElement).value)
									}
									value={a.type}
								>
									<option value="">—</option>
									{ARMOR_TYPES.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</GameSelect>
							</td>
							<td className="border-border border-b px-sm py-[3px] align-middle">
								<GameInput
									min={0}
									onInput={(e) =>
										handleFieldChange(idx, "ap", Number((e.target as HTMLInputElement).value))
									}
									type="number"
									value={a.ap}
								/>
							</td>
							{LOCATIONS.map((loc) => (
								<td
									className="border-border border-b px-sm py-[3px] text-center align-middle"
									key={loc}
								>
									<GameCheckbox
										checked={(a.locations || []).includes(loc)}
										onChange={() => handleLocationToggle(idx, loc)}
									/>
								</td>
							))}
							<td className="border-border border-b px-sm py-[3px] align-middle">
								<GameInput
									onInput={(e) =>
										handleFieldChange(idx, "qualities", (e.target as HTMLInputElement).value)
									}
									value={a.qualities || ""}
								/>
							</td>
							<td className="border-border border-b px-sm py-[3px] text-center align-middle">
								<button
									className="cursor-pointer border-none bg-transparent p-0.5 text-base text-error leading-none opacity-60 transition-opacity duration-150 hover:opacity-100"
									onClick={() => handleRemove(idx)}
									title="Remove"
									type="button"
								>
									×
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<AddButton className="mt-sm" label="Armor" onClick={handleAdd} />
		</div>
	);
}
