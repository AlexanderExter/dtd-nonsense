/**
 * DTD Dice Rolling Module (ES module)
 *
 * Roll format: XkY+N where X dice rolled, Y kept, N is flat modifier.
 * Implements full D:TD overflow compression and exploding d10s.
 *
 * Ported from tools/shared/js/dice.js.
 */
import { compressOverflow as _compressOverflow, rollOneDie as _rollOneDie } from "./dice-primitives.ts";
import type { DiceResult, DieRoll, Outcome, ParsedNotation } from "./types.ts";

// =========================================================================
// Internal Helpers
// =========================================================================

/** Roll a single exploding d10 (re-exported from dice-primitives.ts). */
function rollOneDie(): DieRoll {
	return _rollOneDie();
}

/** Roll a single d10 for rank-0 mode (no explosion, 10 → 0). */
function rollRankZero(): DieRoll {
	const roll = Math.floor(Math.random() * 10) + 1;
	return {
		value: roll === 10 ? 0 : roll,
		base: roll,
		exploded: false,
	};
}

/**
 * Apply overflow compression to numDice/keepDice.
 * This function is imported from dice-primitives.ts to serve as the canonical
 * source for the overflow formula. Other modules (workers) must keep their
 * copies synchronized with dice-primitives.ts.
 */
// _compressOverflow is imported from dice-primitives.ts (line 8)

// =========================================================================
// Public API
// =========================================================================

/**
 * Roll XkY+N with exploding d10s and overflow compression.
 *
 * @param {number} numDice - Dice to roll (X).
 * @param {number} keepDice - Dice to keep (Y).
 * @param {number} [modifier=0] - Flat bonus/penalty.
 * @param {Object} [options={}] - Additional options.
 * @param {boolean} [options.rankZero=false] - Rank-0 mode.
 * @returns {DiceResult}
 */
export function roll(
	numDice: number,
	keepDice: number,
	modifier = 0,
	options: { rankZero?: boolean } = {},
): DiceResult {
	if (options.rankZero || keepDice === 0) {
		const die = rollRankZero();
		return {
			allRolls: [die],
			keptRolls: [die],
			droppedRolls: [],
			diceTotal: die.value,
			modifier: modifier,
			total: die.value + modifier,
			overflow: null,
		};
	}

	numDice = Math.max(1, Math.round(numDice));
	keepDice = Math.max(1, Math.round(keepDice));
	if (keepDice > numDice) keepDice = numDice;

	const overflow = _compressOverflow(numDice, keepDice, modifier);
	numDice = overflow.numDice;
	keepDice = overflow.keepDice;
	modifier = overflow.modifier;

	const allRolls = [];
	for (let i = 0; i < numDice; i++) {
		allRolls.push(rollOneDie());
	}

	const sorted = [...allRolls].sort((a, b) => b.value - a.value);
	const keptRolls = sorted.slice(0, keepDice);
	const droppedRolls = sorted.slice(keepDice);

	const diceTotal = keptRolls.reduce((sum, d) => sum + d.value, 0);
	const total = diceTotal + modifier;

	return {
		allRolls,
		keptRolls,
		droppedRolls,
		diceTotal,
		modifier,
		total,
		overflow: overflow.compressed ? overflow : null,
	};
}

/**
 * Evaluate a total against a TN.
 * @param {number} total - Roll total
 * @param {number} tn - Target Number
 * @returns {{ success: boolean, raises: number, checks: number }}
 */
export function calculateOutcome(total: number, tn: number): Outcome {
	const diff = total - tn;
	if (diff >= 0) {
		return {
			success: true,
			raises: Math.floor(diff / 5),
			checks: 0,
		};
	}
	return {
		success: false,
		raises: 0,
		checks: Math.floor(Math.abs(diff) / 5),
	};
}

/**
 * Parse "XkY", "XkY+N", or "XkY-N" notation string.
 * @param {string} str - Dice notation string
 * @returns {{ num: number, keep: number, modifier: number } | null}
 */
export function parseNotation(str: unknown): ParsedNotation | null {
	if (!str || typeof str !== "string") return null;
	const match = str
		.trim()
		.toLowerCase()
		.match(/^(\d+)k(\d+)\s*([+-]\s*\d+)?$/);
	if (!match) return null;
	return {
		num: Number.parseInt(match[1], 10),
		keep: Number.parseInt(match[2], 10),
		modifier: match[3] ? Number.parseInt(match[3].replace(/\s/g, ""), 10) : 0,
	};
}
