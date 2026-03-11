import { describe, expect, it } from "bun:test";
import {
	extractBoldField,
	extractBoldFieldFullLine,
	extractPipeTable,
	extractSections,
	pad,
	parseClasses,
	parseFeats,
	parseRaces,
} from "../sync-check.ts";

// ---------------------------------------------------------------------------
// extractSections
// ---------------------------------------------------------------------------

describe("extractSections", () => {
	it("splits markdown into sections at the given heading level", () => {
		const md = "# Title\n\n## Section One\n\nContent A\n\n## Section Two\n\nContent B";
		const sections = extractSections(md, 2);
		expect(sections).toHaveLength(2);
		expect(sections[0].heading).toBe("Section One");
		expect(sections[1].heading).toBe("Section Two");
		expect(sections[0].content).toContain("Content A");
	});
});

// ---------------------------------------------------------------------------
// extractBoldField
// ---------------------------------------------------------------------------

describe("extractBoldField", () => {
	it("extracts a field value before a pipe separator", () => {
		const content = "**Size:** 5 | **Languages:** Trade, High Gothic";
		expect(extractBoldField(content, "Size")).toBe("5");
	});

	it("extracts the last field on the line", () => {
		const content = "**Size:** 5 | **Languages:** Trade, High Gothic";
		expect(extractBoldField(content, "Languages")).toBe("Trade, High Gothic");
	});

	it("returns null for a missing field", () => {
		const content = "**Size:** 5 | **Languages:** Trade, High Gothic";
		expect(extractBoldField(content, "Missing")).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// extractBoldFieldFullLine
// ---------------------------------------------------------------------------

describe("extractBoldFieldFullLine", () => {
	it("extracts the full line value after a bold field", () => {
		const content = "**Level:** 3\n**Skills:** Athletics, Acrobatics, Stealth";
		expect(extractBoldFieldFullLine(content, "Level")).toBe("3");
		expect(extractBoldFieldFullLine(content, "Skills")).toBe("Athletics, Acrobatics, Stealth");
	});
});

// ---------------------------------------------------------------------------
// extractPipeTable
// ---------------------------------------------------------------------------

describe("extractPipeTable", () => {
	it("parses a markdown pipe table into row objects", () => {
		const table = "| Name | Level |\n| --- | --- |\n| Fighter | 1 |\n| Wizard | 2 |";
		const rows = extractPipeTable(table);
		expect(rows).toHaveLength(2);
		expect(rows[0]).toEqual({ Name: "Fighter", Level: "1" });
		expect(rows[1]).toEqual({ Name: "Wizard", Level: "2" });
	});
});

// ---------------------------------------------------------------------------
// parseRaces
// ---------------------------------------------------------------------------

describe("parseRaces", () => {
	it("parses a synthetic race entry from markdown", () => {
		const md = [
			"## Human",
			"",
			"**Size:** 4 | **Languages:** Trade, Low Gothic",
			"",
			"**Characteristic Modifiers:** +1 to any two",
			"",
			"**Skill Bonus:** +1 to any two skills",
			"",
			"**Racial Power:** Adaptable — Humans gain an extra feat at character creation.",
		].join("\n");

		const races = parseRaces(md);
		expect(races).toHaveLength(1);
		expect(races[0].name).toBe("Human");
		expect(races[0].size).toBe(4);
		expect(races[0].languages).toContain("Trade");
		expect(races[0].languages).toContain("Low Gothic");
	});
});

// ---------------------------------------------------------------------------
// parseClasses
// ---------------------------------------------------------------------------

describe("parseClasses", () => {
	it("parses a synthetic class entry from markdown", () => {
		const md = [
			"## Fighter",
			"",
			"**Level:** 1",
			"",
			"**Prerequisites:** None",
			"",
			"**Characteristics:** Strength, Constitution",
			"",
			"**Skills:** Athletics, Weaponry",
			"",
			"| Rank | Feat | Type |",
			"| --- | --- | --- |",
			"| 1 | Power Attack | Combat |",
			"",
			"**Completion Bonus:** +1 HP",
		].join("\n");

		const classes = parseClasses(md);
		expect(classes).toHaveLength(1);
		expect(classes[0].name).toBe("Fighter");
		expect(classes[0].level).toBe(1);
		expect(classes[0].skills).toContain("Athletics");
		expect(classes[0].skills).toContain("Weaponry");
	});
});

// ---------------------------------------------------------------------------
// parseFeats
// ---------------------------------------------------------------------------

describe("parseFeats", () => {
	it("parses synthetic feat entries from markdown", () => {
		const md = [
			"## General Feats",
			"",
			"**Power Attack**",
			"You can trade accuracy for damage.",
			"",
			"**Quick Draw\\***",
			"You can draw weapons as a free action.",
			"_Prerequisites: Dexterity 3_",
		].join("\n");

		const feats = parseFeats(md);
		expect(feats).toHaveLength(2);
		expect(feats[0].name).toBe("Power Attack");
		expect(feats[0].category).toBe("general");
		expect(feats[1].name).toBe("Quick Draw");
		expect(feats[1].multipleAllowed).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// pad
// ---------------------------------------------------------------------------

describe("pad", () => {
	it("right-pads a short string to the given width", () => {
		expect(pad("abc", 6)).toBe("abc   ");
	});

	it("does not truncate a string longer than width", () => {
		expect(pad("abcdef", 3)).toBe("abcdef");
	});
});
