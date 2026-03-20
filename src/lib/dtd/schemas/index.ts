/**
 * Zod schema registry — maps JSON filenames to their validation schemas.
 *
 * Replaces former Pydantic FILE_MODELS registry.
 * isBareArray=true means the JSON file is a top-level array, not an object.
 */

import type { z } from "zod";
import { AlignmentsFile } from "./alignments.ts";
import { BackgroundsFile } from "./backgrounds.ts";
import { ClassesFile } from "./classes.ts";
import { EquipmentFile } from "./equipment.ts";
import { ExaltationsFile } from "./exaltations.ts";
import { FeatsFile } from "./feats.ts";
import { NpcTemplatesFile } from "./npc-templates.ts";
import { RacesFile } from "./races.ts";
import { ShipsFile } from "./ships.ts";
import { SkillsFile } from "./skills.ts";
import { TraitsFile } from "./traits.ts";
import { WeaponsFile } from "./weapons.ts";

// ---------------------------------------------------------------------------
// Re-exports for convenience
// ---------------------------------------------------------------------------

export { AlignmentsFile } from "./alignments.ts";
export { BackgroundsFile } from "./backgrounds.ts";
export { ClassesFile } from "./classes.ts";
export * from "./common.ts";
export { EquipmentFile } from "./equipment.ts";
export { ExaltationsFile } from "./exaltations.ts";
export { FeatsFile } from "./feats.ts";
export { NpcTemplatesFile } from "./npc-templates.ts";
export { RacesFile } from "./races.ts";
export { ShipsFile } from "./ships.ts";
export { SkillsFile } from "./skills.ts";
export { TraitsFile } from "./traits.ts";
export { WeaponsFile } from "./weapons.ts";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export interface SchemaEntry {
	isBareArray: boolean;
	schema: z.ZodType<any>;
}

/** Map from JSON filename → { schema, isBareArray }. */
export const FILE_SCHEMAS: Record<string, SchemaEntry> = {
	"alignments.json": { schema: AlignmentsFile, isBareArray: false },
	"backgrounds.json": { schema: BackgroundsFile, isBareArray: false },
	"classes.json": { schema: ClassesFile, isBareArray: false },
	"equipment.json": { schema: EquipmentFile, isBareArray: false },
	"exaltations.json": { schema: ExaltationsFile, isBareArray: false },
	"feats.json": { schema: FeatsFile, isBareArray: false },
	"npc-templates.json": { schema: NpcTemplatesFile, isBareArray: true },
	"races.json": { schema: RacesFile, isBareArray: false },
	"ships.json": { schema: ShipsFile, isBareArray: false },
	"skills.json": { schema: SkillsFile, isBareArray: false },
	"traits.json": { schema: TraitsFile, isBareArray: true },
	"weapons.json": { schema: WeaponsFile, isBareArray: false },
};
