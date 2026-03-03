/**
 * Zod schema for equipment data — mirrors pipeline/models/equipment.py.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// EquipmentItem (strict)
// ---------------------------------------------------------------------------

export const EquipmentItem = z
	.object({
		name: z.string(),
		choice: z.boolean(),
		options: z.array(z.string()).nullish(),
	})
	.strict();
export type EquipmentItem = z.infer<typeof EquipmentItem>;

// ---------------------------------------------------------------------------
// EquipmentPackage (strict)
// ---------------------------------------------------------------------------

export const EquipmentPackage = z
	.object({
		id: z.string(),
		name: z.string(),
		description: z.string(),
		items: z.array(EquipmentItem),
	})
	.strict();
export type EquipmentPackage = z.infer<typeof EquipmentPackage>;

// ---------------------------------------------------------------------------
// EquipmentFile (strict)
// ---------------------------------------------------------------------------

export const EquipmentFile = z
	.object({
		packages: z.array(EquipmentPackage),
	})
	.strict();
export type EquipmentFile = z.infer<typeof EquipmentFile>;
