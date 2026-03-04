/**
 * Zod schema for skills data — replaces former Pydantic model.
 */

import { z } from "zod";
import { CharacteristicGroup, CharacteristicId, DotRating } from "./common.ts";

// ---------------------------------------------------------------------------
// Characteristic (lenient)
// ---------------------------------------------------------------------------

export const Characteristic = z
	.object({
		id: CharacteristicId,
		name: z.string(),
		abbrev: z.string(),
		description: z.string(),
		specialties: z.array(z.string()),
		ratings: z.array(DotRating),
		notes: z.string().nullish(),
	})
	.passthrough();
export type Characteristic = z.infer<typeof Characteristic>;

// ---------------------------------------------------------------------------
// Skill (strict)
// ---------------------------------------------------------------------------

export const Skill = z
	.object({
		id: z.string(),
		name: z.string(),
		characteristic: z.string(),
		advanced: z.boolean(),
		description: z.string(),
		specialties: z.array(z.string()),
	})
	.strict();
export type Skill = z.infer<typeof Skill>;

// ---------------------------------------------------------------------------
// SkillsFile (lenient)
// ---------------------------------------------------------------------------

export const SkillsFile = z
	.object({
		characteristics: z.record(CharacteristicGroup, z.array(Characteristic)),
		skills: z.record(z.string(), z.array(Skill)),
		skillNotes: z.record(z.string(), z.unknown()).nullish(),
	})
	.passthrough();
export type SkillsFile = z.infer<typeof SkillsFile>;
