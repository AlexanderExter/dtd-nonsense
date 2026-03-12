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
		onUpdate({
			...npc,
			characteristics: { ...npc.characteristics, [key]: value },
		});
	};

	return (
		<>
			{/* Core Fields */}
			<div className="mb-lg pb-md border-b border-border last:border-b-0">
				<h2 className="text-[0.9rem] uppercase tracking-[0.5px] text-accent m-0 mb-sm">Core</h2>
				<div className="grid grid-cols-[1fr_80px_80px_80px] gap-sm items-end max-[800px]:grid-cols-2">
					<div className="col-start-1 max-[800px]:col-span-full">
						<label className="block text-[0.8rem] mb-[2px]" htmlFor="npc-name">
							Name
						</label>
						<input
							className="w-full px-sm py-xs text-[0.9rem]"
							type="text"
							id="npc-name"
							placeholder="NPC Name"
							value={npc.name}
							onInput={(e) => updateField("name", (e.target as HTMLInputElement).value)}
						/>
					</div>
					<div>
						<label className="block text-[0.8rem] mb-[2px]" htmlFor="npc-level">
							Level
						</label>
						<select
							className="w-full px-sm py-xs text-[0.9rem]"
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
					<div>
						<label className="block text-[0.8rem] mb-[2px]" htmlFor="npc-size">
							Size
						</label>
						<input
							className="w-full px-sm py-xs text-[0.9rem]"
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
					<div>
						<label className="block text-[0.8rem] mb-[2px]" htmlFor="npc-speed">
							Speed
						</label>
						<input
							className="w-full px-sm py-xs text-[0.9rem]"
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
			<div className="mb-lg pb-md border-b border-border last:border-b-0">
				<h2 className="text-[0.9rem] uppercase tracking-[0.5px] text-accent m-0 mb-sm">Gear</h2>
				<textarea
					className="w-full text-[0.85rem] p-sm resize-y"
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
