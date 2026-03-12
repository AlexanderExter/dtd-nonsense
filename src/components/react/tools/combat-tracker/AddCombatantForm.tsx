import { useState } from "react";
import { AccordionItem } from "@/components/react/ui/Accordion";
import { Button } from "@/components/react/ui/Button";
import type { Combatant } from "./constants";

interface AddCombatantFormProps {
	onAdd: (data: Partial<Combatant>) => void;
}

export function AddCombatantForm({ onAdd }: AddCombatantFormProps) {
	const [name, setName] = useState("");
	const [dexterity, setDexterity] = useState(2);
	const [composure, setComposure] = useState(2);
	const [modifier, setModifier] = useState(0);
	const [hpMax, setHpMax] = useState(8);
	const [willpower, setWillpower] = useState(2);
	const [sd, setSd] = useState(20);
	const [resilience, setResilience] = useState(3);
	const [resourceMax, setResourceMax] = useState(0);
	const [resourceLabel, setResourceLabel] = useState("");
	const [heroPoint, setHeroPoint] = useState(false);
	const [surprised, setSurprised] = useState(false);
	const [isNpc, setIsNpc] = useState(false);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onAdd({
			name: name.trim() || "Unknown",
			dexterity,
			composure,
			modifier,
			hpMax,
			willpower,
			sd,
			resilience,
			resourceMax,
			resourceLabel,
			heroPoint,
			surprised,
			isNpc,
		});
		setName("");
	};

	return (
		<div className="mb-lg">
			<AccordionItem title="Add Combatant">
				<form className="px-sm" onSubmit={handleSubmit}>
					<div className="flex flex-wrap gap-md items-end mt-md max-[768px]:flex-col">
						<label className="flex-1 min-w-[140px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>Name</span>
							<input
								type="text"
								placeholder="Combatant name"
								value={name}
								onInput={(e) => setName((e.target as HTMLInputElement).value)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>Dexterity</span>
							<input
								className="w-full"
								type="number"
								min={1}
								max={10}
								value={dexterity}
								onInput={(e) => setDexterity(parseInt((e.target as HTMLInputElement).value, 10) || 2)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>Composure</span>
							<input
								className="w-full"
								type="number"
								min={1}
								max={10}
								value={composure}
								onInput={(e) => setComposure(parseInt((e.target as HTMLInputElement).value, 10) || 2)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>Modifier</span>
							<input
								className="w-full"
								type="number"
								value={modifier}
								onInput={(e) => setModifier(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
							/>
						</label>
					</div>
					<div className="flex flex-wrap gap-md items-end mt-md max-[768px]:flex-col">
						<label className="flex-none min-w-[90px] max-w-[120px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>HP Max</span>
							<input
								className="w-full"
								type="number"
								min={1}
								value={hpMax}
								onInput={(e) => setHpMax(parseInt((e.target as HTMLInputElement).value, 10) || 8)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>Willpower</span>
							<input
								className="w-full"
								type="number"
								min={1}
								max={10}
								value={willpower}
								onInput={(e) => setWillpower(parseInt((e.target as HTMLInputElement).value, 10) || 2)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>Static Defense</span>
							<input
								className="w-full"
								type="number"
								min={0}
								value={sd}
								onInput={(e) => setSd(parseInt((e.target as HTMLInputElement).value, 10) || 20)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>Resilience</span>
							<input
								className="w-full"
								type="number"
								min={1}
								value={resilience}
								onInput={(e) => setResilience(parseInt((e.target as HTMLInputElement).value, 10) || 3)}
							/>
						</label>
					</div>
					<div className="flex flex-wrap gap-md items-end mt-md max-[768px]:flex-col">
						<label className="flex-none min-w-[90px] max-w-[120px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>Resource Max</span>
							<input
								className="w-full"
								type="number"
								min={0}
								value={resourceMax}
								onInput={(e) => setResourceMax(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px] max-[768px]:min-w-full max-[768px]:max-w-full">
							<span>Resource Label</span>
							<input
								className="w-full"
								type="text"
								placeholder="Mana"
								value={resourceLabel}
								onInput={(e) => setResourceLabel((e.target as HTMLInputElement).value)}
							/>
						</label>
						<label className="inline-flex items-center gap-xs text-[0.85rem] text-text-muted cursor-pointer pb-sm">
							<input
								type="checkbox"
								className="accent-accent"
								checked={heroPoint}
								onChange={(e) => setHeroPoint((e.target as HTMLInputElement).checked)}
							/>{" "}
							Hero Point (count as 10)
						</label>
						<label className="inline-flex items-center gap-xs text-[0.85rem] text-text-muted cursor-pointer pb-sm">
							<input
								type="checkbox"
								className="accent-accent"
								checked={surprised}
								onChange={(e) => setSurprised((e.target as HTMLInputElement).checked)}
							/>{" "}
							Surprised
						</label>
						<label className="inline-flex items-center gap-xs text-[0.85rem] text-text-muted cursor-pointer pb-sm">
							<input
								type="checkbox"
								className="accent-accent"
								checked={isNpc}
								onChange={(e) => setIsNpc((e.target as HTMLInputElement).checked)}
							/>{" "}
							NPC
						</label>
					</div>
					<Button variant="primary" className="mt-md" type="submit">
						Add Combatant
					</Button>
				</form>
			</AccordionItem>
		</div>
	);
}
