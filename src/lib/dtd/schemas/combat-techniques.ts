/**
 * Zod schema for combat-techniques data (sword schools and gun kata full technique trees).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Technique (a single school ability)
// ---------------------------------------------------------------------------

export const Technique = z
	.object({
		rank: z.number().int().min(0).max(5),
		name: z.string(),
		cost: z.number().int(),
		type: z.enum(["base", "advantage", "restriction"]),
		effect: z.string(),
		stackable: z.boolean().optional(),
	})
	.strict();
export type Technique = z.infer<typeof Technique>;

// ---------------------------------------------------------------------------
// School Definition (a full combat school with techniques)
// ---------------------------------------------------------------------------

export const SchoolDefinition = z
	.object({
		id: z.string(),
		name: z.string(),
		attackType: z.enum(["melee", "ranged"]),
		keySkill: z.string(),
		weaponType: z.string(),
		techniques: z.array(Technique),
	})
	.strict();
export type SchoolDefinition = z.infer<typeof SchoolDefinition>;

// ---------------------------------------------------------------------------
// File-level schema
// ---------------------------------------------------------------------------

export const CombatTechniquesFile = z
	.object({
		universalAdvantages: z.array(Technique),
		universalRestrictions: z.array(Technique),
		swordSchools: z.array(SchoolDefinition),
		gunKata: z.array(SchoolDefinition),
	})
	.strict();
export type CombatTechniquesFile = z.infer<typeof CombatTechniquesFile>;
