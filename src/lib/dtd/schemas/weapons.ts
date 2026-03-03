/**
 * Zod schema for weapons data — mirrors pipeline/models/weapons.py.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// RangedWeapon (lenient)
// ---------------------------------------------------------------------------

export const RangedWeapon = z
	.object({
		id: z.string(),
		name: z.string(),
		category: z.string(),
		type: z.string(),
		damage: z.string(),
		damageType: z.string().nullable(),
		pen: z.number().int(),
		rof: z.string(),
		range: z.union([z.number().int(), z.string()]),
		clip: z.number().int(),
		reload: z.string(),
		availability: z.string(),
		special: z.array(z.string()),
		proficiency: z.array(z.string()),
		description: z.string(),
		notes: z.string().nullish(),
	})
	.passthrough();
export type RangedWeapon = z.infer<typeof RangedWeapon>;

// ---------------------------------------------------------------------------
// MeleeWeapon (lenient)
// ---------------------------------------------------------------------------

export const MeleeWeapon = z
	.object({
		id: z.string(),
		name: z.string(),
		category: z.string(),
		type: z.string(),
		damage: z.string(),
		damageType: z.string(),
		pen: z.number().int(),
		availability: z.string(),
		special: z.array(z.string()),
		proficiency: z.array(z.string()),
		description: z.string(),
		notes: z.string().nullish(),
	})
	.passthrough();
export type MeleeWeapon = z.infer<typeof MeleeWeapon>;

// ---------------------------------------------------------------------------
// ThrownWeapon (lenient)
// ---------------------------------------------------------------------------

export const ThrownWeapon = z
	.object({
		id: z.string(),
		name: z.string(),
		category: z.string(),
		type: z.string(),
		damage: z.string(),
		damageType: z.string().nullable(),
		pen: z.number().int(),
		range: z.union([z.number().int(), z.string()]),
		availability: z.string(),
		special: z.array(z.string()),
		proficiency: z.array(z.string()),
		description: z.string(),
	})
	.passthrough();
export type ThrownWeapon = z.infer<typeof ThrownWeapon>;

// ---------------------------------------------------------------------------
// WeaponsData (strict)
// ---------------------------------------------------------------------------

export const WeaponsData = z
	.object({
		ranged: z.array(RangedWeapon),
		melee: z.array(MeleeWeapon),
		thrown: z.array(ThrownWeapon),
	})
	.strict();
export type WeaponsData = z.infer<typeof WeaponsData>;

// ---------------------------------------------------------------------------
// WeaponsFile (strict)
// ---------------------------------------------------------------------------

export const WeaponsFile = z
	.object({
		weapons: WeaponsData,
		damageTypes: z.record(z.string(), z.string()),
		qualities: z.record(z.string(), z.string()),
	})
	.strict();
export type WeaponsFile = z.infer<typeof WeaponsFile>;
