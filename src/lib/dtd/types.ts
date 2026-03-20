/**
 * DTD Shared Types
 *
 * Canonical TypeScript interfaces for character data, game data, and dice results.
 * Import from here rather than duplicating shapes across modules.
 *
 * Usage:
 *   import type { CharacterData, DiceResult } from '@/lib/dtd/types';
 */

// =============================================================================
// Characteristics & Stats
// =============================================================================

export interface Characteristics {
	charisma: number;
	composure: number;
	constitution: number;
	dexterity: number;
	fellowship: number;
	intelligence: number;
	strength: number;
	willpower: number;
	wisdom: number;
}

export interface CharacterModifiers {
	hitPoints: number;
	initiative: number;
	mentalDefense: number;
	resilience: number;
	resolve: number;
	speed: number;
	staticDefense: number;
}

// =============================================================================
// Character Sub-Objects
// =============================================================================

export interface Background {
	dots: number;
	id?: string;
	name: string;
	notes: string;
}

export interface ClassEntry {
	classId: string;
	level: number;
}

/** Used for feats, assets, and hindrances. */
export interface FeatEntry {
	name: string;
	notes: string;
}

export interface MeleeWeapon {
	availability?: string;
	damage: string;
	damageType: string;
	name: string;
	notes: string;
	pen?: string;
	proficiency: string;
	qualities: string;
	special?: string;
	test?: string;
	weaponType?: string;
}

export interface RangedWeapon {
	availability?: string;
	clip?: string;
	damage: string;
	damageType: string;
	name: string;
	notes: string;
	pen?: string;
	proficiency: string;
	qualities: string;
	range: string;
	reload?: string;
	rof?: string;
	special?: string;
	test?: string;
	weaponType?: string;
}

export interface ArmorEntry {
	ap: number;
	craftsmanship?: string;
	locations: string[];
	maxDex?: number;
	name: string;
	qualities: string;
	special?: string;
	type: string;
}

export interface SpellEntry {
	level: number;
	name: string;
	notes: string;
	school: string;
}

export interface SpecialAttackEntry {
	description: string;
	name: string;
}

export interface SavedPool {
	formula?: string;
	label: string;
	notation?: string;
	pool?: string;
}

// =============================================================================
// Character Data
// =============================================================================

export interface XpLogEntry {
	amount: number;
	label: string;
	timestamp: number;
}

/** Full canonical character object — matches character.DEFAULTS shape in core.ts. */
export interface CharacterData {
	age: string;
	alignment: string;
	armor: ArmorEntry[];
	assets: FeatEntry[];
	aura: number;
	auraSource: string;

	backgrounds: Background[];
	bonusSchoolLevels: Record<string, number>;

	characteristics: Characteristics;
	charSpecialties: Record<string, string>;
	classes: ClassEntry[];
	classNotes: string;
	concept: string;
	currentHP: number;
	currentResolve: number;
	description: string;
	devotion: number;
	equipment: string;
	exaltation: string;
	exaltationNotes: string;
	extraSchoolLevels: number;
	feats: FeatEntry[];
	fettered: boolean;
	gunKata: Record<string, number>;
	height: string;
	heroPointsBurnt: number;
	heroPointsCurrent: number;
	heroPointsMax: number;
	hindrances: FeatEntry[];
	id: string;
	languages: string[];

	magicSchools: Record<string, number>;

	meleeWeapons: MeleeWeapon[];

	modifiers: CharacterModifiers;
	name: string;
	naturalArmor: number;
	notes: string;
	player: string;

	powerStat: number;
	pushAmount: number;

	race: string;
	raceCharBonus: string;
	rangedWeapons: RangedWeapon[];
	resourceCurrent: number;
	sanctioned: boolean;
	savedPools: SavedPool[];
	skillSpecialties: Record<string, string>;
	skills: Record<string, number>;
	specialAttacks: Array<string | SpecialAttackEntry>;
	spells: Array<string | SpellEntry>;
	swordSchools: Record<string, number>;
	totalXP: number;
	trickShots: string[];
	weight: string;
	xpLog: XpLogEntry[];
	xpSpendLog: XpLogEntry[];
	xpSpent: number;
}

/** Entry in the saved character list (localStorage index). */
export interface CharacterListEntry {
	id: string;
	name: string;
}

// =============================================================================
// Dice
// =============================================================================

export interface DieRoll {
	base: number;
	exploded: boolean;
	value: number;
}

export interface OverflowInfo {
	compressed: boolean;
	keepDice: number;
	modifier: number;
	numDice: number;
}

export interface DiceResult {
	allRolls: DieRoll[];
	diceTotal: number;
	droppedRolls: DieRoll[];
	keptRolls: DieRoll[];
	modifier: number;
	overflow: OverflowInfo | null;
	total: number;
}

export interface Outcome {
	checks: number;
	raises: number;
	success: boolean;
}

export interface ParsedNotation {
	keep: number;
	modifier: number;
	num: number;
}
