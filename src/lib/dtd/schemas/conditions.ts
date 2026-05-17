/**
 * Zod schema for conditions data.
 *
 * Top-level JSON is a bare array of Condition objects.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Condition (strict)
// ---------------------------------------------------------------------------

export const Condition = z
	.object({
		id: z.string(),
		name: z.string(),
		effect: z.string(),
		leveled: z.boolean(),
	})
	.strict();
export type Condition = z.infer<typeof Condition>;

// ---------------------------------------------------------------------------
// File-level schema (bare array)
// ---------------------------------------------------------------------------

export const ConditionsFile = z.array(Condition);
export type ConditionsFile = z.infer<typeof ConditionsFile>;
