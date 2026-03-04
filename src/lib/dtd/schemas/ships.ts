/**
 * Zod schema for ships data — replaces former Pydantic model.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// ConsoleSlots (strict)
// ---------------------------------------------------------------------------

export const ConsoleSlots = z
	.object({
		arcana: z.number().int(),
		command: z.number().int(),
		engineering: z.number().int(),
		tactical: z.number().int(),
		universal: z.number().int(),
	})
	.strict();
export type ConsoleSlots = z.infer<typeof ConsoleSlots>;

// ---------------------------------------------------------------------------
// WeaponSlots (strict)
// ---------------------------------------------------------------------------

export const WeaponSlots = z
	.object({
		forward: z.number().int(),
		rear: z.number().int(),
	})
	.strict();
export type WeaponSlots = z.infer<typeof WeaponSlots>;

// ---------------------------------------------------------------------------
// Hull (strict)
// ---------------------------------------------------------------------------

/** The JSON field is "class" — Python aliases it to hullClass because class is reserved. */
export const Hull = z
	.object({
		id: z.string(),
		name: z.string(),
		class: z.string().nullish(),
		cost: z.number().int(),
		crew: z.number().int(),
		hullStrength: z.number().int(),
		maneuverability: z.number().int(),
		acceleration: z.number().int(),
		speed: z.number().int(),
		sensors: z.number().int(),
		consoles: ConsoleSlots,
		weapons: WeaponSlots,
	})
	.strict();
export type Hull = z.infer<typeof Hull>;

// ---------------------------------------------------------------------------
// Console (strict)
// ---------------------------------------------------------------------------

export const Console = z
	.object({
		id: z.string(),
		name: z.string(),
		type: z.string(),
		cost: z.number().int(),
		effect: z.string(),
	})
	.strict();
export type Console = z.infer<typeof Console>;

// ---------------------------------------------------------------------------
// ShipWeapon (lenient)
// ---------------------------------------------------------------------------

export const ShipWeapon = z
	.object({
		id: z.string(),
		name: z.string(),
		size: z.string(),
		material: z.string(),
		damage: z.string(),
		disruption: z.number().int(),
		accuracy: z.number().int(),
		crit: z.union([z.number().int(), z.string()]),
		range: z.union([z.number().int(), z.string()]),
		cost: z.number().int(),
		arc: z.string(),
		type: z.string(),
	})
	.passthrough();
export type ShipWeapon = z.infer<typeof ShipWeapon>;

// ---------------------------------------------------------------------------
// Torpedo (lenient)
// ---------------------------------------------------------------------------

export const Torpedo = z
	.object({
		id: z.string(),
		name: z.string(),
		damage: z.string(),
		disruption: z.number().int(),
		accuracy: z.number().int(),
		crit: z.union([z.number().int(), z.string()]),
		arc: z.string(),
		range: z.union([z.number().int(), z.string()]),
		cost: z.number().int(),
		effect: z.string(),
	})
	.passthrough();
export type Torpedo = z.infer<typeof Torpedo>;

// ---------------------------------------------------------------------------
// CriticalDamageEntry (strict)
// ---------------------------------------------------------------------------

export const CriticalDamageEntry = z
	.object({
		roll: z.string(),
		name: z.string(),
		effect: z.string(),
	})
	.strict();
export type CriticalDamageEntry = z.infer<typeof CriticalDamageEntry>;

// ---------------------------------------------------------------------------
// Shield (lenient)
// ---------------------------------------------------------------------------

export const Shield = z
	.object({
		id: z.string(),
		name: z.string(),
		type: z.string(),
		mark: z.number().int(),
		capacity: z.number().int(),
		regeneration: z.number().int(),
		special: z.string(),
		cost: z.number().int(),
	})
	.passthrough();
export type Shield = z.infer<typeof Shield>;

// ---------------------------------------------------------------------------
// ShipsFile (lenient)
// ---------------------------------------------------------------------------

export const ShipsFile = z
	.object({
		holdingsBP: z.array(z.number().int()),
		crewQualityCost: z.record(z.string(), z.number().int()),
		hulls: z.array(Hull),
		consoles: z.array(Console),
		weapons: z.array(ShipWeapon),
		torpedoTubeCost: z.number().int(),
		torpedoes: z.array(Torpedo),
		shields: z.array(Shield),
		criticalDamage: z.array(CriticalDamageEntry),
	})
	.passthrough();
export type ShipsFile = z.infer<typeof ShipsFile>;
