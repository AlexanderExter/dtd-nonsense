import { describe, expect, it } from "bun:test";
import {
	computeStyleCost,
	getAllAvailableTechniques,
	getAvailableActions,
	getAvailableWeapons,
	MELEE_SCHOOLS,
	RANGED_SCHOOLS,
	type SchoolDefinition,
	type SchoolTechnique,
	UNIVERSAL_ADVANTAGES,
	UNIVERSAL_RESTRICTIONS,
} from "./attacks-data";

// ---------------------------------------------------------------------------
// Data integrity
// ---------------------------------------------------------------------------
describe("attacks-data exports", () => {
	it("exports non-empty MELEE_SCHOOLS array", () => {
		expect(MELEE_SCHOOLS.length).toBeGreaterThan(0);
		for (const school of MELEE_SCHOOLS) {
			expect(school.attackType).toBe("melee");
			expect(school.techniques.length).toBeGreaterThan(0);
		}
	});

	it("exports non-empty RANGED_SCHOOLS array", () => {
		expect(RANGED_SCHOOLS.length).toBeGreaterThan(0);
		for (const school of RANGED_SCHOOLS) {
			expect(school.attackType).toBe("ranged");
			expect(school.techniques.length).toBeGreaterThan(0);
		}
	});

	it("exports universal advantages", () => {
		expect(UNIVERSAL_ADVANTAGES.length).toBeGreaterThan(0);
		for (const adv of UNIVERSAL_ADVANTAGES) {
			expect(adv.name).toBeTruthy();
			expect(typeof adv.cost).toBe("number");
		}
	});

	it("exports universal restrictions", () => {
		expect(UNIVERSAL_RESTRICTIONS.length).toBeGreaterThan(0);
		for (const r of UNIVERSAL_RESTRICTIONS) {
			expect(r.name).toBeTruthy();
			expect(typeof r.cost).toBe("number");
		}
	});
});

// ---------------------------------------------------------------------------
// computeStyleCost
// ---------------------------------------------------------------------------
describe("computeStyleCost", () => {
	it("returns 0 for empty array", () => {
		expect(computeStyleCost([])).toBe(0);
	});

	it("sums technique costs", () => {
		const techs: SchoolTechnique[] = [
			{ name: "A", cost: 2, rank: 1, effect: "", type: "advantage" },
			{ name: "B", cost: 3, rank: 1, effect: "", type: "restriction" },
		];
		expect(computeStyleCost(techs)).toBe(5);
	});

	it("handles negative costs (restrictions)", () => {
		const techs: SchoolTechnique[] = [
			{ name: "A", cost: 3, rank: 1, effect: "", type: "advantage" },
			{ name: "B", cost: -2, rank: 1, effect: "", type: "restriction" },
		];
		expect(computeStyleCost(techs)).toBe(1);
	});
});

// ---------------------------------------------------------------------------
// getAvailableWeapons
// ---------------------------------------------------------------------------
describe("getAvailableWeapons", () => {
	const schools: SchoolDefinition[] = [
		{ id: "school1", name: "Fire", attackType: "melee", keySkill: "Weaponry", weaponType: "Sword", techniques: [] },
		{ id: "school2", name: "Ice", attackType: "melee", keySkill: "Weaponry", weaponType: "Axe", techniques: [] },
		{ id: "school3", name: "Wind", attackType: "melee", keySkill: "Weaponry", weaponType: "Sword", techniques: [] },
	];

	it("returns empty array when no ranks", () => {
		expect(getAvailableWeapons(schools, {})).toEqual([]);
	});

	it("returns weapons for schools with ranks > 0", () => {
		const result = getAvailableWeapons(schools, { school1: 1, school2: 2 });
		expect(result).toContain("Sword");
		expect(result).toContain("Axe");
	});

	it("deduplicates weapon types", () => {
		const result = getAvailableWeapons(schools, { school1: 1, school3: 1 });
		expect(result.filter((w) => w === "Sword").length).toBe(1);
	});

	it("ignores schools with rank 0", () => {
		const result = getAvailableWeapons(schools, { school1: 0, school2: 1 });
		expect(result).not.toContain("Sword");
		expect(result).toContain("Axe");
	});
});

// ---------------------------------------------------------------------------
// getAvailableActions
// ---------------------------------------------------------------------------
describe("getAvailableActions", () => {
	const schools: SchoolDefinition[] = [
		{
			id: "school1",
			name: "Fire",
			attackType: "melee",
			keySkill: "Weaponry",
			weaponType: "Sword",
			techniques: [
				{ name: "Action (Standard Attack)", cost: 0, rank: 1, effect: "", type: "base" },
				{ name: "Bonus", cost: 2, rank: 1, effect: "", type: "advantage" },
			],
		},
		{
			id: "school2",
			name: "Ice",
			attackType: "melee",
			keySkill: "Weaponry",
			weaponType: "Axe",
			techniques: [{ name: "Action (All-Out Attack)", cost: 0, rank: 1, effect: "", type: "base" }],
		},
	];

	it("returns empty array when no ranks", () => {
		expect(getAvailableActions(schools, {})).toEqual([]);
	});

	it("extracts action names from parentheses", () => {
		const result = getAvailableActions(schools, { school1: 1, school2: 1 });
		expect(result).toContain("Standard Attack");
		expect(result).toContain("All-Out Attack");
	});

	it("ignores non-base or non-Action techniques", () => {
		const result = getAvailableActions(schools, { school1: 1 });
		expect(result.length).toBe(1);
		expect(result[0]).toBe("Standard Attack");
	});
});

// ---------------------------------------------------------------------------
// getAllAvailableTechniques
// ---------------------------------------------------------------------------
describe("getAllAvailableTechniques", () => {
	const schools: SchoolDefinition[] = [
		{
			id: "school1",
			name: "Fire School",
			attackType: "melee",
			keySkill: "Weaponry",
			weaponType: "Sword",
			techniques: [
				{ name: "Base Action", cost: 0, rank: 1, effect: "", type: "base" },
				{ name: "Rank 1 Boost", cost: 2, rank: 1, effect: "Boost", type: "advantage" },
				{ name: "Rank 2 Boost", cost: 3, rank: 2, effect: "Bigger boost", type: "advantage" },
				{ name: "Rank 3 Boost", cost: 4, rank: 3, effect: "Huge boost", type: "advantage" },
			],
		},
	];

	it("returns empty array when no ranks", () => {
		expect(getAllAvailableTechniques(schools, {})).toEqual([]);
	});

	it("returns non-base techniques up to the character rank", () => {
		const result = getAllAvailableTechniques(schools, { school1: 2 });
		expect(result.length).toBe(2);
		expect(result[0].name).toBe("Rank 1 Boost");
		expect(result[1].name).toBe("Rank 2 Boost");
	});

	it("excludes base type techniques", () => {
		const result = getAllAvailableTechniques(schools, { school1: 3 });
		expect(result.every((t) => t.type !== "base")).toBe(true);
	});

	it("includes schoolName on returned techniques", () => {
		const result = getAllAvailableTechniques(schools, { school1: 1 });
		expect(result[0].schoolName).toBe("Fire School");
	});
});
