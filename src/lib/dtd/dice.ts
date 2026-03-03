/**
 * DTD Dice Rolling Module (ES module)
 *
 * Roll format: XkY+N where X dice rolled, Y kept, N is flat modifier.
 * Implements full D:TD overflow compression and exploding d10s.
 *
 * Ported from tools/shared/js/dice.js.
 */
import type { DiceResult, DieRoll, Outcome, OverflowInfo, ParsedNotation } from './types.ts';

// =========================================================================
// Internal Helpers
// =========================================================================

/** Roll a single exploding d10. */
function rollOneDie(): DieRoll {
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
 *
 * Rules:
 * 1. >10 rolled dice: every 2 excess rolled → +1 kept die
 * 2. Kept dice >10: each excess kept die adds flat +5
 * 3. Combined: first compress rolled, then compress kept
 */
function _compressOverflow(numDice: number, keepDice: number, modifier: number): OverflowInfo {
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
export function roll(numDice: number, keepDice: number, modifier = 0, options: { rankZero?: boolean } = {}): DiceResult {
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
  } else {
    return {
      success: false,
      raises: 0,
      checks: Math.floor(Math.abs(diff) / 5),
    };
  }
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
    num: parseInt(match[1], 10),
    keep: parseInt(match[2], 10),
    modifier: match[3] ? parseInt(match[3].replace(/\s/g, ""), 10) : 0,
  };
}


