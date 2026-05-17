/**
 * Zod schema for schools data (magic schools, sword schools, gun kata).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Magic School (strict)
// ---------------------------------------------------------------------------

export const MagicSchool = z
	.object({
		id: z.string(),
		name: z.string(),
		characteristic: z.string(),
	})
	.strict();
export type MagicSchool = z.infer<typeof MagicSchool>;

// ---------------------------------------------------------------------------
// Combat School (strict — sword schools and gun kata)
// ---------------------------------------------------------------------------

export const CombatSchool = z
	.object({
		id: z.string(),
		name: z.string(),
	})
	.strict();
export type CombatSchool = z.infer<typeof CombatSchool>;

// ---------------------------------------------------------------------------
// File-level schema
// ---------------------------------------------------------------------------

export const SchoolsFile = z
	.object({
		magicSchools: z.array(MagicSchool),
		swordSchools: z.array(CombatSchool),
		gunKata: z.array(CombatSchool),
	})
	.strict();
export type SchoolsFile = z.infer<typeof SchoolsFile>;
