import { derived } from "@/lib/dtd/derived";

// =========================================================================
// Types
// =========================================================================

export interface NPCData {
	abilities: Array<{ name: string; description: string }>;
	armor: Array<{ name: string; ap: number; locations: string[]; type?: string; qualities?: string }>;
	characteristics: Record<string, number>;
	feats: string[];
	gear: string;
	level: number;
	name: string;
	size: number;
	skills: Array<{ name: string; dots: number }>;
	speed: number;
	traits: Array<{ id: string; param?: string | number }>;
	weapons: NPCWeapon[];
}

export interface NPCWeapon {
	clip?: string;
	damage: string;
	damageType: string;
	fixedAttackBonus?: number;
	fixedDamageBonus?: number;
	name: string;
	pen: number;
	range?: number;
	reload?: string;
	rof?: string;
	special: string;
	type: "melee" | "ranged";
}

export interface TraitDef {
	derivedEffects?: Record<string, string>;
	id: string;
	name: string;
	parameterized?: boolean;
	paramLabel?: string;
	paramType?: string;
}

export interface TemplateDef {
	abilities: Array<{ name: string; description: string }>;
	armor: Array<{ name: string; ap: number; locations: string[] }>;
	category: string;
	characteristics: Record<string, number>;
	feats: string[];
	gear: string | string[];
	id: string;
	level: number;
	name: string;
	size: number;
	skills: Array<{ name: string; dots: number }>;
	speed: number;
	traits: Array<{ id: string; param?: string | number }>;
	weapons: NPCWeapon[];
}

export interface DerivedStats {
	armorBonus: number;
	aura: number;
	hp: number;
	mentalDef: number;
	resilience: number;
	sd: number;
}

// =========================================================================
// Constants
// =========================================================================

export { CHAR_ABBREV, CHAR_KEYS } from "@/lib/dtd/constants";

export const ARMOR_LOCATIONS = ["Head", "Body", "Arms", "Legs"];

export const QUICK_SKILLS: Record<string, Array<{ name: string; dots: number }>> = {
	combat: [
		{ name: "Weaponry", dots: 3 },
		{ name: "Ballistics", dots: 3 },
		{ name: "Athletics", dots: 2 },
	],
	social: [
		{ name: "Persuasion", dots: 3 },
		{ name: "Deceive", dots: 2 },
		{ name: "Intimidation", dots: 2 },
	],
	stealth: [
		{ name: "Stealth", dots: 3 },
		{ name: "Larceny", dots: 2 },
		{ name: "Acrobatics", dots: 2 },
	],
};

export const STORAGE_PREFIX = "dtd_npc_";
export const STORAGE_LIST_KEY = "dtd_npc_list";

// =========================================================================
// Factory & Helpers
// =========================================================================

export function createDefaultNPC(): NPCData {
	return {
		name: "",
		level: 1,
		size: 4,
		speed: 4,
		characteristics: {
			strength: 2,
			dexterity: 2,
			constitution: 2,
			charisma: 2,
			fellowship: 2,
			composure: 2,
			intelligence: 2,
			wisdom: 2,
			willpower: 2,
		},
		skills: [],
		feats: [],
		traits: [],
		armor: [],
		weapons: [],
		abilities: [],
		gear: "",
	};
}

export function extractSkillNames(skillsData: { skills?: Record<string, Array<{ name: string }>> }): string[] {
	const names: string[] = [];
	if (skillsData.skills) {
		for (const cat of Object.values(skillsData.skills)) {
			for (const skill of cat) {
				names.push(skill.name);
			}
		}
	}
	return names.sort();
}

// =========================================================================
// Derived Stats Calculation
// =========================================================================

export function calculateDerived(npc: NPCData, traitsData: TraitDef[]): DerivedStats {
	const c = npc.characteristics;
	const sd = derived.calculateSD(c.dexterity, c.wisdom, npc.size);
	let hp = derived.calculateHP(c.constitution, c.willpower);
	const mentalDef = derived.calculateMentalDefense(c.composure);
	let resilience = npc.size;
	let aura = 0;
	let armorBonus = 0;

	for (const traitRef of npc.traits) {
		const traitDef = traitsData.find((t) => t.id === traitRef.id);
		if (!traitDef?.derivedEffects) continue;
		const effects = traitDef.derivedEffects;

		if (effects.hp === "add_con") hp += c.constitution;
		else if (effects.hp === "double") hp *= 2;

		if (effects.resilience === "add_con") resilience += c.constitution;

		if (effects.armor_all === "param") {
			armorBonus +=
				typeof traitRef.param === "number" ? traitRef.param : Number.parseInt(String(traitRef.param), 10) || 0;
		} else if (effects.armor_all === "add_con") {
			armorBonus += c.constitution;
		}

		if (effects.aura === "param") {
			aura +=
				typeof traitRef.param === "number" ? traitRef.param : Number.parseInt(String(traitRef.param), 10) || 0;
		}
	}

	return { sd, hp, resilience, mentalDef, aura, armorBonus };
}

// =========================================================================
// Weapon Formatting
// =========================================================================

export function formatWeapon(w: NPCWeapon): string {
	let s = w.name;
	if (w.type === "melee") {
		const parts: string[] = [];
		if (w.damage) parts.push(`${w.damage}${w.damageType ? ` ${w.damageType}` : ""}`);
		if (w.pen) parts.push(`Pen ${w.pen}`);
		if (w.special) parts.push(w.special);
		if (parts.length) s += ` (${parts.join("; ")})`;
	} else {
		const parts: string[] = [];
		if (w.range) parts.push(`${w.range}m`);
		if (w.rof) parts.push(w.rof);
		if (w.damage) parts.push(`${w.damage}${w.damageType ? ` ${w.damageType}` : ""}`);
		if (w.pen) parts.push(`Pen ${w.pen}`);
		if (w.clip != null && w.clip !== "") parts.push(`Clip ${w.clip}`);
		if (w.reload) parts.push(`Reload ${w.reload}`);
		if (w.special) parts.push(w.special);
		if (parts.length) s += ` (${parts.join("; ")})`;
	}
	return s;
}

// =========================================================================
// Markdown Generation
// =========================================================================

export function generateMarkdown(npc: NPCData, stats: DerivedStats, traitsData: TraitDef[]): string {
	let md = "";

	md += `## ${npc.name || "Unnamed NPC"}\n\n`;

	// Char table
	md += "| Str | Dex | Con | Cha | Fel | Cmp | Int | Wis | Wil |\n";
	md += "| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |\n";
	md += "|";
	for (const key of CHAR_KEYS) {
		const val = npc.characteristics[key];
		md += `  ${val === 0 ? "-" : val}  |`;
	}
	md += "\n\n";

	md += `**Speed:** ${npc.speed}\n`;
	md += `**Size/Resilience:** ${npc.size}/${stats.resilience}\n`;
	md += `**Static Defense:** ${stats.sd}\n`;
	md += `**HP:** ${stats.hp}\n`;
	md += `**Level:** ${npc.level}\n\n`;

	if (npc.skills.length) {
		md += `**Skills:** ${npc.skills.map((s) => `${s.name} ${s.dots}`).join(", ")}\n`;
	}

	if (npc.feats.length) {
		md += `**Feats:** ${npc.feats.join(", ")}\n`;
	} else {
		md += "**Feats:** None\n";
	}

	if (npc.armor.length) {
		const armorStr = npc.armor
			.map((a) => {
				const locs = a.locations.length ? a.locations.join(", ") : "";
				return `${a.name} (${a.ap} AP${locs ? `; ${locs}` : ""})`;
			})
			.join(", ");
		md += `**Armor:** ${armorStr}\n`;
	} else {
		md += "**Armor:** None\n";
	}

	if (npc.weapons.length) {
		md += `**Attacks:** ${npc.weapons.map((w) => formatWeapon(w)).join(", ")}\n`;
	}

	if (npc.abilities.length) {
		md += "**Abilities:**\n\n";
		for (const a of npc.abilities) {
			md += `- ${a.name}${a.description ? ` - ${a.description}` : ""}\n`;
		}
		md += "\n";
	}

	if (npc.traits.length) {
		const traitStr = npc.traits
			.map((t) => {
				const def = traitsData.find((d) => d.id === t.id);
				const name = def ? def.name : t.id;
				return t.param != null ? `${name} (${t.param})` : name;
			})
			.join(", ");
		md += `**Traits:** ${traitStr}\n`;
	}

	if (npc.gear) {
		md += `**Gear:** ${npc.gear}\n`;
	}

	return md;
}
