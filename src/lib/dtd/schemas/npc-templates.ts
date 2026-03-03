/**
 * Zod schema for NPC template data — mirrors pipeline/models/npc_templates.py.
 */

import { z } from "zod";
import { SkillRef } from "./common.js";

// ---------------------------------------------------------------------------
// NpcCharacteristics (strict)
// ---------------------------------------------------------------------------

export const NpcCharacteristics = z
	.object({
		strength: z.number().int(),
		dexterity: z.number().int(),
		constitution: z.number().int(),
		charisma: z.number().int(),
		fellowship: z.number().int(),
		composure: z.number().int(),
		intelligence: z.number().int(),
		wisdom: z.number().int(),
		willpower: z.number().int(),
	})
	.strict();
export type NpcCharacteristics = z.infer<typeof NpcCharacteristics>;

// ---------------------------------------------------------------------------
// NpcArmor (lenient)
// ---------------------------------------------------------------------------

export const NpcArmor = z
	.object({
		name: z.string(),
		ap: z.number().int().nullish(),
		locations: z.array(z.string()).nullish(),
	})
	.passthrough();
export type NpcArmor = z.infer<typeof NpcArmor>;

// ---------------------------------------------------------------------------
// NpcWeapon (lenient)
// ---------------------------------------------------------------------------

export const NpcWeapon = z
	.object({
		name: z.string(),
		type: z.string(),
		damage: z.string(),
		damageType: z.string(),
		pen: z.number().int(),
		special: z.union([z.string(), z.array(z.string())]).default(""),
		range: z.number().int().nullish(),
		rof: z.string().nullish(),
		clip: z.number().int().nullish(),
		reload: z.string().nullish(),
	})
	.passthrough();
export type NpcWeapon = z.infer<typeof NpcWeapon>;

// ---------------------------------------------------------------------------
// NpcTraitRef (lenient)
// ---------------------------------------------------------------------------

export const NpcTraitRef = z
	.object({
		id: z.string(),
		param: z.union([z.string(), z.number().int()]).nullish(),
	})
	.passthrough();
export type NpcTraitRef = z.infer<typeof NpcTraitRef>;

// ---------------------------------------------------------------------------
// NpcAbility (lenient)
// ---------------------------------------------------------------------------

export const NpcAbility = z
	.object({
		name: z.string(),
		description: z.string(),
	})
	.passthrough();
export type NpcAbility = z.infer<typeof NpcAbility>;

// ---------------------------------------------------------------------------
// NpcTemplate (lenient)
// ---------------------------------------------------------------------------

export const NpcTemplate = z
	.object({
		id: z.string(),
		name: z.string(),
		category: z.string(),
		level: z.number().int(),
		size: z.number().int(),
		speed: z.number().int(),
		characteristics: NpcCharacteristics,
		skills: z.array(SkillRef),
		feats: z.array(z.string()),
		traits: z.array(z.union([z.string(), NpcTraitRef])),
		armor: z.array(NpcArmor),
		weapons: z.array(NpcWeapon),
		abilities: z.array(z.union([z.string(), NpcAbility])),
		gear: z.array(z.string()),
	})
	.passthrough();
export type NpcTemplate = z.infer<typeof NpcTemplate>;

// ---------------------------------------------------------------------------
// Top-level file schema (bare array)
// ---------------------------------------------------------------------------

export const NpcTemplatesFile = z.array(NpcTemplate);
export type NpcTemplatesFile = z.infer<typeof NpcTemplatesFile>;
