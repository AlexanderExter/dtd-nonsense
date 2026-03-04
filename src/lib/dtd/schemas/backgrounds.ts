/**
 * Zod schema for backgrounds data — replaces former Pydantic model.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// BackgroundRating (strict)
// ---------------------------------------------------------------------------

export const BackgroundRating = z
	.object({
		dots: z.number().int(),
		effect: z.string(),
	})
	.strict();
export type BackgroundRating = z.infer<typeof BackgroundRating>;

// ---------------------------------------------------------------------------
// Background (strict)
// ---------------------------------------------------------------------------

export const Background = z
	.object({
		id: z.string(),
		name: z.string(),
		description: z.string(),
		ratings: z.array(BackgroundRating),
	})
	.strict();
export type Background = z.infer<typeof Background>;

// ---------------------------------------------------------------------------
// BackgroundsFile (lenient)
// ---------------------------------------------------------------------------

export const BackgroundsFile = z
	.object({
		backgrounds: z.array(Background),
		notes: z.record(z.string(), z.unknown()).nullish(),
	})
	.passthrough();
export type BackgroundsFile = z.infer<typeof BackgroundsFile>;
