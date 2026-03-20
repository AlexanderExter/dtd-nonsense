import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { GameTextarea } from "@/components/react/ui/GameTextarea";
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
	skillNames: string[];
	traitsData: TraitDef[];
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
			<div className="mb-lg border-border border-b pb-md last:border-b-0">
				<h2 className="m-0 mb-sm text-[0.9rem] text-accent uppercase tracking-[0.5px]">Core</h2>
				<div className="grid grid-cols-[1fr_80px_80px_80px] items-end gap-sm max-[800px]:grid-cols-2">
					<div className="col-start-1 max-[800px]:col-span-full">
						<label className="mb-[2px] block text-[0.8rem]" htmlFor="npc-name">
							Name
						</label>
						<GameInput
							id="npc-name"
							onInput={(e) => updateField("name", (e.target as HTMLInputElement).value)}
							placeholder="NPC Name"
							value={npc.name}
						/>
					</div>
					<div>
						<label className="mb-[2px] block text-[0.8rem]" htmlFor="npc-level">
							Level
						</label>
						<GameSelect
							id="npc-level"
							onChange={(e) =>
								updateField("level", Number.parseInt((e.target as HTMLSelectElement).value, 10) || 1)
							}
							value={npc.level}
						>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
						</GameSelect>
					</div>
					<div>
						<label className="mb-[2px] block text-[0.8rem]" htmlFor="npc-size">
							Size
						</label>
						<GameInput
							id="npc-size"
							max={20}
							min={1}
							onInput={(e) =>
								updateField("size", Number.parseInt((e.target as HTMLInputElement).value, 10) || 4)
							}
							type="number"
							value={npc.size}
						/>
					</div>
					<div>
						<label className="mb-[2px] block text-[0.8rem]" htmlFor="npc-speed">
							Speed
						</label>
						<GameInput
							id="npc-speed"
							max={30}
							min={0}
							onInput={(e) =>
								updateField("speed", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
							type="number"
							value={npc.speed}
						/>
					</div>
				</div>
			</div>

			{/* Characteristics */}
			<CharacteristicsGrid characteristics={npc.characteristics} onChange={updateCharacteristic} />

			{/* Skills */}
			<SkillList
				onChange={(skills) => updateField("skills", skills)}
				skillNames={skillNames}
				skills={npc.skills}
			/>

			{/* Feats */}
			<FeatList feats={npc.feats} onChange={(feats) => updateField("feats", feats)} />

			{/* Traits */}
			<TraitsGrid
				activeTraits={npc.traits}
				onChange={(traits) => updateField("traits", traits)}
				traitsData={traitsData}
			/>

			{/* Armor */}
			<ArmorList armor={npc.armor} onChange={(armor) => updateField("armor", armor)} />

			{/* Weapons */}
			<WeaponList onChange={(weapons: NPCWeapon[]) => updateField("weapons", weapons)} weapons={npc.weapons} />

			{/* Abilities */}
			<AbilityList abilities={npc.abilities} onChange={(abilities) => updateField("abilities", abilities)} />

			{/* Gear */}
			<div className="mb-lg border-border border-b pb-md last:border-b-0">
				<h2 className="m-0 mb-sm text-[0.9rem] text-accent uppercase tracking-[0.5px]">Gear</h2>
				<GameTextarea
					id="gear-text"
					onInput={(e) => updateField("gear", (e.target as HTMLTextAreaElement).value)}
					placeholder="Comma-separated gear list"
					rows={3}
					value={npc.gear}
				/>
			</div>
		</>
	);
}
