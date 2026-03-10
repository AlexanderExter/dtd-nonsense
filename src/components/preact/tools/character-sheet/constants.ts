import { derived } from "@/lib/dtd/derived";
import type { CharacterData, CharacterModifiers } from "@/lib/dtd/types";

export const AUTOSAVE_DELAY = 400;

export const CHAR_ABBREV: Record<string, string> = {
	strength: "Str",
	dexterity: "Dex",
	constitution: "Con",
	charisma: "Cha",
	fellowship: "Fel",
	composure: "Com",
	intelligence: "Int",
	wisdom: "Wis",
	willpower: "Wil",
};

export const MAGIC_SCHOOLS = [
	{ id: "abjuration", name: "Abjuration", char: "willpower" },
	{ id: "conjuration", name: "Conjuration", char: "willpower" },
	{ id: "divination", name: "Divination", char: "wisdom" },
	{ id: "enchantment", name: "Enchantment", char: "charisma" },
	{ id: "evocation", name: "Evocation", char: "charisma" },
	{ id: "healing", name: "Healing", char: "wisdom" },
	{ id: "illusion", name: "Illusion", char: "intelligence" },
	{ id: "necromancy", name: "Necromancy", char: "intelligence" },
	{ id: "transmutation", name: "Transmutation", char: "wisdom" },
] as const;

export const SWORD_SCHOOLS = [
	{ id: "desertWind", name: "Desert Wind" },
	{ id: "devotedSpirit", name: "Devoted Spirit" },
	{ id: "diamondMind", name: "Diamond Mind" },
	{ id: "ironHeart", name: "Iron Heart" },
	{ id: "settingSun", name: "Setting Sun" },
	{ id: "shadowHand", name: "Shadow Hand" },
	{ id: "stoneDragon", name: "Stone Dragon" },
	{ id: "tigerClaw", name: "Tiger Claw" },
	{ id: "whiteRaven", name: "White Raven" },
] as const;

export const GUN_KATA = [
	{ id: "clayPigeon", name: "Clay Pigeon" },
	{ id: "crisisZone", name: "Crisis Zone" },
	{ id: "elementalGearbolt", name: "Elemental Gearbolt" },
	{ id: "pointBlank", name: "Point Blank" },
	{ id: "silentScope", name: "Silent Scope" },
	{ id: "tinStar", name: "Tin Star" },
] as const;

export const LOCATIONS = ["Head", "Body", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];
export const ARMOR_TYPES = ["Light", "Medium", "Heavy", "Extreme", "Power"];
export const DAMAGE_TYPES = ["E", "I", "R", "X"];
export const PROFICIENCY_MELEE = ["Basic", "Melee 1", "Melee 2", "Melee 3"];
export const PROFICIENCY_RANGED = ["Basic", "Ranged 1", "Ranged 2", "Throwing"];
export const AVAILABILITY = ["Ubiquitous", "Very Common", "Common", "Uncommon", "Rare", "Very Rare", "Mythic Rare"];

export const BG_IDS = [
	"allies",
	"artifact",
	"backing",
	"contacts",
	"fame",
	"followers",
	"inheritance",
	"mentor",
	"sanctum",
	"status",
	"wealth",
];

export type TabId = "identity" | "stats" | "combat" | "powers" | "features";

export const TAB_LABELS: Array<{ id: TabId; label: string }> = [
	{ id: "identity", label: "Identity" },
	{ id: "stats", label: "Stats" },
	{ id: "combat", label: "Combat" },
	{ id: "powers", label: "Powers" },
	{ id: "features", label: "Features" },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Ensure all school/skill keys exist in character data. */
export function ensureToolDefaults(ch: CharacterData, skillsData: any): void {
	if (!ch.magicSchools) ch.magicSchools = {};
	for (const s of MAGIC_SCHOOLS) {
		if (!(s.id in ch.magicSchools)) ch.magicSchools[s.id] = 0;
	}
	if (!ch.swordSchools) ch.swordSchools = {};
	for (const s of SWORD_SCHOOLS) {
		if (!(s.id in ch.swordSchools)) ch.swordSchools[s.id] = 0;
	}
	if (!ch.gunKata) ch.gunKata = {};
	for (const s of GUN_KATA) {
		if (!(s.id in ch.gunKata)) ch.gunKata[s.id] = 0;
	}
	if (skillsData) {
		const groups = skillsData.skills || {};
		for (const cat of Object.values(groups)) {
			for (const sk of cat as Array<{ id: string }>) {
				if (!(sk.id in ch.skills)) ch.skills[sk.id] = 0;
			}
		}
	}
}

/** Get effective (base + racial bonus) characteristics. */
export function getEffChars(char: CharacterData, _raceData: any): Record<string, number> {
	const base = (char.characteristics || {}) as unknown as Record<string, number>;
	const result: Record<string, number> = {};
	for (const id of Object.keys(CHAR_ABBREV)) {
		result[id] = base[id] || 1;
	}
	if (char.raceCharBonus && char.raceCharBonus in result) {
		result[char.raceCharBonus] += 1;
	}
	return result;
}

/** Get race size from loaded race data. */
export function getRaceSize(char: CharacterData, racesData: any): number {
	if (!char.race || !racesData) return 4;
	const race = (racesData.races || []).find((r: any) => r.id === char.race);
	return race?.size ?? 4;
}

/** Get character level (highest class level). */
export function getLevel(char: CharacterData): number {
	if (!char.classes || char.classes.length === 0) return 1;
	return Math.max(1, ...char.classes.map((c) => c.level || 1));
}

/** Get resource max from exaltation formula. */
export function getResourceMax(char: CharacterData, effChars: Record<string, number>, exaltData: any): number {
	if (!char.exaltation || !exaltData) return 0;
	const exalt = (exaltData.exaltations || []).find((e: any) => e.id === char.exaltation);
	if (!exalt?.resourceStat) return 0;

	const formula = exalt.resourceStat.formula || "";
	const ps = char.powerStat || 1;
	const c = effChars;
	const level = getLevel(char);

	if (formula.includes("5") && formula.includes(exalt.powerStat?.name)) return 5 * ps;
	if (formula.includes("Willpower") && formula.includes("Level")) return (c.willpower || 1) + level + 2 * ps;
	if (formula.includes("Charisma") && formula.includes("Intelligence"))
		return (c.charisma || 1) + (c.intelligence || 1) + 2 * ps;
	if (formula.includes("Fellowship") && formula.includes("Composure"))
		return (c.fellowship || 1) + (c.composure || 1) + 2 * ps;
	if (formula.includes("Constitution") && formula.includes("Willpower"))
		return (c.constitution || 1) + (c.willpower || 1) + 2 * ps;
	if (formula.includes("Wisdom") && formula.includes("Composure"))
		return (c.wisdom || 1) + (c.composure || 1) + 2 * ps;
	if (formula.includes("Intelligence") && formula.includes("Willpower"))
		return (c.intelligence || 1) + (c.willpower || 1) + 2 * ps;
	return ps * 5;
}

// ---------------------------------------------------------------------------
// Derived stats
// ---------------------------------------------------------------------------

export interface DerivedStats {
	sdBase: number;
	sdMod: number;
	sd: number;
	hpBase: number;
	hpMod: number;
	hp: number;
	mdBase: number;
	mdMod: number;
	md: number;
	resolveBase: number;
	resolveMod: number;
	resolve: number;
	speedBase: number;
	speedMod: number;
	speed: number;
	runSpeed: number;
	resilienceBase: number;
	resilienceMod: number;
	resilience: number;
	initBase: number;
	initMod: number;
	init: number;
	size: number;
	level: number;
	resourceMax: number;
}

export function calculateAllDerived(char: CharacterData, racesData: any, exaltData: any): DerivedStats {
	const c = getEffChars(char, racesData);
	const size = getRaceSize(char, racesData);
	const level = getLevel(char);
	const mods = (char.modifiers || {}) as CharacterModifiers;
	const isHalfling = char.race === "halfling";

	const sdBase = derived.calculateSD(c.dexterity, c.wisdom, size, isHalfling);
	const hpBase = derived.calculateHP(c.constitution, c.willpower);
	const mdBase = derived.calculateMentalDefense(c.composure);
	const resolveBase = derived.calculateResolve(c.willpower, c.composure);
	const speedBase = derived.calculateSpeed(c.strength, c.dexterity);
	const resilienceBase = derived.calculateResilience(size, level);
	const initBase = derived.calculateInitiativeBase(c.dexterity, c.composure);

	return {
		sdBase,
		sdMod: mods.staticDefense || 0,
		sd: sdBase + (mods.staticDefense || 0),
		hpBase,
		hpMod: mods.hitPoints || 0,
		hp: hpBase + (mods.hitPoints || 0),
		mdBase,
		mdMod: mods.mentalDefense || 0,
		md: mdBase + (mods.mentalDefense || 0),
		resolveBase,
		resolveMod: mods.resolve || 0,
		resolve: resolveBase + (mods.resolve || 0),
		speedBase,
		speedMod: mods.speed || 0,
		speed: speedBase + (mods.speed || 0),
		runSpeed: (speedBase + (mods.speed || 0)) * 6,
		resilienceBase,
		resilienceMod: mods.resilience || 0,
		resilience: resilienceBase + (mods.resilience || 0),
		initBase,
		initMod: mods.initiative || 0,
		init: initBase + (mods.initiative || 0),
		size,
		level,
		resourceMax: getResourceMax(char, c, exaltData),
	};
}

// ---------------------------------------------------------------------------
// Wound status
// ---------------------------------------------------------------------------

export interface WoundStatus {
	status: string;
	cssClass: string;
	description: string;
}

export function getWoundStatus(maxHP: number, currentHP: number, willpower: number, con: number): WoundStatus {
	const cur = currentHP ?? 0;
	const max = maxHP || 1;
	const hpLost = Math.max(0, max - cur);

	if (hpLost <= 0) {
		return {
			status: "Healthy",
			cssClass: "wound-ok",
			description: "No Hit Points lost.",
		};
	}
	if (cur <= 0) {
		return {
			status: "Critical — 0 HP",
			cssClass: "wound-critical",
			description:
				"At 0 HP, further hits cause Critical Damage. Consult Critical Effects Tables by hit location and damage type.",
		};
	}
	if (hpLost <= willpower) {
		return {
			status: "Lightly Wounded",
			cssClass: "wound-light",
			description: `HP lost (${hpLost}) ≤ Willpower (${willpower}). Recover 1 HP/day naturally, or ${con} HP/day with full bed rest.`,
		};
	}
	return {
		status: "Heavily Wounded",
		cssClass: "wound-heavy",
		description: `HP lost (${hpLost}) > Willpower (${willpower}). Recover 1 HP/week naturally, or ${con} HP/week with full rest.`,
	};
}

// ---------------------------------------------------------------------------
// Martial / Gunslinger helpers
// ---------------------------------------------------------------------------

export function getMartialLevel(swordSchools: Record<string, number>): number {
	const vals = Object.values(swordSchools || {});
	return vals.length > 0 ? Math.max(0, ...vals) : 0;
}

export function getGunslingerLevel(gunKata: Record<string, number>): number {
	const vals = Object.values(gunKata || {});
	return vals.length > 0 ? Math.max(0, ...vals) : 0;
}
