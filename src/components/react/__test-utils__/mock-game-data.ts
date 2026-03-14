/**
 * Minimal game-data fixtures for component and store tests.
 *
 * These are stripped-down subsets of the real JSON data files, containing
 * just enough structure for React components and stores to initialize
 * and render without crashing. NOT authoritative for game content.
 *
 * Usage:
 *   import { MOCK_GAME_DATA } from ".../mock-game-data";
 *   store.getState().setGameData(MOCK_GAME_DATA);
 */

export const MOCK_SKILLS = {
	characteristics: {
		physical: [
			{
				id: "strength",
				name: "Strength",
				abbrev: "Str",
				description: "Physical prowess.",
				specialties: [],
				ratings: [],
				skills: [
					{ id: "athletics", name: "Athletics", description: "Running, jumping, climbing." },
					{ id: "brawl", name: "Brawl", description: "Unarmed combat." },
				],
			},
			{
				id: "dexterity",
				name: "Dexterity",
				abbrev: "Dex",
				description: "Agility and reflexes.",
				specialties: [],
				ratings: [],
				skills: [{ id: "acrobatics", name: "Acrobatics", description: "Balance and tumbling." }],
			},
		],
		mental: [],
		social: [],
	},
};

export const MOCK_RACES = {
	races: [
		{
			id: "human",
			name: "Human",
			size: 4,
			languages: ["Trade"],
			charBonus: { options: ["strength", "dexterity"], description: "+1 to Strength or Dexterity" },
			skillBonus: [{ skill: "athletics", value: 1 }],
			power: { name: "Adaptable", description: "Gain one extra feat at character creation." },
			source: "book1",
		},
	],
};

export const MOCK_CLASSES = {
	classes: [
		{
			id: "guardsman",
			name: "Guardsman",
			tier: 1,
			source: "book1",
			description: "A basic military class.",
			prerequisiteText: "None",
			prerequisites: {},
			levels: [
				{
					level: 1,
					feats: [{ name: "Weapon Proficiency", type: "granted" }],
					skills: ["athletics"],
					features: [],
				},
			],
		},
	],
};

export const MOCK_FEATS = {
	feats: [{ id: "power-attack", name: "Power Attack", source: "book1", description: "Trade accuracy for damage." }],
};

/** Combined mock data keyed by filename (without .json), matching loadAllData output shape. */
export const MOCK_GAME_DATA: Record<string, unknown> = {
	skills: MOCK_SKILLS,
	races: MOCK_RACES,
	classes: MOCK_CLASSES,
	feats: MOCK_FEATS,
	weapons: { melee: [], ranged: [] },
	equipment: { armor: [], gear: [] },
	backgrounds: { backgrounds: [] },
	alignments: { alignments: [] },
	exaltations: { exaltations: [] },
	ships: { hulls: [], weapons: [], consoles: [], shields: [], torpedoes: [] },
	traits: [],
	"npc-templates": [],
};
