/**
 * Reusable Math.random mock for deterministic dice-roll testing.
 *
 * Usage:
 *   import { mockDice } from ".../mock-dice";
 *
 *   beforeEach(() => jest.restoreAllMocks());
 *   afterEach(() => jest.restoreAllMocks());
 *
 *   it("rolls 5, 3, 7", () => {
 *     mockDice(5, 3, 7);
 *     const result = roll(3, 2);
 *     // dice values are now deterministic
 *   });
 */

import { spyOn } from "bun:test";

/**
 * Mock Math.random to yield predetermined die values (1–10).
 * Each value N maps to `(N-1)/10` so that `Math.floor(r * 10) + 1 === N`.
 * Throws if Math.random is called more times than values provided.
 */
export function mockDice(...values: number[]): void {
	const returns = values.map((v) => (v - 1) / 10);
	let i = 0;
	spyOn(Math, "random").mockImplementation(() => {
		if (i >= returns.length) {
			throw new Error(
				`Math.random called more times than expected (call #${i + 1}, only ${returns.length} values)`,
			);
		}
		return returns[i++];
	});
}
