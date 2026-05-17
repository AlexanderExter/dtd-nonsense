import { useState } from "react";
import { AccordionItem } from "@/components/react/ui/Accordion";
import { Button } from "@/components/react/ui/Button";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
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
					<div className="mt-md flex flex-wrap items-end gap-md max-tool-md:flex-col">
						<label className="min-w-[140px] flex-1 max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>Name</span>
							<GameInput
								onInput={(e) => setName((e.target as HTMLInputElement).value)}
								placeholder="Combatant name"
								type="text"
								value={name}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>Dexterity</span>
							<GameInput
								max={10}
								min={1}
								onInput={(e) =>
									setDexterity(Number.parseInt((e.target as HTMLInputElement).value, 10) || 2)
								}
								type="number"
								value={dexterity}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>Composure</span>
							<GameInput
								max={10}
								min={1}
								onInput={(e) =>
									setComposure(Number.parseInt((e.target as HTMLInputElement).value, 10) || 2)
								}
								type="number"
								value={composure}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>Modifier</span>
							<GameInput
								onInput={(e) =>
									setModifier(Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
								}
								type="number"
								value={modifier}
							/>
						</label>
					</div>
					<div className="mt-md flex flex-wrap items-end gap-md max-tool-md:flex-col">
						<label className="min-w-[90px] max-w-[120px] flex-none max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>HP Max</span>
							<GameInput
								min={1}
								onInput={(e) =>
									setHpMax(Number.parseInt((e.target as HTMLInputElement).value, 10) || 8)
								}
								type="number"
								value={hpMax}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>Willpower</span>
							<GameInput
								max={10}
								min={1}
								onInput={(e) =>
									setWillpower(Number.parseInt((e.target as HTMLInputElement).value, 10) || 2)
								}
								type="number"
								value={willpower}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>Static Defense</span>
							<GameInput
								min={0}
								onInput={(e) => setSd(Number.parseInt((e.target as HTMLInputElement).value, 10) || 20)}
								type="number"
								value={sd}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>Resilience</span>
							<GameInput
								min={1}
								onInput={(e) =>
									setResilience(Number.parseInt((e.target as HTMLInputElement).value, 10) || 3)
								}
								type="number"
								value={resilience}
							/>
						</label>
					</div>
					<div className="mt-md flex flex-wrap items-end gap-md max-tool-md:flex-col">
						<label className="min-w-[90px] max-w-[120px] flex-none max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>Resource Max</span>
							<GameInput
								min={0}
								onInput={(e) =>
									setResourceMax(Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
								}
								type="number"
								value={resourceMax}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none max-tool-md:min-w-full max-tool-md:max-w-full">
							<span>Resource Label</span>
							<GameInput
								onInput={(e) => setResourceLabel((e.target as HTMLInputElement).value)}
								placeholder="Mana"
								type="text"
								value={resourceLabel}
							/>
						</label>
						<label className="inline-flex cursor-pointer items-center gap-xs pb-sm text-sm text-text-muted">
							<GameCheckbox
								checked={heroPoint}
								onChange={(e) => setHeroPoint((e.target as HTMLInputElement).checked)}
							/>{" "}
							Hero Point (count as 10)
						</label>
						<label className="inline-flex cursor-pointer items-center gap-xs pb-sm text-sm text-text-muted">
							<GameCheckbox
								checked={surprised}
								onChange={(e) => setSurprised((e.target as HTMLInputElement).checked)}
							/>{" "}
							Surprised
						</label>
						<label className="inline-flex cursor-pointer items-center gap-xs pb-sm text-sm text-text-muted">
							<GameCheckbox
								checked={isNpc}
								onChange={(e) => setIsNpc((e.target as HTMLInputElement).checked)}
							/>{" "}
							NPC
						</label>
					</div>
					<Button className="mt-md" type="submit" variant="primary">
						Add Combatant
					</Button>
				</form>
			</AccordionItem>
		</div>
	);
}
