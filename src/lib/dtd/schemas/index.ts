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
import { CombatTechniquesFile } from "./combat-techniques.ts";
import { ConditionsFile } from "./conditions.ts";
import { EquipmentFile } from "./equipment.ts";
import { ExaltationsFile } from "./exaltations.ts";
import { FeatsFile } from "./feats.ts";
import { NpcTemplatesFile } from "./npc-templates.ts";
import { RacesFile } from "./races.ts";
import { SchoolsFile } from "./schools.ts";
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
export { CombatTechniquesFile } from "./combat-techniques.ts";
export * from "./common.ts";
export { ConditionsFile } from "./conditions.ts";
export { EquipmentFile } from "./equipment.ts";
export { ExaltationsFile } from "./exaltations.ts";
export { FeatsFile } from "./feats.ts";
export { NpcTemplatesFile } from "./npc-templates.ts";
export { RacesFile } from "./races.ts";
export { SchoolsFile } from "./schools.ts";
export { ShipsFile } from "./ships.ts";
export { SkillsFile } from "./skills.ts";
export { TraitsFile } from "./traits.ts";
export { WeaponsFile } from "./weapons.ts";

// ---------------------------------------------------------------------------
// Type-safe data file map — maps JSON filenames to their inferred TS types
// ---------------------------------------------------------------------------

export interface GameDataMap {
	"alignments.json": z.infer<typeof AlignmentsFile>;
	"backgrounds.json": z.infer<typeof BackgroundsFile>;
	"classes.json": z.infer<typeof ClassesFile>;
	"combat-techniques.json": z.infer<typeof CombatTechniquesFile>;
	"conditions.json": z.infer<typeof ConditionsFile>;
	"equipment.json": z.infer<typeof EquipmentFile>;
	"exaltations.json": z.infer<typeof ExaltationsFile>;
	"feats.json": z.infer<typeof FeatsFile>;
	"npc-templates.json": z.infer<typeof NpcTemplatesFile>;
	"races.json": z.infer<typeof RacesFile>;
	"schools.json": z.infer<typeof SchoolsFile>;
	"ships.json": z.infer<typeof ShipsFile>;
	"skills.json": z.infer<typeof SkillsFile>;
	"traits.json": z.infer<typeof TraitsFile>;
	"weapons.json": z.infer<typeof WeaponsFile>;
}

/** Filename stem (without .json extension) → type mapping for useAllData results. */
export type GameDataResult<T extends (keyof GameDataMap)[]> = {
	[K in T[number] as K extends `${infer Stem}.json` ? Stem : never]: GameDataMap[K];
};

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
	"combat-techniques.json": { schema: CombatTechniquesFile, isBareArray: false },
	"conditions.json": { schema: ConditionsFile, isBareArray: true },
	"equipment.json": { schema: EquipmentFile, isBareArray: false },
	"exaltations.json": { schema: ExaltationsFile, isBareArray: false },
	"feats.json": { schema: FeatsFile, isBareArray: false },
	"npc-templates.json": { schema: NpcTemplatesFile, isBareArray: true },
	"races.json": { schema: RacesFile, isBareArray: false },
	"schools.json": { schema: SchoolsFile, isBareArray: false },
	"ships.json": { schema: ShipsFile, isBareArray: false },
	"skills.json": { schema: SkillsFile, isBareArray: false },
	"traits.json": { schema: TraitsFile, isBareArray: true },
	"weapons.json": { schema: WeaponsFile, isBareArray: false },
};
