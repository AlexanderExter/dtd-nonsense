/**
 * Shared game constants used by both the Builder and Sheet tools.
 */

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
