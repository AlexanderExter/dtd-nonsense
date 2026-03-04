/**
 * DTD Derived Stats — pure calculation functions for derived character stats.
 *
 * All methods are stateless and side-effect-free.
 *
 * Prefer importing directly for tree-shaking:
 *   import { derived } from "@/lib/dtd/derived";
 */

export const derived = {
	/**
	 * Static Defense: 10 + (Dex + Wis) × 3 − Size × 2
	 * Halfling variant: 10 + Dex × 6 − Size × 2
	 */
	calculateSD(dex: number, wis: number, size: number, isHalfling = false): number {
		if (isHalfling) {
			return 10 + dex * 6 - size * 2;
		}
		return 10 + (dex + wis) * 3 - size * 2;
	},

	/** Hit Points: (Con + Wil) × 2 */
	calculateHP(con: number, wil: number): number {
		return (con + wil) * 2;
	},

	/** Mental Defense: 5 + Composure × 5 */
	calculateMentalDefense(composure: number): number {
		return 5 + composure * 5;
	},

	/** Resolve: Willpower + Composure */
	calculateResolve(wil: number, composure: number): number {
		return wil + composure;
	},

	/** Initiative base: Dex + Composure */
	calculateInitiativeBase(dex: number, composure: number): number {
		return dex + composure;
	},

	/** Speed: Strength + Dexterity */
	calculateSpeed(str: number, dex: number): number {
		return str + dex;
	},

	/** Resilience: ceil((Size + Level) / 2) + 1 */
	calculateResilience(size: number, level: number): number {
		return Math.ceil((size + level) / 2) + 1;
	},
};
