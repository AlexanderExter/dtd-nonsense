/**
 * Shared game constants used across all tools.
 */

/** The 9 characteristic keys in canonical order. */
export const CHAR_KEYS = [
	"strength",
	"dexterity",
	"constitution",
	"charisma",
	"fellowship",
	"composure",
	"intelligence",
	"wisdom",
	"willpower",
] as const;

/** Short display abbreviations for characteristics. */
export const CHAR_ABBREV: Record<string, string> = {
	strength: "Str",
	dexterity: "Dex",
	constitution: "Con",
	charisma: "Cha",
	fellowship: "Fel",
	composure: "Com",
	intelligence: "Int",
	wisdom: "Wis",
	willpower: "Wil",
};

export const CHAR_GROUPS = {
	physical: {
		label: "Physical",
		chars: ["strength", "dexterity", "constitution"],
	},
	social: { label: "Social", chars: ["charisma", "fellowship", "composure"] },
	mental: { label: "Mental", chars: ["intelligence", "wisdom", "willpower"] },
} as Record<string, { label: string; chars: string[] }>;

export const CHAR_NAMES: Record<string, string> = {
	strength: "Strength",
	dexterity: "Dexterity",
	constitution: "Constitution",
	charisma: "Charisma",
	fellowship: "Fellowship",
	composure: "Composure",
	intelligence: "Intelligence",
	wisdom: "Wisdom",
	willpower: "Willpower",
};
