/**
 * Zod schema registry — maps JSON filenames to their validation schemas.
 *
 * Mirrors pipeline/models/__init__.py FILE_MODELS registry.
 * isBareArray=true means the JSON file is a top-level array, not an object.
 */

import type { z } from "zod";
import { AlignmentsFile } from "./alignments.js";
import { BackgroundsFile } from "./backgrounds.js";
import { ClassesFile } from "./classes.js";
import { EquipmentFile } from "./equipment.js";
import { ExaltationsFile } from "./exaltations.js";
import { FeatsFile } from "./feats.js";
import { NpcTemplatesFile } from "./npc-templates.js";
import { RacesFile } from "./races.js";
import { ShipsFile } from "./ships.js";
import { SkillsFile } from "./skills.js";
import { TraitsFile } from "./traits.js";
import { WeaponsFile } from "./weapons.js";

// ---------------------------------------------------------------------------
// Re-exports for convenience
// ---------------------------------------------------------------------------

export { AlignmentsFile } from "./alignments.js";
export { BackgroundsFile } from "./backgrounds.js";
export { ClassesFile } from "./classes.js";
export * from "./common.js";
export { EquipmentFile } from "./equipment.js";
export { ExaltationsFile } from "./exaltations.js";
export { FeatsFile } from "./feats.js";
export { NpcTemplatesFile } from "./npc-templates.js";
export { RacesFile } from "./races.js";
export { ShipsFile } from "./ships.js";
export { SkillsFile } from "./skills.js";
export { TraitsFile } from "./traits.js";
export { WeaponsFile } from "./weapons.js";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export interface SchemaEntry {
	// biome-ignore lint/suspicious/noExplicitAny: registry holds heterogeneous schemas
	schema: z.ZodType<any>;
	isBareArray: boolean;
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
