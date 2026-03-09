/**
 * DTD Dice Primitives — Pure Functions
 *
 * Core dice rolling logic used by both:
 * - src/lib/dtd/dice.ts (TypeScript ESM)
 * - public/workers/dice-common.js (Web Worker utility)
 *
 * CANONICAL SOURCE: This file (dice-primitives.ts)
 * DERIVED: dice-common.js must be kept in sync with this file
 *
 * Changes to compression formula or explosion behavior must update BOTH locations.
 */

import type { DieRoll, OverflowInfo } from "./types.ts";

// =========================================================================
// Roll Primitives (copied to dice-common.js — keep in sync)
// =========================================================================

/**
 * Roll a single exploding d10.
 * If the die lands on 10, re-roll and add the result (repeating).
 * @returns {DieRoll} Roll object with value, base, and explosion flag
 */
export function rollOneDie(): DieRoll {
	const firstRoll = Math.floor(Math.random() * 10) + 1;
	let value = firstRoll;
	let exploded = false;
	let current = firstRoll;

	while (current === 10) {
		exploded = true;
		current = Math.floor(Math.random() * 10) + 1;
		value += current;
	}

	return { value, base: firstRoll, exploded };
}

/**
 * Apply overflow compression to dice pool parameters.
 *
 * Rules:
 * 1. >10 rolled dice: every 2 excess rolled → +1 kept die
 * 2. Kept dice >10: each excess kept die adds flat +5
 * 3. Combined: first compress rolled, then compress kept
 *
 * @param {number} numDice - Dice to roll
 * @param {number} keepDice - Dice to keep
 * @param {number} modifier - Flat modifier
 * @returns {OverflowInfo} Compressed parameters and flag
 */
export function compressOverflow(numDice: number, keepDice: number, modifier: number): OverflowInfo {
	let compressed = false;

	if (numDice > 10) {
		const excessRolled = numDice - 10;
		const extraKept = Math.floor(excessRolled / 2);
		keepDice += extraKept;
		numDice = 10;
		compressed = true;
	}

	if (keepDice > numDice) {
		keepDice = numDice;
	}

	if (keepDice > 10) {
		const excessKept = keepDice - 10;
		modifier += excessKept * 5;
		keepDice = 10;
		compressed = true;
	}

	return { numDice, keepDice, modifier, compressed };
}

/**
 * Roll a dice pool: roll numDice d10s (exploding), keep the highest
 * keepDice results, and add a flat modifier.
 *
 * @param {number} numDice - Number of dice to roll
 * @param {number} keepDice - Number of dice to keep (highest)
 * @param {number} modifier - Flat modifier added to the total
 * @returns {number} Final total
 */
export function rollPool(numDice: number, keepDice: number, modifier: number): number {
	const rolls = new Array(numDice);
	for (let i = 0; i < numDice; i++) {
		rolls[i] = rollOneDie();
	}
	rolls.sort((a, b) => b.value - a.value);
	let sum = 0;
	for (let i = 0; i < keepDice; i++) {
		sum += rolls[i].value;
	}
	return sum + modifier;
}
