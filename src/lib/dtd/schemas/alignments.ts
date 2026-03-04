/**
 * Zod schema for alignments data — replaces former Pydantic model.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// PantheonInfo (strict)
// ---------------------------------------------------------------------------

export const PantheonInfo = z
	.object({
		name: z.string(),
		description: z.string(),
	})
	.strict();
export type PantheonInfo = z.infer<typeof PantheonInfo>;

// ---------------------------------------------------------------------------
// AlignmentSin (strict)
// ---------------------------------------------------------------------------

export const AlignmentSin = z
	.object({
		devotion: z.number().int(),
		sin: z.string(),
	})
	.strict();
export type AlignmentSin = z.infer<typeof AlignmentSin>;

// ---------------------------------------------------------------------------
// Alignment (strict)
// ---------------------------------------------------------------------------

export const Alignment = z
	.object({
		id: z.string(),
		name: z.string(),
		pantheon: z.string(),
		concepts: z.array(z.string()),
		description: z.string(),
		commandments: z.array(z.string()),
		restriction: z.string().nullish(),
		sins: z.array(AlignmentSin),
	})
	.strict();
export type Alignment = z.infer<typeof Alignment>;

// ---------------------------------------------------------------------------
// AlignmentsFile (lenient)
// ---------------------------------------------------------------------------

export const AlignmentsFile = z
	.object({
		pantheons: z.record(z.string(), PantheonInfo),
		alignments: z.array(Alignment),
		devotionMechanics: z.record(z.string(), z.unknown()).nullish(),
	})
	.passthrough();
export type AlignmentsFile = z.infer<typeof AlignmentsFile>;
