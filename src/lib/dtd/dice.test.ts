import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateOutcome, parseNotation, roll } from "./dice.ts";

// ---------------------------------------------------------------------------
// Helpers — Math.random mock utilities
// ---------------------------------------------------------------------------

/**
 * Return a mock Math.random that yields predetermined die values.
 * Each value N (1–10) maps to (N-1)/10 for `Math.floor(r * 10) + 1 === N`.
 */
function mockDice(...values: number[]): void {
	const returns = values.map((v) => (v - 1) / 10);
	let i = 0;
	vi.spyOn(Math, "random").mockImplementation(() => {
		if (i >= returns.length) {
			throw new Error(
				`Math.random called more times than expected (call #${i + 1}, only ${returns.length} values)`,
			);
		}
		return returns[i++];
	});
}

// ---------------------------------------------------------------------------
// parseNotation
// ---------------------------------------------------------------------------

describe("parseNotation", () => {
	describe("valid formats", () => {
		it("parses simple XkY", () => {
			expect(parseNotation("5k3")).toEqual({ num: 5, keep: 3, modifier: 0 });
		});

		it("parses XkY+N", () => {
			expect(parseNotation("4k2+3")).toEqual({ num: 4, keep: 2, modifier: 3 });
		});

		it("parses XkY-N", () => {
			expect(parseNotation("6k4-2")).toEqual({ num: 6, keep: 4, modifier: -2 });
		});

		it("handles whitespace around modifier", () => {
			expect(parseNotation("3k2 + 5")).toEqual({ num: 3, keep: 2, modifier: 5 });
			expect(parseNotation("3k2 - 5")).toEqual({ num: 3, keep: 2, modifier: -5 });
		});

		it("handles leading/trailing whitespace", () => {
			expect(parseNotation("  5k3+1  ")).toEqual({ num: 5, keep: 3, modifier: 1 });
		});

		it("is case-insensitive", () => {
			expect(parseNotation("5K3")).toEqual({ num: 5, keep: 3, modifier: 0 });
			expect(parseNotation("5K3+2")).toEqual({ num: 5, keep: 3, modifier: 2 });
		});

		it("parses large numbers", () => {
			expect(parseNotation("20k10+15")).toEqual({ num: 20, keep: 10, modifier: 15 });
		});

		it("parses 1k1", () => {
			expect(parseNotation("1k1")).toEqual({ num: 1, keep: 1, modifier: 0 });
		});

		it("parses modifier +0 and -0", () => {
			expect(parseNotation("3k2+0")).toEqual({ num: 3, keep: 2, modifier: 0 });
			expect(parseNotation("3k2-0")).toEqual({ num: 3, keep: 2, modifier: -0 });
		});
	});

	describe("invalid inputs", () => {
		it("returns null for empty string", () => {
			expect(parseNotation("")).toBeNull();
		});

		it("returns null for null/undefined", () => {
			expect(parseNotation(null)).toBeNull();
			expect(parseNotation(undefined)).toBeNull();
		});

		it("returns null for non-string types", () => {
			expect(parseNotation(42)).toBeNull();
			expect(parseNotation(true)).toBeNull();
			expect(parseNotation({})).toBeNull();
		});

		it("returns null for missing k separator", () => {
			expect(parseNotation("5d3")).toBeNull();
		});

		it("returns null for incomplete notation", () => {
			expect(parseNotation("5k")).toBeNull();
			expect(parseNotation("k3")).toBeNull();
		});

		it("returns null for garbage strings", () => {
			expect(parseNotation("hello")).toBeNull();
			expect(parseNotation("roll dice")).toBeNull();
		});

		it("returns null for decimal numbers", () => {
			expect(parseNotation("5.5k3")).toBeNull();
		});

		it("returns null for negative base numbers", () => {
			expect(parseNotation("-5k3")).toBeNull();
		});

		it("returns null for notation with trailing text", () => {
			expect(parseNotation("5k3+2 extra")).toBeNull();
		});
	});
});

// ---------------------------------------------------------------------------
// calculateOutcome
// ---------------------------------------------------------------------------

describe("calculateOutcome", () => {
	describe("success cases", () => {
		it("succeeds when total equals TN exactly", () => {
			const result = calculateOutcome(15, 15);
			expect(result).toEqual({ success: true, raises: 0, checks: 0 });
		});

		it("succeeds when total exceeds TN", () => {
			const result = calculateOutcome(20, 15);
			expect(result).toEqual({ success: true, raises: 1, checks: 0 });
		});

		it("counts multiple raises", () => {
			const result = calculateOutcome(30, 15);
			expect(result).toEqual({ success: true, raises: 3, checks: 0 });
		});

		it("floors raises (partial 5s do not count)", () => {
			const result = calculateOutcome(18, 15);
			expect(result).toEqual({ success: true, raises: 0, checks: 0 });
		});

		it("handles exact raise boundary (diff = 5)", () => {
			const result = calculateOutcome(20, 15);
			expect(result).toEqual({ success: true, raises: 1, checks: 0 });
		});

		it("handles TN 0", () => {
			const result = calculateOutcome(5, 0);
			expect(result).toEqual({ success: true, raises: 1, checks: 0 });
		});

		it("handles total and TN both 0", () => {
			const result = calculateOutcome(0, 0);
			expect(result).toEqual({ success: true, raises: 0, checks: 0 });
		});
	});

	describe("failure cases", () => {
		it("fails when total is below TN", () => {
			const result = calculateOutcome(10, 15);
			expect(result).toEqual({ success: false, raises: 0, checks: 1 });
		});

		it("counts multiple checks", () => {
			const result = calculateOutcome(5, 20);
			expect(result).toEqual({ success: false, raises: 0, checks: 3 });
		});

		it("floors checks (partial 5s do not count)", () => {
			const result = calculateOutcome(13, 15);
			expect(result).toEqual({ success: false, raises: 0, checks: 0 });
		});

		it("handles large failure margin", () => {
			const result = calculateOutcome(0, 25);
			expect(result).toEqual({ success: false, raises: 0, checks: 5 });
		});

		it("fails by exactly 5", () => {
			const result = calculateOutcome(10, 15);
			expect(result).toEqual({ success: false, raises: 0, checks: 1 });
		});

		it("fails by exactly 1", () => {
			const result = calculateOutcome(14, 15);
			expect(result).toEqual({ success: false, raises: 0, checks: 0 });
		});
	});
});

// ---------------------------------------------------------------------------
// roll — basic rolling
// ---------------------------------------------------------------------------

describe("roll", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("basic rolling", () => {
		it("rolls XkY and keeps highest Y dice", () => {
			// 3k2: roll three dice [5, 3, 7], keep top 2 → 7 + 5 = 12
			mockDice(5, 3, 7);
			const result = roll(3, 2);

			expect(result.allRolls).toHaveLength(3);
			expect(result.keptRolls).toHaveLength(2);
			expect(result.droppedRolls).toHaveLength(1);
			expect(result.keptRolls[0].value).toBe(7);
			expect(result.keptRolls[1].value).toBe(5);
			expect(result.droppedRolls[0].value).toBe(3);
			expect(result.diceTotal).toBe(12);
			expect(result.modifier).toBe(0);
			expect(result.total).toBe(12);
			expect(result.overflow).toBeNull();
		});

		it("rolls 1k1 — single die", () => {
			mockDice(6);
			const result = roll(1, 1);

			expect(result.allRolls).toHaveLength(1);
			expect(result.keptRolls).toHaveLength(1);
			expect(result.droppedRolls).toHaveLength(0);
			expect(result.total).toBe(6);
		});

		it("keeps all dice when keepDice equals numDice", () => {
			mockDice(4, 8, 2);
			const result = roll(3, 3);

			expect(result.keptRolls).toHaveLength(3);
			expect(result.droppedRolls).toHaveLength(0);
			expect(result.diceTotal).toBe(14);
		});
	});

	describe("exploding dice", () => {
		it("explodes on a 10 and adds continuation roll", () => {
			// 1k1: roll a 10 (explodes), then a 5 → value = 15
			mockDice(10, 5);
			const result = roll(1, 1);

			expect(result.allRolls).toHaveLength(1);
			expect(result.allRolls[0].value).toBe(15);
			expect(result.allRolls[0].base).toBe(10);
			expect(result.allRolls[0].exploded).toBe(true);
			expect(result.total).toBe(15);
		});

		it("explodes multiple times on consecutive 10s", () => {
			// 1k1: roll 10, 10, 3 → value = 23
			mockDice(10, 10, 3);
			const result = roll(1, 1);

			expect(result.allRolls[0].value).toBe(23);
			expect(result.allRolls[0].base).toBe(10);
			expect(result.allRolls[0].exploded).toBe(true);
			expect(result.total).toBe(23);
		});

		it("non-10 rolls do not explode", () => {
			mockDice(9);
			const result = roll(1, 1);

			expect(result.allRolls[0].value).toBe(9);
			expect(result.allRolls[0].exploded).toBe(false);
		});

		it("exploding die is kept over non-exploding when sorting", () => {
			// 2k1: first die rolls 10+5=15, second die rolls 4
			// Keep highest → 15
			mockDice(10, 5, 4);
			const result = roll(2, 1);

			expect(result.keptRolls).toHaveLength(1);
			expect(result.keptRolls[0].value).toBe(15);
			expect(result.droppedRolls[0].value).toBe(4);
			expect(result.total).toBe(15);
		});
	});

	describe("modifier application", () => {
		it("adds positive modifier to total", () => {
			mockDice(5);
			const result = roll(1, 1, 3);

			expect(result.diceTotal).toBe(5);
			expect(result.modifier).toBe(3);
			expect(result.total).toBe(8);
		});

		it("subtracts negative modifier from total", () => {
			mockDice(8);
			const result = roll(1, 1, -2);

			expect(result.diceTotal).toBe(8);
			expect(result.modifier).toBe(-2);
			expect(result.total).toBe(6);
		});

		it("allows total to go below zero with negative modifier", () => {
			mockDice(1);
			const result = roll(1, 1, -5);

			expect(result.total).toBe(-4);
		});

		it("handles zero modifier", () => {
			mockDice(7);
			const result = roll(1, 1, 0);

			expect(result.total).toBe(7);
			expect(result.modifier).toBe(0);
		});
	});

	describe("rank-0 mode", () => {
		it("activates when keepDice is 0", () => {
			// Rank-0: roll one d10, 10→0, no explosion
			mockDice(5);
			const result = roll(5, 0);

			expect(result.allRolls).toHaveLength(1);
			expect(result.keptRolls).toHaveLength(1);
			expect(result.droppedRolls).toHaveLength(0);
			expect(result.total).toBe(5);
			expect(result.overflow).toBeNull();
		});

		it("activates with rankZero option", () => {
			mockDice(7);
			const result = roll(5, 3, 0, { rankZero: true });

			expect(result.allRolls).toHaveLength(1);
			expect(result.keptRolls).toHaveLength(1);
			expect(result.total).toBe(7);
		});

		it("converts 10 to 0 in rank-0 mode", () => {
			mockDice(10);
			const result = roll(1, 0);

			expect(result.allRolls[0].value).toBe(0);
			expect(result.allRolls[0].base).toBe(10);
			expect(result.allRolls[0].exploded).toBe(false);
			expect(result.total).toBe(0);
		});

		it("does not explode in rank-0 mode", () => {
			// If 10 exploded, it would need another random call. We only provide one.
			mockDice(10);
			const result = roll(3, 0);

			expect(result.allRolls).toHaveLength(1);
			expect(result.allRolls[0].exploded).toBe(false);
		});

		it("applies modifier in rank-0 mode", () => {
			mockDice(5);
			const result = roll(3, 0, 2);

			expect(result.diceTotal).toBe(5);
			expect(result.modifier).toBe(2);
			expect(result.total).toBe(7);
		});

		it("rank-0 with 10 and modifier sums correctly", () => {
			mockDice(10);
			const result = roll(1, 0, 3);

			// value = 0 (10→0), modifier = 3, total = 3
			expect(result.total).toBe(3);
		});
	});

	describe("keep-highest sorting", () => {
		it("sorts descending and keeps the top dice", () => {
			// 4k2: roll [1, 9, 3, 6], keep top 2 → 9 + 6 = 15
			mockDice(1, 9, 3, 6);
			const result = roll(4, 2);

			expect(result.keptRolls.map((d) => d.value)).toEqual([9, 6]);
			expect(result.droppedRolls.map((d) => d.value)).toEqual([3, 1]);
			expect(result.diceTotal).toBe(15);
		});

		it("handles ties in dice values", () => {
			// 3k1: roll [5, 5, 5], keep 1 → 5
			mockDice(5, 5, 5);
			const result = roll(3, 1);

			expect(result.keptRolls).toHaveLength(1);
			expect(result.keptRolls[0].value).toBe(5);
			expect(result.diceTotal).toBe(5);
		});
	});

	describe("input clamping", () => {
		it("clamps keepDice to numDice when keep exceeds rolled", () => {
			// roll(2, 5): keepDice clamped to 2
			mockDice(4, 7);
			const result = roll(2, 5);

			expect(result.keptRolls).toHaveLength(2);
			expect(result.droppedRolls).toHaveLength(0);
			expect(result.diceTotal).toBe(11);
		});

		it("clamps numDice to minimum 1", () => {
			// roll(0, 0) → rank-0 mode because keepDice === 0
			mockDice(5);
			const result = roll(0, 0);

			expect(result.allRolls).toHaveLength(1);
		});
	});

	describe("overflow compression (indirect _compressOverflow)", () => {
		it("compresses >10 rolled dice: every 2 excess → +1 kept", () => {
			// 12k5+0: excess rolled = 2, extraKept = 1, becomes 10k6+0
			mockDice(8, 7, 6, 5, 4, 3, 2, 1, 9, 3);
			const result = roll(12, 5);

			expect(result.allRolls).toHaveLength(10); // rolled 10, not 12
			expect(result.keptRolls).toHaveLength(6); // 5 + 1 = 6
			expect(result.overflow).not.toBeNull();
			expect(result.overflow!.compressed).toBe(true);
			expect(result.overflow!.numDice).toBe(10);
			expect(result.overflow!.keepDice).toBe(6);
			expect(result.overflow!.modifier).toBe(0);
		});

		it("clamps excess kept from rolled-compression to numDice (10)", () => {
			// 20k9+0: excess rolled = 10, extraKept = 5, keepDice = 14, numDice = 10
			// keepDice 14 > numDice 10 → clamped to 10 (before >10 check)
			// keepDice 10 is NOT >10, so no +5 modifier
			// Final: 10k10+0
			mockDice(8, 7, 6, 5, 4, 3, 2, 1, 9, 3);
			const result = roll(20, 9);

			expect(result.allRolls).toHaveLength(10);
			expect(result.keptRolls).toHaveLength(10);
			expect(result.overflow).not.toBeNull();
			expect(result.overflow!.compressed).toBe(true);
			expect(result.overflow!.numDice).toBe(10);
			expect(result.overflow!.keepDice).toBe(10);
			expect(result.overflow!.modifier).toBe(0);
			// Total = sum of all 10 dice, no extra modifier
			const expectedDiceTotal = 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1 + 9 + 3;
			expect(result.diceTotal).toBe(expectedDiceTotal);
			expect(result.total).toBe(expectedDiceTotal);
		});

		it("clamps keepDice to numDice when rolled-compression brings them close", () => {
			// 14k9+0: excess rolled = 4, extraKept = 2, keepDice = 11, numDice = 10
			// keepDice 11 > numDice 10 → clamped to 10
			// keepDice 10 NOT >10, no modifier addition
			// Final: 10k10+0
			mockDice(8, 7, 6, 5, 4, 3, 2, 1, 9, 3);
			const result = roll(14, 9);

			expect(result.allRolls).toHaveLength(10);
			expect(result.keptRolls).toHaveLength(10);
			expect(result.overflow).not.toBeNull();
			expect(result.overflow!.compressed).toBe(true);
			expect(result.overflow!.numDice).toBe(10);
			expect(result.overflow!.keepDice).toBe(10);
			expect(result.overflow!.modifier).toBe(0);
			expect(result.modifier).toBe(0);
		});

		it("preserves existing modifier through compression", () => {
			// 12k5+3: excess rolled = 2, extraKept = 1, becomes 10k6+3
			mockDice(8, 7, 6, 5, 4, 3, 2, 1, 9, 3);
			const result = roll(12, 5, 3);

			expect(result.overflow).not.toBeNull();
			expect(result.overflow!.modifier).toBe(3);
			expect(result.modifier).toBe(3);
		});

		it("no compression for 10 or fewer dice", () => {
			mockDice(5, 3, 7, 2, 8);
			const result = roll(5, 3);

			expect(result.overflow).toBeNull();
			expect(result.allRolls).toHaveLength(5);
			expect(result.keptRolls).toHaveLength(3);
		});

		it("odd excess rolled dice floors extra kept", () => {
			// 13k5+0: excess rolled = 3, extraKept = floor(3/2) = 1, becomes 10k6+0
			mockDice(4, 6, 8, 2, 1, 3, 9, 7, 5, 1);
			const result = roll(13, 5);

			expect(result.overflow).not.toBeNull();
			expect(result.overflow!.keepDice).toBe(6); // 5 + 1 = 6
			expect(result.overflow!.numDice).toBe(10);
		});

		it("preserves input modifier through rolled+clamped compression", () => {
			// 20k9+10: excess rolled = 10, extraKept = 5, keepDice = 14, numDice = 10
			// keepDice 14 > numDice 10 → clamped to 10
			// keepDice 10 NOT >10, no +5 addition — only original modifier preserved
			// Final: 10k10+10
			mockDice(5, 5, 5, 5, 5, 5, 5, 5, 5, 5);
			const result = roll(20, 9, 10);

			expect(result.overflow!.modifier).toBe(10);
			expect(result.modifier).toBe(10);
			expect(result.total).toBe(50 + 10); // 10 dice of 5 + 10
		});
	});

	describe("result structure", () => {
		it("returns correct DiceResult shape", () => {
			mockDice(5);
			const result = roll(1, 1);

			expect(result).toHaveProperty("allRolls");
			expect(result).toHaveProperty("keptRolls");
			expect(result).toHaveProperty("droppedRolls");
			expect(result).toHaveProperty("diceTotal");
			expect(result).toHaveProperty("modifier");
			expect(result).toHaveProperty("total");
			expect(result).toHaveProperty("overflow");
			expect(Array.isArray(result.allRolls)).toBe(true);
			expect(Array.isArray(result.keptRolls)).toBe(true);
			expect(Array.isArray(result.droppedRolls)).toBe(true);
		});

		it("die rolls have correct DieRoll shape", () => {
			mockDice(5);
			const result = roll(1, 1);
			const die = result.allRolls[0];

			expect(die).toHaveProperty("value");
			expect(die).toHaveProperty("base");
			expect(die).toHaveProperty("exploded");
			expect(typeof die.value).toBe("number");
			expect(typeof die.base).toBe("number");
			expect(typeof die.exploded).toBe("boolean");
		});

		it("total equals diceTotal + modifier", () => {
			mockDice(6, 4, 8);
			const result = roll(3, 2, 5);

			expect(result.total).toBe(result.diceTotal + result.modifier);
		});

		it("keptRolls + droppedRolls length equals allRolls length", () => {
			mockDice(3, 7, 1, 9, 5);
			const result = roll(5, 3);

			expect(result.keptRolls.length + result.droppedRolls.length).toBe(result.allRolls.length);
		});
	});
});
