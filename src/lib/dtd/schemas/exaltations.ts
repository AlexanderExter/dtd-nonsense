/**
 * Zod schemas for exaltation data.
 *
 * Replaces former Pydantic model.
 */

import { z } from "zod";
import { Source } from "./common.js";

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const PowerStat = z
	.object({
		name: z.string(),
		description: z.string(),
	})
	.strict();
export type PowerStat = z.infer<typeof PowerStat>;

export const ResourceStat = z
	.object({
		name: z.string(),
		formula: z.string(),
		recovery: z.string(),
	})
	.strict();
export type ResourceStat = z.infer<typeof ResourceStat>;

export const StaticPower = z
	.object({
		name: z.string(),
		description: z.string(),
	})
	.strict();
export type StaticPower = z.infer<typeof StaticPower>;

export const ProgressionPower = z
	.object({
		dots: z.number().int(),
		name: z.string(),
		description: z.string(),
	})
	.strict();
export type ProgressionPower = z.infer<typeof ProgressionPower>;

// ---------------------------------------------------------------------------
// Top-level schemas
// ---------------------------------------------------------------------------

export const Exaltation = z
	.object({
		id: z.string(),
		name: z.string(),
		powerStat: PowerStat.nullable(),
		resourceStat: ResourceStat.nullable(),
		description: z.string(),
		staticPowers: z.array(StaticPower),
		tell: z.string().nullable(),
		progression: z.array(ProgressionPower),
		source: Source,
	})
	.passthrough();
export type Exaltation = z.infer<typeof Exaltation>;

export const ExaltationsFile = z
	.object({
		exaltations: z.array(Exaltation),
		resourcePointUses: z.array(z.unknown()).nullish(),
		notes: z.record(z.string(), z.unknown()).nullish(),
	})
	.passthrough();
export type ExaltationsFile = z.infer<typeof ExaltationsFile>;
