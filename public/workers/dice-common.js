/**
 * Shared dice rolling primitives for web workers.
 * Used by simulation-worker.js and defense-worker.js via importScripts.
 * Canonical source: src/lib/dtd/dice.ts — keep in sync.
 */

// =========================================================================
// Dice Primitives (self-contained — no DOM dependencies)
// =========================================================================

/**
 * Roll a single d10 with exploding 10s.
 * If the die lands on 10, roll again and add the result (repeating).
 * @returns {number} Raw accumulated value
 */
function rollOneDie() {
	let value = 0;
	let roll;
	do {
		roll = Math.floor(Math.random() * 10) + 1;
		value += roll;
	} while (roll === 10);
	return value;
}

/**
 * Compress an overflow dice pool using the D:TD overflow formula.
 * - Dice beyond 10 convert to extra kept dice (2 excess → 1 kept).
 * - Kept dice beyond 10 convert to a flat +5 modifier each.
 * @param {number} numDice  - Number of dice to roll
 * @param {number} keepDice - Number of dice to keep (highest)
 * @param {number} modifier - Flat modifier added to the total
 * @returns {{ numDice: number, keepDice: number, modifier: number }}
 */
function compressOverflow(numDice, keepDice, modifier) {
	if (numDice > 10) {
		const excess = numDice - 10;
		keepDice += Math.floor(excess / 2);
		numDice = 10;
	}
	if (keepDice > numDice) keepDice = numDice;
	if (keepDice > 10) {
		modifier += (keepDice - 10) * 5;
		keepDice = 10;
	}
	return { numDice, keepDice, modifier };
}

/**
 * Roll a dice pool: roll numDice d10s (exploding), keep the highest
 * keepDice results, and add a flat modifier.
 * @param {number} numDice  - Number of dice to roll
 * @param {number} keepDice - Number of dice to keep (highest)
 * @param {number} modifier - Flat modifier added to the total
 * @returns {number} Final total
 */
function rollPool(numDice, keepDice, modifier) {
	const rolls = new Array(numDice);
	for (let i = 0; i < numDice; i++) {
		rolls[i] = rollOneDie();
	}
	rolls.sort((a, b) => b - a);
	let sum = 0;
	for (let i = 0; i < keepDice; i++) {
		sum += rolls[i];
	}
	return sum + modifier;
}
