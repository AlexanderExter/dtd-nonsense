import { useState } from "preact/hooks";
import type { Combatant } from "./constants";

interface AddCombatantFormProps {
	onAdd: (data: Partial<Combatant>) => void;
}

export function AddCombatantForm({ onAdd }: AddCombatantFormProps) {
	const [isOpen, setIsOpen] = useState(false);
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

	const handleSubmit = (e: Event) => {
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
		<div class="add-form-wrapper">
			<button type="button" class="add-form-toggle" onClick={() => setIsOpen(!isOpen)}>
				<span class="toggle-icon">{isOpen ? "\u25BC" : "\u25B6"}</span> Add Combatant
			</button>
			{isOpen && (
				<form class="add-form" onSubmit={handleSubmit}>
					<div class="form-row">
						<label class="form-group">
							<span>Name</span>
							<input
								type="text"
								placeholder="Combatant name"
								value={name}
								onInput={(e) => setName((e.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="form-group form-group-sm">
							<span>Dexterity</span>
							<input
								type="number"
								min={1}
								max={10}
								value={dexterity}
								onInput={(e) => setDexterity(parseInt((e.target as HTMLInputElement).value, 10) || 2)}
							/>
						</label>
						<label class="form-group form-group-sm">
							<span>Composure</span>
							<input
								type="number"
								min={1}
								max={10}
								value={composure}
								onInput={(e) => setComposure(parseInt((e.target as HTMLInputElement).value, 10) || 2)}
							/>
						</label>
						<label class="form-group form-group-sm">
							<span>Modifier</span>
							<input
								type="number"
								value={modifier}
								onInput={(e) => setModifier(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
							/>
						</label>
					</div>
					<div class="form-row">
						<label class="form-group form-group-sm">
							<span>HP Max</span>
							<input
								type="number"
								min={1}
								value={hpMax}
								onInput={(e) => setHpMax(parseInt((e.target as HTMLInputElement).value, 10) || 8)}
							/>
						</label>
						<label class="form-group form-group-sm">
							<span>Willpower</span>
							<input
								type="number"
								min={1}
								max={10}
								value={willpower}
								onInput={(e) => setWillpower(parseInt((e.target as HTMLInputElement).value, 10) || 2)}
							/>
						</label>
						<label class="form-group form-group-sm">
							<span>Static Defense</span>
							<input
								type="number"
								min={0}
								value={sd}
								onInput={(e) => setSd(parseInt((e.target as HTMLInputElement).value, 10) || 20)}
							/>
						</label>
						<label class="form-group form-group-sm">
							<span>Resilience</span>
							<input
								type="number"
								min={1}
								value={resilience}
								onInput={(e) => setResilience(parseInt((e.target as HTMLInputElement).value, 10) || 3)}
							/>
						</label>
					</div>
					<div class="form-row">
						<label class="form-group form-group-sm">
							<span>Resource Max</span>
							<input
								type="number"
								min={0}
								value={resourceMax}
								onInput={(e) => setResourceMax(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
							/>
						</label>
						<label class="form-group form-group-sm">
							<span>Resource Label</span>
							<input
								type="text"
								placeholder="Mana"
								value={resourceLabel}
								onInput={(e) => setResourceLabel((e.target as HTMLInputElement).value)}
							/>
						</label>
						<label class="checkbox-label">
							<input
								type="checkbox"
								checked={heroPoint}
								onChange={(e) => setHeroPoint((e.target as HTMLInputElement).checked)}
							/>{" "}
							Hero Point (count as 10)
						</label>
						<label class="checkbox-label">
							<input
								type="checkbox"
								checked={surprised}
								onChange={(e) => setSurprised((e.target as HTMLInputElement).checked)}
							/>{" "}
							Surprised
						</label>
						<label class="checkbox-label">
							<input
								type="checkbox"
								checked={isNpc}
								onChange={(e) => setIsNpc((e.target as HTMLInputElement).checked)}
							/>{" "}
							NPC
						</label>
					</div>
					<button type="submit" class="btn btn-primary">
						Add Combatant
					</button>
				</form>
			)}
		</div>
	);
}
