import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { character, derived, loadAllData, loadData } from "./core.ts";

// ---------------------------------------------------------------------------
// derived stat calculators
// ---------------------------------------------------------------------------
describe("derived", () => {
	describe("calculateSD", () => {
		it("returns 10 + (Dex + Wis) × 3 − Size × 2 for non-halflings", () => {
			// dex=3, wis=2, size=4 → 10 + (3+2)*3 − 4*2 = 10+15−8 = 17
			expect(derived.calculateSD(3, 2, 4)).toBe(17);
		});

		it("returns 10 + Dex × 6 − Size × 2 for halflings", () => {
			// dex=3, wis=2, size=3 → 10 + 3*6 − 3*2 = 10+18−6 = 22
			expect(derived.calculateSD(3, 2, 3, true)).toBe(22);
		});

		it("handles zero values", () => {
			expect(derived.calculateSD(0, 0, 0)).toBe(10);
			expect(derived.calculateSD(0, 0, 0, true)).toBe(10);
		});

		it("handles high stat values", () => {
			// dex=5, wis=5, size=6 → 10 + (5+5)*3 − 6*2 = 10+30−12 = 28
			expect(derived.calculateSD(5, 5, 6)).toBe(28);
		});
	});

	describe("calculateHP", () => {
		it("returns (Con + Wil) × 2", () => {
			// con=3, wil=4 → (3+4)*2 = 14
			expect(derived.calculateHP(3, 4)).toBe(14);
		});

		it("handles minimum values", () => {
			expect(derived.calculateHP(1, 1)).toBe(4);
		});

		it("handles zero values", () => {
			expect(derived.calculateHP(0, 0)).toBe(0);
		});
	});

	describe("calculateMentalDefense", () => {
		it("returns 5 + Composure × 5", () => {
			// composure=3 → 5 + 3*5 = 20
			expect(derived.calculateMentalDefense(3)).toBe(20);
		});

		it("handles zero composure", () => {
			expect(derived.calculateMentalDefense(0)).toBe(5);
		});
	});

	describe("calculateResolve", () => {
		it("returns Willpower + Composure", () => {
			expect(derived.calculateResolve(3, 4)).toBe(7);
		});

		it("handles zero values", () => {
			expect(derived.calculateResolve(0, 0)).toBe(0);
		});
	});

	describe("calculateInitiativeBase", () => {
		it("returns Dex + Composure", () => {
			expect(derived.calculateInitiativeBase(4, 3)).toBe(7);
		});
	});

	describe("calculateSpeed", () => {
		it("returns Strength + Dexterity", () => {
			expect(derived.calculateSpeed(3, 4)).toBe(7);
		});
	});

	describe("calculateResilience", () => {
		it("returns ceil((Size + Level) / 2) + 1", () => {
			// size=4, level=3 → ceil(7/2)+1 = 4+1 = 5
			expect(derived.calculateResilience(4, 3)).toBe(5);
		});

		it("rounds up for odd sums", () => {
			// size=3, level=2 → ceil(5/2)+1 = 3+1 = 4
			expect(derived.calculateResilience(3, 2)).toBe(4);
		});

		it("handles even sums", () => {
			// size=4, level=2 → ceil(6/2)+1 = 3+1 = 4
			expect(derived.calculateResilience(4, 2)).toBe(4);
		});

		it("handles zero values", () => {
			// size=0, level=0 → ceil(0/2)+1 = 0+1 = 1
			expect(derived.calculateResilience(0, 0)).toBe(1);
		});
	});
});

// ---------------------------------------------------------------------------
// character CRUD & persistence (localStorage mocked)
// ---------------------------------------------------------------------------
describe("character", () => {
	let storage: Record<string, string>;

	beforeEach(() => {
		storage = {};
		const mockLocalStorage = {
			getItem: vi.fn((key: string) => storage[key] ?? null),
			setItem: vi.fn((key: string, value: string) => {
				storage[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete storage[key];
			}),
			clear: vi.fn(() => {
				storage = {};
			}),
			get length() {
				return Object.keys(storage).length;
			},
			key: vi.fn((i: number) => Object.keys(storage)[i] ?? null),
		};
		vi.stubGlobal("localStorage", mockLocalStorage);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("createDefault", () => {
		it("returns a deep copy matching DEFAULTS shape", () => {
			vi.spyOn(character, "_genId").mockReturnValue("test123");
			const ch = character.createDefault();
			expect(ch.id).toBe("test123");
			expect(ch.name).toBe("");
			expect(ch.totalXP).toBe(600);
			expect(ch.characteristics.strength).toBe(1);
			expect(ch.characteristics.dexterity).toBe(1);
			expect(ch.feats).toEqual([]);
			expect(ch.modifiers).toEqual({
				staticDefense: 0,
				hitPoints: 0,
				mentalDefense: 0,
				resolve: 0,
				speed: 0,
				resilience: 0,
				initiative: 0,
			});
		});

		it("returns independent copies (no shared references)", () => {
			vi.spyOn(character, "_genId").mockReturnValue("a");
			const a = character.createDefault();
			vi.spyOn(character, "_genId").mockReturnValue("b");
			const b = character.createDefault();
			a.characteristics.strength = 99;
			expect(b.characteristics.strength).toBe(1);
		});
	});

	describe("validate", () => {
		it("returns default for null input", () => {
			vi.spyOn(character, "_genId").mockReturnValue("test123");
			const result = character.validate(null);
			expect(result.id).toBe("test123");
			expect(result.totalXP).toBe(600);
		});

		it("returns default for undefined input", () => {
			vi.spyOn(character, "_genId").mockReturnValue("test123");
			const result = character.validate(undefined);
			expect(result.id).toBe("test123");
		});

		it("returns default for non-object input", () => {
			vi.spyOn(character, "_genId").mockReturnValue("test123");
			const result = character.validate("not an object");
			expect(result.id).toBe("test123");
		});

		it("merges partial object with defaults", () => {
			const partial = { name: "Test Hero", totalXP: 1000 };
			const result = character.validate(partial);
			expect(result.name).toBe("Test Hero");
			expect(result.totalXP).toBe(1000);
			expect(result.characteristics.strength).toBe(1);
			expect(result.feats).toEqual([]);
		});

		it("preserves extra fields not in defaults", () => {
			const input = { name: "Hero", customField: "custom value" };
			const result = character.validate(input);
			expect(result.name).toBe("Hero");
			expect((result as unknown as Record<string, unknown>).customField).toBe("custom value");
		});
	});

	describe("_mergeDefaults", () => {
		it("merges nested objects recursively", () => {
			const obj = { characteristics: { strength: 5 } };
			const defaults = {
				characteristics: { strength: 2, dexterity: 2, constitution: 2 },
			};
			const result = character._mergeDefaults(obj, defaults);
			expect(result.characteristics).toEqual({
				strength: 5,
				dexterity: 2,
				constitution: 2,
			});
		});

		it("replaces arrays entirely (does not merge them)", () => {
			const obj = { feats: [{ name: "Power Attack", notes: "" }] };
			const defaults = { feats: [] as unknown[] };
			const result = character._mergeDefaults(obj, defaults);
			expect(result.feats).toEqual([{ name: "Power Attack", notes: "" }]);
		});

		it("preserves unknown keys from obj not in defaults", () => {
			const obj = { name: "Hero", customThing: 42 };
			const defaults = { name: "" };
			const result = character._mergeDefaults(obj, defaults);
			expect(result.name).toBe("Hero");
			expect(result.customThing).toBe(42);
		});

		it("uses defaults for missing keys", () => {
			const obj = {};
			const defaults = { name: "Default", level: 1 };
			const result = character._mergeDefaults(obj, defaults);
			expect(result.name).toBe("Default");
			expect(result.level).toBe(1);
		});

		it("handles null values in nested objects", () => {
			const obj = { characteristics: null };
			const defaults = {
				characteristics: { strength: 2, dexterity: 2 },
			};
			const result = character._mergeDefaults(obj as unknown as Record<string, unknown>, defaults);
			// null is passed to recursive call as {}, so defaults fill in
			expect(result.characteristics).toEqual({ strength: 2, dexterity: 2 });
		});
	});

	describe("_migrateIfNeeded", () => {
		it("converts race object to string id", () => {
			const data = {
				race: { id: "human", name: "Human" },
			} as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.race).toBe("human");
		});

		it("converts exaltation object to string id", () => {
			const data = {
				exaltation: { id: "vampire", name: "Vampire" },
			} as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.exaltation).toBe("vampire");
		});

		it("converts alignment object to string id", () => {
			const data = {
				alignment: { id: "lawful", name: "Lawful" },
			} as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.alignment).toBe("lawful");
		});

		it("converts backgrounds object to array", () => {
			const data = {
				backgrounds: { allies: 3, wealth: 2 },
				backgroundNotes: { allies: "Guild contacts" },
			} as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(Array.isArray(result.backgrounds)).toBe(true);
			const bgs = result.backgrounds as {
				name: string;
				dots: number;
				notes: string;
			}[];
			expect(bgs).toHaveLength(2);
			const allies = bgs.find((b) => b.name === "Allies");
			expect(allies).toEqual({
				name: "Allies",
				dots: 3,
				notes: "Guild contacts",
			});
			const wealth = bgs.find((b) => b.name === "Wealth");
			expect(wealth).toEqual({ name: "Wealth", dots: 2, notes: "" });
			expect(result.backgroundNotes).toBeUndefined();
		});

		it("skips zero-dot backgrounds during migration", () => {
			const data = {
				backgrounds: { allies: 0, wealth: 3 },
			} as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			const bgs = result.backgrounds as {
				name: string;
				dots: number;
				notes: string;
			}[];
			expect(bgs).toHaveLength(1);
			expect(bgs[0].name).toBe("Wealth");
		});

		it("converts feats string[] to FeatEntry[]", () => {
			const data = { feats: ["Power Attack", "Cleave"] } as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.feats).toEqual([
				{ name: "Power Attack", notes: "" },
				{ name: "Cleave", notes: "" },
			]);
		});

		it("converts assets string[] to { name, notes }[]", () => {
			const data = { assets: ["Wealthy", "Noble"] } as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.assets).toEqual([
				{ name: "Wealthy", notes: "" },
				{ name: "Noble", notes: "" },
			]);
		});

		it("converts hindrances string[] to { name, notes }[]", () => {
			const data = { hindrances: ["One Eye"] } as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.hindrances).toEqual([{ name: "One Eye", notes: "" }]);
		});

		it("splits weapons array into meleeWeapons and rangedWeapons", () => {
			const data = {
				weapons: [
					{ name: "Sword", type: "melee" },
					{ name: "Pistol", type: "ranged" },
					{ name: "Axe", category: "melee" },
				],
			} as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.meleeWeapons).toEqual([
				{ name: "Sword", type: "melee" },
				{ name: "Axe", category: "melee" },
			]);
			expect(result.rangedWeapons).toEqual([{ name: "Pistol", type: "ranged" }]);
			expect(result.weapons).toBeUndefined();
		});

		it("converts psychicStrength 'fettered' to fettered=true", () => {
			const data = { psychicStrength: "fettered" } as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.fettered).toBe(true);
			expect(result.psychicStrength).toBeUndefined();
		});

		it("converts psychicStrength 'unfettered' to fettered=false", () => {
			const data = { psychicStrength: "unfettered" } as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.fettered).toBe(false);
			expect(result.psychicStrength).toBeUndefined();
		});

		it("converts globalPush to extraSchoolLevels", () => {
			const data = { globalPush: 2 } as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.extraSchoolLevels).toBe(2);
			expect(result.globalPush).toBeUndefined();
		});

		it("cleans up Builder-only fields", () => {
			const data = {
				raceId: "human",
				exaltationId: "vampire",
				alignmentId: "lawful",
				raceChoices: { charBonus: "strength" },
				equipmentChoices: {},
				charPriorities: [],
				charDotsSpent: 10,
				skillPriorities: [],
				skillDotsSpent: 5,
				exportedAt: "2024-01-01",
				exaltationPowers: [],
			} as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.raceId).toBeUndefined();
			expect(result.exaltationId).toBeUndefined();
			expect(result.alignmentId).toBeUndefined();
			expect(result.raceChoices).toBeUndefined();
			expect(result.equipmentChoices).toBeUndefined();
			expect(result.charPriorities).toBeUndefined();
			expect(result.charDotsSpent).toBeUndefined();
			expect(result.skillPriorities).toBeUndefined();
			expect(result.skillDotsSpent).toBeUndefined();
			expect(result.exportedAt).toBeUndefined();
			expect(result.exaltationPowers).toBeUndefined();
		});

		it("extracts raceCharBonus from raceChoices", () => {
			const data = {
				raceChoices: { charBonus: "dexterity" },
			} as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.raceCharBonus).toBe("dexterity");
		});

		it("does not overwrite existing raceCharBonus", () => {
			const data = {
				raceCharBonus: "strength",
				raceChoices: { charBonus: "dexterity" },
			} as unknown as Record<string, unknown>;
			const result = character._migrateIfNeeded(data);
			expect(result.raceCharBonus).toBe("strength");
		});

		it("returns data unchanged for null/non-object input", () => {
			expect(character._migrateIfNeeded(null as unknown as Record<string, unknown>)).toBeNull();
		});
	});

	describe("save / load / list / remove", () => {
		beforeEach(() => {
			vi.spyOn(character, "_genId").mockReturnValue("test123");
		});

		it("save stores data and updates list", () => {
			const ch = character.createDefault();
			ch.name = "Test Hero";
			character.save("test123", ch);

			expect(localStorage.setItem).toHaveBeenCalledWith("dtd_sheet_test123", JSON.stringify(ch));
			const list = JSON.parse(storage[character.STORAGE_LIST_KEY]);
			expect(list).toEqual([{ id: "test123", name: "Test Hero" }]);
		});

		it("save updates existing entry name in list", () => {
			const ch = character.createDefault();
			ch.name = "Original";
			character.save("test123", ch);

			ch.name = "Updated";
			character.save("test123", ch);

			const list = JSON.parse(storage[character.STORAGE_LIST_KEY]);
			expect(list).toHaveLength(1);
			expect(list[0].name).toBe("Updated");
		});

		it("save uses 'Unnamed' when name is empty", () => {
			const ch = character.createDefault();
			ch.name = "";
			character.save("test123", ch);

			const list = JSON.parse(storage[character.STORAGE_LIST_KEY]);
			expect(list[0].name).toBe("Unnamed");
		});

		it("load returns saved character data", () => {
			const ch = character.createDefault();
			ch.name = "Saved Hero";
			character.save("test123", ch);

			const loaded = character.load("test123");
			expect(loaded.name).toBe("Saved Hero");
			expect(loaded.id).toBe("test123");
		});

		it("load returns default for missing id", () => {
			const loaded = character.load("nonexistent");
			expect(loaded.id).toBe("nonexistent");
			expect(loaded.totalXP).toBe(600);
		});

		it("list returns empty array when nothing saved", () => {
			expect(character.list()).toEqual([]);
		});

		it("list returns saved entries", () => {
			const ch = character.createDefault();
			ch.name = "Hero A";
			character.save("a", ch);
			ch.name = "Hero B";
			character.save("b", ch);

			const list = character.list();
			expect(list).toHaveLength(2);
			expect(list.map((e) => e.id)).toContain("a");
			expect(list.map((e) => e.id)).toContain("b");
		});

		it("remove deletes character and updates list", () => {
			const ch = character.createDefault();
			ch.name = "Doomed";
			character.save("doom", ch);
			expect(character.list()).toHaveLength(1);

			character.remove("doom");
			expect(localStorage.removeItem).toHaveBeenCalledWith("dtd_sheet_doom");
			expect(character.list()).toHaveLength(0);
		});

		it("load runs migration on legacy data", () => {
			const legacy = {
				name: "Legacy",
				race: { id: "elf", name: "Elf" },
				feats: ["Power Attack"],
			};
			storage.dtd_sheet_legacy1 = JSON.stringify(legacy);

			const loaded = character.load("legacy1");
			expect(loaded.race).toBe("elf");
			expect(loaded.feats).toEqual([{ name: "Power Attack", notes: "" }]);
		});
	});
});

// ---------------------------------------------------------------------------
// loadData / loadAllData (fetch mocked)
// ---------------------------------------------------------------------------
describe("loadData", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("fetches JSON from /data/ path", async () => {
		const mockData = { skills: ["Acrobatics"] };
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData),
			}),
		);

		const result = await loadData("skills.json");
		expect(fetch).toHaveBeenCalledWith("/data/skills.json");
		expect(result).toEqual(mockData);
	});

	it("throws on non-ok response", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
			}),
		);

		await expect(loadData("missing.json")).rejects.toThrow("Failed to load missing.json: 404");
	});

	it("preserves generic type", async () => {
		interface Skill {
			name: string;
		}
		const mockData: Skill[] = [{ name: "Acrobatics" }];
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData),
			}),
		);

		const result = await loadData<Skill[]>("skills.json");
		expect(result[0].name).toBe("Acrobatics");
	});
});

describe("loadAllData", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("loads multiple files in parallel and returns keyed by name without .json", async () => {
		const skillsData = [{ name: "Acrobatics" }];
		const racesData = [{ name: "Human" }];

		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation((url: string) => {
				if (url.includes("skills.json")) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve(skillsData),
					});
				}
				if (url.includes("races.json")) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve(racesData),
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			}),
		);

		const result = await loadAllData(["skills.json", "races.json"]);
		expect(result.skills).toEqual(skillsData);
		expect(result.races).toEqual(racesData);
		expect(Object.keys(result)).toEqual(["skills", "races"]);
	});

	it("returns empty object for empty array", async () => {
		vi.stubGlobal("fetch", vi.fn());
		const result = await loadAllData([]);
		expect(result).toEqual({});
		expect(fetch).not.toHaveBeenCalled();
	});

	it("propagates fetch errors", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
			}),
		);

		await expect(loadAllData(["bad.json"])).rejects.toThrow("Failed to load bad.json: 500");
	});
});


