import { describe, expect, it } from "vitest";
import { countRecords, crossReferenceCheck, validateAll } from "../validate.ts";

// ---------------------------------------------------------------------------
// countRecords
// ---------------------------------------------------------------------------

describe("countRecords", () => {
	it("returns array length for a bare array", () => {
		expect(countRecords([1, 2, 3])).toBe(3);
	});

	it("returns array length for an object with a known list field", () => {
		expect(countRecords({ races: [{}, {}, {}] })).toBe(3);
	});

	it("returns total count for nested skills structure", () => {
		const data = {
			skills: {
				Common: [{}, {}],
				Lore: [{}],
			},
		};
		expect(countRecords(data)).toBe(3);
	});

	it("returns 0 for an empty object", () => {
		expect(countRecords({})).toBe(0);
	});

	it("returns 0 for a non-object value", () => {
		expect(countRecords("hello")).toBe(0);
		expect(countRecords(42)).toBe(0);
		expect(countRecords(null)).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// validateAll (integration — requires real data files)
// ---------------------------------------------------------------------------

describe("validateAll", () => {
	it("returns 12 results", () => {
		const results = validateAll();
		expect(results).toHaveLength(12);
	});

	it("all results have ok: true", () => {
		const results = validateAll();
		for (const r of results) {
			expect(r.ok, `${r.file} should pass validation: ${r.errors.join(", ")}`).toBe(true);
		}
	});
});

// ---------------------------------------------------------------------------
// crossReferenceCheck (integration — requires real data files)
// ---------------------------------------------------------------------------

describe("crossReferenceCheck", () => {
	it("returns an array of strings", () => {
		const issues = crossReferenceCheck();
		expect(Array.isArray(issues)).toBe(true);
		for (const issue of issues) {
			expect(typeof issue).toBe("string");
		}
	});

	it("each issue string references a .json file", () => {
		const issues = crossReferenceCheck();
		for (const issue of issues) {
			expect(issue).toMatch(/\.json/);
		}
	});
});
