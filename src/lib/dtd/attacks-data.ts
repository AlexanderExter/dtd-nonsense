/**
 * Special Attack Constructor — technique data for Sword Schools and Gun Kata.
 *
 * Data loaded from data/combat-techniques.json (validated by Zod schema).
 * This module re-exports types and provides helper functions for the
 * character sheet's AttacksTab.
 */

import combatTechniquesData from "../../../data/combat-techniques.json";

// =============================================================================
// Types
// =============================================================================

export interface SchoolTechnique {
	cost: number;
	effect: string;
	name: string;
	rank: number;
	stackable?: boolean;
	type: "advantage" | "restriction" | "base";
}

export interface SchoolDefinition {
	attackType: "melee" | "ranged";
	id: string;
	keySkill: string;
	name: string;
	techniques: SchoolTechnique[];
	weaponType: string;
}

// =============================================================================
// Data (loaded from JSON)
// =============================================================================

export const UNIVERSAL_ADVANTAGES: SchoolTechnique[] = combatTechniquesData.universalAdvantages as SchoolTechnique[];
export const UNIVERSAL_RESTRICTIONS: SchoolTechnique[] =
	combatTechniquesData.universalRestrictions as SchoolTechnique[];

const SWORD_SCHOOLS: SchoolDefinition[] = combatTechniquesData.swordSchools as SchoolDefinition[];
const GUN_KATA: SchoolDefinition[] = combatTechniquesData.gunKata as SchoolDefinition[];

export const MELEE_SCHOOLS: SchoolDefinition[] = SWORD_SCHOOLS;
export const RANGED_SCHOOLS: SchoolDefinition[] = GUN_KATA;

// =============================================================================
// Helpers
// =============================================================================

/** Sum the style point cost of selected techniques. */
export function computeStyleCost(techniques: SchoolTechnique[]): number {
	return techniques.reduce((sum, t) => sum + t.cost, 0);
}

/** Collect weapon options from all schools the character has ranks in (of a given attack type). */
export function getAvailableWeapons(schools: SchoolDefinition[], ranks: Record<string, number>): string[] {
	const weapons = new Set<string>();
	for (const school of schools) {
		if ((ranks[school.id] || 0) > 0) {
			weapons.add(school.weaponType);
		}
	}
	return [...weapons];
}

/** Collect action options from all schools the character has ranks in (of a given attack type). */
export function getAvailableActions(schools: SchoolDefinition[], ranks: Record<string, number>): string[] {
	const actions = new Set<string>();
	for (const school of schools) {
		if ((ranks[school.id] || 0) > 0) {
			const actionTech = school.techniques.find(
				(t) => t.rank === 1 && t.type === "base" && t.name.startsWith("Action"),
			);
			if (actionTech) {
				const match = actionTech.name.match(/Action \((.+)\)/);
				actions.add(match ? match[1] : actionTech.name);
			}
		}
	}
	return [...actions];
}

/** Collect all non-base techniques from multiple schools at their respective ranks. */
export function getAllAvailableTechniques(
	schools: SchoolDefinition[],
	ranks: Record<string, number>,
): Array<SchoolTechnique & { schoolName: string }> {
	const result: Array<SchoolTechnique & { schoolName: string }> = [];
	for (const school of schools) {
		const rank = ranks[school.id] || 0;
		if (rank <= 0) continue;
		for (const tech of school.techniques) {
			if (tech.rank <= rank && tech.type !== "base") {
				result.push({ ...tech, schoolName: school.name });
			}
		}
	}
	return result;
}
