/**
 * Zod schemas for race data.
 *
 * Mirrors pipeline/models/races.py.
 */

import { z } from "zod";
import { SkillBonusEntry, Source } from "./common.js";

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const CharBonusChoice = z
	.object({
		options: z.array(z.string()),
		description: z.string(),
	})
	.strict();
export type CharBonusChoice = z.infer<typeof CharBonusChoice>;

export const RacialPowerOption = z
	.object({
		name: z.string(),
		description: z.string(),
	})
	.strict();
export type RacialPowerOption = z.infer<typeof RacialPowerOption>;

export const RacialPower = z
	.object({
		name: z.string(),
		description: z.string(),
		options: z.array(z.union([z.string(), RacialPowerOption])).nullish(),
	})
	.passthrough();
export type RacialPower = z.infer<typeof RacialPower>;

// ---------------------------------------------------------------------------
// Top-level schemas
// ---------------------------------------------------------------------------

export const Race = z
	.object({
		id: z.string(),
		name: z.string(),
		size: z.number().int().min(1).max(7),
		languages: z.array(z.string()),
		charBonus: CharBonusChoice,
		skillBonus: z.array(SkillBonusEntry),
		power: RacialPower,
		source: Source,
		notes: z.string().nullish(),
	})
	.passthrough();
export type Race = z.infer<typeof Race>;

export const RacesFile = z
	.object({
		races: z.array(Race),
	})
	.strict();
export type RacesFile = z.infer<typeof RacesFile>;
