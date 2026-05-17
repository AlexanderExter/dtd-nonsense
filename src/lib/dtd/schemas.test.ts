/**
 * Zod schema validation tests.
 *
 * Loads every JSON file from data/ and validates against its Zod schema.
 * This is the primary correctness check for the Pydantic → Zod port.
 */

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ClassesFile } from "./schemas/classes.ts";
import { EquipmentFile } from "./schemas/equipment.ts";
import { FILE_SCHEMAS } from "./schemas/index.ts";
import { RacesFile } from "./schemas/races.ts";

const DATA_DIR = resolve(import.meta.dirname, "../../../data");

describe("Zod schema validation — all 15 JSON files", () => {
	for (const [filename, { schema }] of Object.entries(FILE_SCHEMAS)) {
		it(`validates ${filename}`, () => {
			const filePath = resolve(DATA_DIR, filename);
			const raw = readFileSync(filePath, "utf-8");
			const data = JSON.parse(raw);
			const result = schema.safeParse(data);

			if (!result.success) {
				// Format errors for readable test output
				const errors = result.error.issues.map(
					(issue) => `  ${issue.path.join(".")} — ${issue.message} (${issue.code})`,
				);
				expect.fail(`${filename} failed validation:\n${errors.join("\n")}`);
			}

			expect(result.success).toBe(true);
		});
	}
});

describe("Zod schema rejection — malformed data", () => {
	it("rejects a race with invalid size", () => {
		const badData = {
			races: [
				{
					id: "test",
					name: "Test",
					size: 99,
					languages: [],
					charBonus: { options: [], description: "" },
					skillBonus: [],
					power: { name: "test", description: "test" },
					source: "book1",
				},
			],
		};
		const result = RacesFile.safeParse(badData);
		expect(result.success).toBe(false);
	});

	it("rejects a class with invalid level", () => {
		const badData = {
			metadata: {
				description: "",
				version: "",
				levelsComplete: [],
				levelsPending: [],
			},
			tracks: {},
			classes: [
				{
					id: "test",
					name: "Test",
					level: 10,
					track: null,
					prerequisites: "",
					characteristics: [],
					skills: [],
					feats: [],
					swordSchools: [],
					magicSchools: [],
					gunKata: [],
					completionBonus: "",
					suggestedExits: [],
				},
			],
		};
		const result = ClassesFile.safeParse(badData);
		expect(result.success).toBe(false);
	});

	it("rejects unknown extra fields in strict schemas", () => {
		const badData = {
			packages: [
				{
					id: "test",
					name: "Test",
					description: "test",
					items: [],
					UNKNOWN_FIELD: true,
				},
			],
		};
		const result = EquipmentFile.safeParse(badData);
		expect(result.success).toBe(false);
	});
});
