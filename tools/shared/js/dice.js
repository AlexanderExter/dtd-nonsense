/**
 * DTD Dice Rolling Module
 * Shared dice rolling functions for all DTD tools
 *
 * Roll format: XkY+N where X dice rolled, Y kept, N is flat modifier.
 * Implements full D:TD overflow compression and exploding d10s.
 *
 * API:
 *   DTD.dice.roll(numDice, keepDice, modifier?, options?)
 *   DTD.dice.calculateOutcome(total, tn)
 *   DTD.dice.parseNotation(str)
 *   DTD.dice.formatResult(result, tn?)
 *   DTD.dice.compressOverflow(numDice, keepDice, modifier?)
 */

(function () {
    'use strict';

    // =========================================================================
    // Internal Helpers
    // =========================================================================

    /**
     * Roll a single exploding d10.
     * @returns {DieRoll}
     */
    function rollOneDie() {
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
     * Roll a single d10 for rank-0 mode (no explosion, 10 → 0).
     * @returns {DieRoll}
     */
    function rollRankZero() {
        const roll = Math.floor(Math.random() * 10) + 1;
        return {
            value: roll === 10 ? 0 : roll,
            base: roll,
            exploded: false
        };
    }

    /**
     * Apply overflow compression to numDice/keepDice.
     *
     * Rules:
     * 1. >10 rolled dice: every 2 excess rolled → +1 kept die
     * 2. Kept dice >10: each excess kept die adds flat +5
     * 3. Combined: first compress rolled, then compress kept
     *
     * @param {number} numDice - Original rolled dice count
     * @param {number} keepDice - Original kept dice count
     * @param {number} modifier - Original flat modifier
     * @returns {{ numDice: number, keepDice: number, modifier: number, compressed: boolean }}
     */
    function compressOverflow(numDice, keepDice, modifier) {
        let compressed = false;

        // Step 1: Compress excess rolled dice (>10) into extra kept dice
        if (numDice > 10) {
            const excessRolled = numDice - 10;
            const extraKept = Math.floor(excessRolled / 2);
            keepDice += extraKept;
            numDice = 10;
            compressed = true;
        }

        // Keep can't exceed rolled
        if (keepDice > numDice) {
            keepDice = numDice;
        }

        // Step 2: Compress excess kept dice (>10) into flat +5 each
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

    const dice = {
        /**
         * Roll XkY+N with exploding d10s and overflow compression.
         *
         * @param {number} numDice - Dice to roll (X). Will be compressed if >10.
         * @param {number} keepDice - Dice to keep (Y). Capped at 10 after compression.
         * @param {number} [modifier=0] - Flat bonus/penalty after summing kept dice.
         * @param {Object} [options={}] - Additional options.
         * @param {boolean} [options.rankZero=false] - Rank-0 mode: roll 1d10, 10→0, no explosion.
         * @returns {DiceResult}
         */
        roll(numDice, keepDice, modifier = 0, options = {}) {
            // Rank-0 edge case
            if (options.rankZero || keepDice === 0) {
                const die = rollRankZero();
                return {
                    allRolls: [die],
                    keptRolls: [die],
                    droppedRolls: [],
                    diceTotal: die.value,
                    modifier: modifier,
                    total: die.value + modifier,
                    overflow: null
                };
            }

            // Sanitize inputs
            numDice = Math.max(1, Math.round(numDice));
            keepDice = Math.max(1, Math.round(keepDice));
            if (keepDice > numDice) keepDice = numDice;

            // Apply overflow compression
            const overflow = compressOverflow(numDice, keepDice, modifier);
            numDice = overflow.numDice;
            keepDice = overflow.keepDice;
            modifier = overflow.modifier;

            // Roll all dice
            const allRolls = [];
            for (let i = 0; i < numDice; i++) {
                allRolls.push(rollOneDie());
            }

            // Sort by value descending to keep highest
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
                overflow: overflow.compressed ? overflow : null
            };
        },

        /**
         * Evaluate a total against a TN.
         * @param {number} total - Roll total
         * @param {number} tn - Target Number
         * @returns {{ success: boolean, raises: number, checks: number }}
         */
        calculateOutcome(total, tn) {
            const diff = total - tn;
            if (diff >= 0) {
                return {
                    success: true,
                    raises: Math.floor(diff / 5),
                    checks: 0
                };
            } else {
                return {
                    success: false,
                    raises: 0,
                    checks: Math.floor(Math.abs(diff) / 5)
                };
            }
        },

        /**
         * Parse "XkY", "XkY+N", or "XkY-N" notation string.
         * @param {string} str - Dice notation string
         * @returns {{ num: number, keep: number, modifier: number } | null}
         */
        parseNotation(str) {
            if (!str || typeof str !== 'string') return null;
            const match = str.trim().toLowerCase().match(/^(\d+)k(\d+)\s*([+-]\s*\d+)?$/);
            if (!match) return null;
            return {
                num: parseInt(match[1], 10),
                keep: parseInt(match[2], 10),
                modifier: match[3] ? parseInt(match[3].replace(/\s/g, ''), 10) : 0
            };
        },

        /**
         * Format a DiceResult for human display.
         * @param {DiceResult} result - Result from roll()
         * @param {number} [tn] - Optional TN for outcome display
         * @returns {string}
         */
        formatResult(result, tn) {
            let text = `Total: ${result.total}`;
            if (result.modifier !== 0) {
                text += ` (${result.diceTotal}${result.modifier >= 0 ? '+' : ''}${result.modifier})`;
            }

            if (tn != null) {
                const outcome = this.calculateOutcome(result.total, tn);
                if (outcome.success) {
                    if (outcome.raises > 0) {
                        text += ` — Success with ${outcome.raises} Raise${outcome.raises > 1 ? 's' : ''}`;
                    } else {
                        text += ' — Success';
                    }
                } else {
                    if (outcome.checks > 0) {
                        text += ` — Failure (${outcome.checks} Check${outcome.checks > 1 ? 's' : ''})`;
                    } else {
                        text += ' — Failure';
                    }
                }
            }

            return text;
        },

        /**
         * Expose overflow compression for testing/display.
         * @param {number} numDice
         * @param {number} keepDice
         * @param {number} [modifier=0]
         * @returns {{ numDice: number, keepDice: number, modifier: number, compressed: boolean }}
         */
        compressOverflow(numDice, keepDice, modifier = 0) {
            return compressOverflow(numDice, keepDice, modifier);
        },

        // =====================================================================
        // Backward Compatibility Aliases
        // =====================================================================

        /**
         * @deprecated Use roll() instead
         */
        rollKeepHighest(numDice, keepDice, modifier = 0) {
            const result = this.roll(numDice, keepDice, modifier);
            // Return in old shape for backward compat
            return {
                allRolls: result.allRolls.map(d => d.value),
                keptRolls: result.keptRolls.map(d => d.value),
                dropped: result.droppedRolls.map(d => d.value),
                total: result.total,
                modifier: result.modifier,
                diceTotal: result.diceTotal
            };
        },

        /**
         * @deprecated Use formatResult() instead
         */
        formatRollResult(result, tn) {
            const outcome = this.calculateOutcome(result.total, tn);
            if (outcome.success) {
                if (outcome.raises > 0) {
                    return `Success with ${outcome.raises} Raise${outcome.raises > 1 ? 's' : ''}`;
                }
                return 'Success';
            } else {
                if (outcome.checks > 0) {
                    return `Failure (${outcome.checks} Check${outcome.checks > 1 ? 's' : ''})`;
                }
                return 'Failure';
            }
        }
    };

    // =========================================================================
    // Export
    // =========================================================================

    if (typeof window !== 'undefined') {
        window.DTD = window.DTD || {};
        window.DTD.dice = dice;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = dice;
    }
})();

/**
 * @typedef {Object} DiceResult
 * @property {DieRoll[]} allRolls - Every die rolled, in order
 * @property {DieRoll[]} keptRolls - The Y highest rolls (sorted descending)
 * @property {DieRoll[]} droppedRolls - Rolls not kept
 * @property {number} diceTotal - Sum of kept rolls (before modifier)
 * @property {number} modifier - The flat +N/-N
 * @property {number} total - diceTotal + modifier (final result)
 * @property {Object|null} overflow - Overflow compression info, or null if no compression
 */

/**
 * @typedef {Object} DieRoll
 * @property {number} value - Final value of this die (sum of all explosions)
 * @property {number} base - First roll (1-10)
 * @property {boolean} exploded - Whether the die exploded at least once
 */
