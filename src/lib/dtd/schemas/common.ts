/**
 * Shared Zod types and helpers used across DTD data schemas.
 *
 * Replaces former Pydantic common module. All game-data schemas import from here.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Reusable literal enums
// ---------------------------------------------------------------------------

export const Source = z.enum(["book1", "book2"]);
export type Source = z.infer<typeof Source>;

export const CharacteristicId = z.enum([
	"strength",
	"dexterity",
	"constitution",
	"charisma",
	"fellowship",
	"composure",
	"intelligence",
	"wisdom",
	"willpower",
]);
export type CharacteristicId = z.infer<typeof CharacteristicId>;

export const CharacteristicGroup = z.enum(["physical", "social", "mental"]);
export type CharacteristicGroup = z.infer<typeof CharacteristicGroup>;

// ---------------------------------------------------------------------------
// Shared sub-schemas
// ---------------------------------------------------------------------------

/** A dot-level description (1-5 scale). Strict — no extra fields. */
export const DotRating = z
	.object({
		dots: z.number().int(),
		label: z.string(),
		description: z.string(),
	})
	.strict();
export type DotRating = z.infer<typeof DotRating>;

/** A reference to a skill with dot rating (used in NPC templates). Strict. */
export const SkillRef = z
	.object({
		name: z.string(),
		dots: z.number().int(),
	})
	.strict();
export type SkillRef = z.infer<typeof SkillRef>;

/** A skill bonus entry as used in races. Lenient — Human has extra fields. */
export const SkillBonusEntry = z
	.object({
		skill: z.string(),
		value: z.number().int(),
		count: z.number().int().nullish(),
		description: z.string().nullish(),
	})
	.passthrough();
export type SkillBonusEntry = z.infer<typeof SkillBonusEntry>;

/** A feat entry within a class definition. Strict. */
export const ClassFeatEntry = z
	.object({
		name: z.string(),
		type: z.enum(["mandatory", "optional", "mandatory-choice", "optional-choice"]),
	})
	.strict();
export type ClassFeatEntry = z.infer<typeof ClassFeatEntry>;
