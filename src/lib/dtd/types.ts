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
	strength: number;
	dexterity: number;
	constitution: number;
	charisma: number;
	fellowship: number;
	composure: number;
	intelligence: number;
	wisdom: number;
	willpower: number;
}

export interface CharacterModifiers {
	staticDefense: number;
	hitPoints: number;
	mentalDefense: number;
	resolve: number;
	speed: number;
	resilience: number;
	initiative: number;
}

// =============================================================================
// Character Sub-Objects
// =============================================================================

export interface Background {
	name: string;
	dots: number;
	notes: string;
}

/** Used for feats, assets, and hindrances. */
export interface FeatEntry {
	name: string;
	notes: string;
}

export interface MeleeWeapon {
	name: string;
	damage: string;
	damageType: string;
	proficiency: string;
	qualities: string;
	notes: string;
}

export interface RangedWeapon {
	name: string;
	damage: string;
	damageType: string;
	range: string;
	proficiency: string;
	qualities: string;
	notes: string;
}

export interface ArmorEntry {
	name: string;
	type: string;
	locations: string[];
	ap: number;
	qualities: string;
}

export interface SavedPool {
	label: string;
	notation: string;
}

// =============================================================================
// Character Data
// =============================================================================

/** Full canonical character object — matches character.DEFAULTS shape in core.ts. */
export interface CharacterData {
	id: string;
	name: string;
	player: string;
	concept: string;
	totalXP: number;
	xpSpent: number;

	race: string;
	raceCharBonus: string;
	exaltation: string;
	alignment: string;
	devotion: number;

	characteristics: Characteristics;
	charSpecialties: Record<string, string>;
	skills: Record<string, number>;
	skillSpecialties: Record<string, string>;

	backgrounds: Background[];
	classes: string[];
	feats: FeatEntry[];
	assets: FeatEntry[];
	hindrances: FeatEntry[];

	meleeWeapons: MeleeWeapon[];
	rangedWeapons: RangedWeapon[];
	armor: ArmorEntry[];
	naturalArmor: number;
	aura: number;
	auraSource: string;

	magicSchools: Record<string, number>;
	swordSchools: Record<string, number>;
	gunKata: Record<string, number>;
	spells: string[];
	specialAttacks: string[];
	trickShots: string[];

	powerStat: number;
	heroPointsMax: number;
	heroPointsCurrent: number;
	heroPointsBurnt: number;
	fettered: boolean;
	pushAmount: number;
	extraSchoolLevels: number;
	bonusSchoolLevels: Record<string, number>;
	sanctioned: boolean;
	resourceCurrent: number;
	exaltationNotes: string;

	modifiers: CharacterModifiers;
	savedPools: SavedPool[];
	languages: string[];
	equipment: string;
	notes: string;
	classNotes: string;
	description: string;
	height: string;
	weight: string;
	age: string;
	currentHP: number;
	currentResolve: number;
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
	value: number;
	base: number;
	exploded: boolean;
}

export interface OverflowInfo {
	numDice: number;
	keepDice: number;
	modifier: number;
	compressed: boolean;
}

export interface DiceResult {
	allRolls: DieRoll[];
	keptRolls: DieRoll[];
	droppedRolls: DieRoll[];
	diceTotal: number;
	modifier: number;
	total: number;
	overflow: OverflowInfo | null;
}

export interface Outcome {
	success: boolean;
	raises: number;
	checks: number;
}

export interface ParsedNotation {
	num: number;
	keep: number;
	modifier: number;
}
