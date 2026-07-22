import { produce } from "immer";
import { create } from "zustand";
import type { CharacterData } from "@/lib/dtd/types";
import { type BuilderGameData, type BuilderMeta, createDefaultMeta } from "./constants";

// =========================================================================
// Default character factory
// Uses a local inline default to avoid depending on the character module
// at module-evaluation time. On Linux/CI, bun may evaluate the store
// module before the character module is fully initialized (ESM TDZ).
// =========================================================================

const EMPTY_CHAR: CharacterData = {
	id: "",
	name: "",
	player: "",
	concept: "",
	totalXP: 600,
	xpSpent: 0,
	race: "",
	raceCharBonus: "",
	exaltation: "",
	alignment: "",
	devotion: 6,
	characteristics: {
		strength: 1,
		dexterity: 1,
		constitution: 1,
		charisma: 1,
		fellowship: 1,
		composure: 1,
		intelligence: 1,
		wisdom: 1,
		willpower: 1,
	},
	charSpecialties: {},
	skills: {},
	skillSpecialties: {},
	backgrounds: [],
	backgroundNotes: {},
	classes: [],
	feats: [],
	assets: [],
	hindrances: [],
	meleeWeapons: [],
	rangedWeapons: [],
	armor: [],
	naturalArmor: 0,
	aura: 0,
	auraSource: "",
	magicSchools: {},
	swordSchools: {},
	gunKata: {},
	spells: [],
	specialAttacks: [],
	trickShots: [],
	powerStat: 1,
	heroPointsMax: 2,
	heroPointsCurrent: 2,
	heroPointsBurnt: 0,
	fettered: false,
	pushAmount: 0,
	extraSchoolLevels: 0,
	bonusSchoolLevels: {},
	sanctioned: false,
	resourceCurrent: 0,
	exaltationNotes: "",
	modifiers: {
		staticDefense: 0,
		hitPoints: 0,
		mentalDefense: 0,
		resolve: 0,
		speed: 0,
		resilience: 0,
		initiative: 0,
	},
	savedPools: [],
	languages: ["Trade"],
	equipment: "",
	notes: "",
	classNotes: "",
	description: "",
	height: "",
	weight: "",
	age: "",
	currentHP: 0,
	currentResolve: 0,
	xpLog: [],
	xpSpendLog: [],
};

export function createDefaultChar(): CharacterData {
	return structuredClone(EMPTY_CHAR);
}

// =========================================================================
// Store interface
// =========================================================================

interface BuilderStore {
	char: CharacterData;
	currentStep: number;
	gameData: BuilderGameData | null;
	meta: BuilderMeta;

	setChar: (ch: CharacterData) => void;
	setCurrentStep: (step: number) => void;
	setGameData: (d: BuilderGameData) => void;
	setMeta: (m: BuilderMeta) => void;
	updateChar: (fn: (c: CharacterData) => void) => void;
	updateMeta: (fn: (m: BuilderMeta) => void) => void;
}

// =========================================================================
// Store
// =========================================================================

export const useBuilderStore = create<BuilderStore>((set) => ({
	char: structuredClone(EMPTY_CHAR),
	meta: createDefaultMeta(),
	gameData: null,
	currentStep: 1,

	setChar: (ch) => set({ char: ch }),
	setMeta: (m) => set({ meta: m }),
	setGameData: (d) => set({ gameData: d }),
	setCurrentStep: (step) => set({ currentStep: step }),

	updateChar: (fn) =>
		set(
			produce((state) => {
				fn(state.char);
			}),
		),

	updateMeta: (fn) =>
		set(
			produce((state) => {
				fn(state.meta);
			}),
		),
}));

// =========================================================================
