/**
 * Zod schemas for class data.
 *
 * Replaces former Pydantic model.
 */

import { z } from "zod";
import { ClassFeatEntry } from "./common.js";

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const ClassesMetadata = z
	.object({
		description: z.string(),
		version: z.string(),
		levelsComplete: z.array(z.number().int()),
		levelsPending: z.array(z.number().int()),
	})
	.strict();
export type ClassesMetadata = z.infer<typeof ClassesMetadata>;

export const TrackInfo = z
	.object({
		name: z.string(),
		classes: z.array(z.string()),
	})
	.strict();
export type TrackInfo = z.infer<typeof TrackInfo>;

export const GameClass = z
	.object({
		id: z.string(),
		name: z.string(),
		level: z.number().int().min(1).max(5),
		track: z.string().nullable(),
		prerequisites: z.string(),
		characteristics: z.array(z.string()),
		skills: z.array(z.string()),
		feats: z.array(ClassFeatEntry),
		swordSchools: z.array(z.string()),
		magicSchools: z.array(z.string()),
		gunKata: z.array(z.string()),
		completionBonus: z.string(),
		suggestedExits: z.array(z.string()),
	})
	.strict();
export type GameClass = z.infer<typeof GameClass>;

// ---------------------------------------------------------------------------
// Top-level schema
// ---------------------------------------------------------------------------

export const ClassesFile = z
	.object({
		metadata: ClassesMetadata,
		tracks: z.record(z.string(), TrackInfo),
		classes: z.array(GameClass),
	})
	.strict();
export type ClassesFile = z.infer<typeof ClassesFile>;
