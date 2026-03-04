/**
 * Zod schema for traits data — replaces former Pydantic model.
 *
 * Top-level JSON is a bare array of Trait objects.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Trait (lenient — extra fields allowed)
// ---------------------------------------------------------------------------

export const Trait = z
	.object({
		id: z.string(),
		name: z.string(),
		parameterized: z.boolean(),
		effect: z.string(),
		derivedEffects: z.record(z.string(), z.string()),
		paramLabel: z.string().nullish(),
		paramType: z.string().nullish(),
	})
	.passthrough();
export type Trait = z.infer<typeof Trait>;

// ---------------------------------------------------------------------------
// File-level schema (bare array)
// ---------------------------------------------------------------------------

export const TraitsFile = z.array(Trait);
export type TraitsFile = z.infer<typeof TraitsFile>;
