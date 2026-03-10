import { AbilityList } from "./AbilityList";
import { ArmorList } from "./ArmorList";
import { CharacteristicsGrid } from "./CharacteristicsGrid";
import type { NPCData, NPCWeapon, TraitDef } from "./constants";
import { FeatList } from "./FeatList";
import { SkillList } from "./SkillList";
import { TraitsGrid } from "./TraitsGrid";
import { WeaponList } from "./WeaponList";

interface NPCFormProps {
	npc: NPCData;
	onUpdate: (npc: NPCData) => void;
	traitsData: TraitDef[];
	skillNames: string[];
}

export function NPCForm({ npc, onUpdate, traitsData, skillNames }: NPCFormProps) {
	const updateField = <K extends keyof NPCData>(field: K, value: NPCData[K]) => {
		onUpdate({ ...npc, [field]: value });
	};

	const updateCharacteristic = (key: string, value: number) => {
		onUpdate({ ...npc, characteristics: { ...npc.characteristics, [key]: value } });
	};

	return (
		<>
			{/* Core Fields */}
			<div class="input-section">
				<h2 class="section-title">Core</h2>
				<div class="core-fields">
					<div class="field field-wide">
						<label for="npc-name">Name</label>
						<input
							type="text"
							id="npc-name"
							placeholder="NPC Name"
							value={npc.name}
							onInput={(e) => updateField("name", (e.target as HTMLInputElement).value)}
						/>
					</div>
					<div class="field">
						<label for="npc-level">Level</label>
						<select
							id="npc-level"
							value={npc.level}
							onChange={(e) =>
								updateField("level", Number.parseInt((e.target as HTMLSelectElement).value, 10) || 1)
							}
						>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
						</select>
					</div>
					<div class="field">
						<label for="npc-size">Size</label>
						<input
							type="number"
							id="npc-size"
							min={1}
							max={20}
							value={npc.size}
							onInput={(e) =>
								updateField("size", Number.parseInt((e.target as HTMLInputElement).value, 10) || 4)
							}
						/>
					</div>
					<div class="field">
						<label for="npc-speed">Speed</label>
						<input
							type="number"
							id="npc-speed"
							min={0}
							max={30}
							value={npc.speed}
							onInput={(e) =>
								updateField("speed", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
						/>
					</div>
				</div>
			</div>

			{/* Characteristics */}
			<CharacteristicsGrid characteristics={npc.characteristics} onChange={updateCharacteristic} />

			{/* Skills */}
			<SkillList
				skills={npc.skills}
				skillNames={skillNames}
				onChange={(skills) => updateField("skills", skills)}
			/>

			{/* Feats */}
			<FeatList feats={npc.feats} onChange={(feats) => updateField("feats", feats)} />

			{/* Traits */}
			<TraitsGrid
				activeTraits={npc.traits}
				traitsData={traitsData}
				onChange={(traits) => updateField("traits", traits)}
			/>

			{/* Armor */}
			<ArmorList armor={npc.armor} onChange={(armor) => updateField("armor", armor)} />

			{/* Weapons */}
			<WeaponList weapons={npc.weapons} onChange={(weapons: NPCWeapon[]) => updateField("weapons", weapons)} />

			{/* Abilities */}
			<AbilityList abilities={npc.abilities} onChange={(abilities) => updateField("abilities", abilities)} />

			{/* Gear */}
			<div class="input-section">
				<h2 class="section-title">Gear</h2>
				<textarea
					id="gear-text"
					rows={3}
					placeholder="Comma-separated gear list"
					value={npc.gear}
					onInput={(e) => updateField("gear", (e.target as HTMLTextAreaElement).value)}
				/>
			</div>
		</>
	);
}
