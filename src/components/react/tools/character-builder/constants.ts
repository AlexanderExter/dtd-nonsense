/**
 * Character Builder — constants, types, and helper functions.
 */
import type { CharacterData } from "@/lib/dtd/types";

// =========================================================================
// Creation limits
// =========================================================================

export const TOTAL_XP = 600;
export const BASE_CHAR_DOT = 1;
export const CREATION_CHAR_CAP = 4;
export const CREATION_SKILL_CAP = 3;
export const BG_BUDGET = 7;
export const FREE_BG_CAP = 3;
export const BG_XP_PER_DOT = 100;

// =========================================================================
// Priority dot pools
// =========================================================================

export const CHAR_PRIORITY_DOTS: Record<string, number> = {
	primary: 6,
	secondary: 4,
	tertiary: 2,
};

export const SKILL_PRIORITY_DOTS: Record<string, number> = {
	primary: 8,
	secondary: 6,
	tertiary: 4,
};

// =========================================================================
// Step labels
// =========================================================================

export const STEP_LABELS = [
	"Identity",
	"Race",
	"Exaltation",
	"Characteristics",
	"Skills",
	"Backgrounds",
	"Alignment",
	"Classes",
	"Feats & Assets",
	"Equipment",
	"Review",
];

// =========================================================================
// Feat / Asset / Hindrance categories
// =========================================================================

export const FEAT_CATS = ["general", "racial", "supplementary"];
export const AH_CATS = ["asset", "exaltedAsset", "hindrance"];

// =========================================================================
// Meta state
// =========================================================================

export interface BuilderMeta {
	step: number;
	stepsCompleted: boolean[];
	charPriority: Record<string, string | null>;
	skillPriority: Record<string, string | null>;
	charDotsSpent: Record<string, number>;
	skillDotsSpent: Record<string, number>;
	equipmentPkg: string | null;
	equipmentChoices: Record<number, string>;
}

export function createDefaultMeta(): BuilderMeta {
	return {
		step: 1,
		stepsCompleted: new Array(11).fill(false),
		charPriority: { physical: null, social: null, mental: null },
		skillPriority: { physical: null, social: null, mental: null },
		charDotsSpent: { physical: 0, social: 0, mental: 0 },
		skillDotsSpent: { physical: 0, social: 0, mental: 0 },
		equipmentPkg: null,
		equipmentChoices: {},
	};
}

// =========================================================================
// XP Breakdown
// =========================================================================

interface XPBreakdown {
	classes: number;
	feats: number;
	assets: number;
	hindrances: number;
	backgrounds: number;
	total: number;
	remaining: number;
	spent: number;
	breakdown: Record<string, number>;
}

export function calcXP(char: CharacterData): XPBreakdown {
	const classXP = Math.max(0, (char.classes?.length || 0) - 1) * 100;
	const featXP = (char.feats?.length || 0) * 100;
	const assetXP = (char.assets?.length || 0) * 100;
	const hindranceXP = (char.hindrances || []).reduce((sum) => sum + 100, 0);
	const bgXP = (char.backgrounds || []).reduce((sum, b) => {
		const xpDots = Math.max(0, b.dots - FREE_BG_CAP);
		return sum + xpDots * BG_XP_PER_DOT;
	}, 0);

	const spent = classXP + featXP + assetXP + bgXP;
	const bonusXP = hindranceXP;
	const total = TOTAL_XP + bonusXP;

	return {
		classes: classXP,
		feats: featXP,
		assets: assetXP,
		hindrances: -bonusXP,
		backgrounds: bgXP,
		total: TOTAL_XP,
		remaining: total - spent,
		spent,
		breakdown: {
			classes: classXP,
			feats: featXP,
			assets: assetXP,
			hindrances: -bonusXP,
			backgrounds: bgXP,
		},
	};
}

// =========================================================================
// Helpers
// =========================================================================

/* eslint-disable @typescript-eslint/no-explicit-any -- game data shapes vary */

export function getTotalChars(char: CharacterData, raceData: any): Record<string, number> {
	const result: Record<string, number> = { ...char.characteristics };
	if (raceData) {
		for (const bonus of raceData.statBonuses || []) {
			const key = bonus.toLowerCase();
			if (key in result) result[key] += 1;
		}
		if (char.raceCharBonus && char.raceCharBonus in result) {
			result[char.raceCharBonus] += 1;
		}
	}
	return result;
}

export function getSize(raceData: any): number {
	return raceData?.size ?? 4;
}

export function getLevel(char: CharacterData): number {
	return (char.classes || []).length > 0 ? 1 : 0;
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function filterByRestrictions(items: any[], raceName: string | null, exaltationName: string | null): any[] {
	return items.filter((f) => {
		if (f.raceRestriction && f.raceRestriction !== raceName) return false;
		if (f.exaltationRestriction) {
			if (!exaltationName) return false;
			const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();
			if (norm(f.exaltationRestriction) !== norm(exaltationName)) return false;
		}
		return true;
	});
}

export function findRaceData(gameData: Record<string, any> | null, raceName: string): any {
	if (!gameData?.races?.races) return null;
	return (gameData.races.races as any[]).find((r: any) => r.id === raceName || r.name === raceName) ?? null;
}
