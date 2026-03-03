/**
 * Zod schemas for feat data.
 *
 * Mirrors pipeline/models/feats.py.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const FeatsMetadata = z
	.object({
		description: z.string(),
		version: z.string(),
		sectionsComplete: z.array(z.string()),
		sectionsPending: z.array(z.string()),
	})
	.strict();
export type FeatsMetadata = z.infer<typeof FeatsMetadata>;

export const FeatCategory = z.enum(["general", "racial", "supplementary", "asset", "exaltedAsset", "hindrance"]);
export type FeatCategory = z.infer<typeof FeatCategory>;

// ---------------------------------------------------------------------------
// Top-level schemas
// ---------------------------------------------------------------------------

export const Feat = z
	.object({
		id: z.string(),
		name: z.string(),
		category: FeatCategory,
		effect: z.string(),
		details: z.string(),
		multipleAllowed: z.boolean(),
		groups: z.array(z.string()).nullable(),
		prerequisites: z.string().nullable(),
		raceRestriction: z.string().nullish(),
		exaltationRestriction: z.string().nullish(),
		creationOnly: z.boolean().nullish(),
		bonusXP: z.number().int().nullish(),
		subOptions: z.union([z.array(z.record(z.string(), z.unknown())), z.record(z.string(), z.string())]).nullish(),
	})
	.passthrough();
export type Feat = z.infer<typeof Feat>;

export const FeatsFile = z
	.object({
		metadata: FeatsMetadata,
		feats: z.array(Feat),
	})
	.strict();
export type FeatsFile = z.infer<typeof FeatsFile>;
