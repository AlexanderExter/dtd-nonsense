/**
 * DTD Character — persistence, validation, and migration for character data.
 *
 * Manages localStorage-backed character CRUD, import/export, schema
 * migration from older save formats, and default-merging.
 *
 * Prefer importing directly for tree-shaking:
 *   import { character } from "@/lib/dtd/character";
 */
import type { CharacterData, CharacterListEntry } from "./types.ts";

export const character = {
	STORAGE_PREFIX: "dtd_sheet_",
	STORAGE_LIST_KEY: "dtd_sheet_list",

	DEFAULTS: {
		id: "",
		name: "",
		player: "",
		concept: "",
		totalXP: 600,
		xpSpent: 0,

		race: "",
		raceCharBonus: "",
		exaltation: "",
		alignment: "",
		devotion: 6,

		characteristics: {
			strength: 1,
			dexterity: 1,
			constitution: 1,
			charisma: 1,
			fellowship: 1,
			composure: 1,
			intelligence: 1,
			wisdom: 1,
			willpower: 1,
		},
		charSpecialties: {},
		skills: {},
		skillSpecialties: {},

		backgrounds: [],
		backgroundNotes: {},
		classes: [],
		feats: [],
		assets: [],
		hindrances: [],

		meleeWeapons: [],
		rangedWeapons: [],
		armor: [],
		naturalArmor: 0,
		aura: 0,
		auraSource: "",

		magicSchools: {},
		swordSchools: {},
		gunKata: {},
		spells: [],
		specialAttacks: [],
		trickShots: [],

		powerStat: 1,
		heroPointsMax: 2,
		heroPointsCurrent: 2,
		heroPointsBurnt: 0,
		fettered: false,
		pushAmount: 0,
		extraSchoolLevels: 0,
		bonusSchoolLevels: {},
		sanctioned: false,
		resourceCurrent: 0,
		exaltationNotes: "",

		modifiers: {
			staticDefense: 0,
			hitPoints: 0,
			mentalDefense: 0,
			resolve: 0,
			speed: 0,
			resilience: 0,
			initiative: 0,
		},

		savedPools: [],
		languages: ["Trade"],
		equipment: "",
		notes: "",
		classNotes: "",
		description: "",
		height: "",
		weight: "",
		age: "",
		currentHP: 0,
		currentResolve: 0,
	},

	createDefault(): CharacterData {
		const ch = JSON.parse(JSON.stringify(this.DEFAULTS)) as CharacterData;
		ch.id = this._genId();
		return ch;
	},

	validate(data: unknown): CharacterData {
		if (!data || typeof data !== "object") {
			return this.createDefault();
		}
		return this._mergeDefaults(
			data as Record<string, unknown>,
			this.DEFAULTS as unknown as Record<string, unknown>,
		) as unknown as CharacterData;
	},

	save(id: string, data: CharacterData): void {
		try {
			localStorage.setItem(this.STORAGE_PREFIX + id, JSON.stringify(data));
			const list = this.list();
			const entry = list.find((c) => c.id === id);
			if (entry) {
				entry.name = data.name || "Unnamed";
			} else {
				list.push({ id, name: data.name || "Unnamed" });
			}
			localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(list));
		} catch (e) {
			console.error("Failed to save character:", e);
		}
	},

	load(id: string): CharacterData {
		try {
			const raw = localStorage.getItem(this.STORAGE_PREFIX + id);
			if (raw) {
				let data = JSON.parse(raw);
				data = this._migrateIfNeeded(data);
				data = this.validate(data);
				data.id = id;
				return data;
			}
		} catch (e) {
			console.error("Failed to load character:", e);
		}
		const def = this.createDefault();
		def.id = id;
		return def;
	},

	list(): CharacterListEntry[] {
		try {
			const raw = localStorage.getItem(this.STORAGE_LIST_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch (e) {
			return [];
		}
	},

	remove(id: string): void {
		localStorage.removeItem(this.STORAGE_PREFIX + id);
		const list = this.list().filter((c) => c.id !== id);
		localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(list));
	},

	exportJSON(data: CharacterData, filename?: string): void {
		const name = filename || (data.name || "character").replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".json";
		const json = JSON.stringify(data, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = name;
		a.click();
		URL.revokeObjectURL(url);
	},

	async importJSON(file: File): Promise<CharacterData> {
		const text = await file.text();
		let data = JSON.parse(text);
		data = this._migrateIfNeeded(data);
		if (!data.id) data.id = this._genId();
		return this.validate(data);
	},

	// -- Internal helpers --

	_genId() {
		return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
	},

	_mergeDefaults(obj: Record<string, unknown>, defaults: Record<string, unknown>): Record<string, unknown> {
		const result: Record<string, unknown> = { ...defaults };
		for (const key of Object.keys(defaults)) {
			if (Object.hasOwn(obj, key)) {
				if (typeof defaults[key] === "object" && defaults[key] !== null && !Array.isArray(defaults[key])) {
					result[key] = this._mergeDefaults(
						(obj[key] as Record<string, unknown>) || {},
						defaults[key] as Record<string, unknown>,
					);
				} else {
					result[key] = obj[key];
				}
			}
		}
		for (const key of Object.keys(obj)) {
			if (!Object.hasOwn(defaults, key)) {
				result[key] = obj[key];
			}
		}
		return result;
	},

	_migrateIfNeeded(data: Record<string, unknown>): Record<string, unknown> {
		if (!data || typeof data !== "object") return data;

		if (data.race && typeof data.race === "object") {
			data.race = (data.race as Record<string, unknown>).id || data.raceId || "";
		}
		if (data.exaltation && typeof data.exaltation === "object") {
			data.exaltation = (data.exaltation as Record<string, unknown>).id || data.exaltationId || "";
		}
		if (data.alignment && typeof data.alignment === "object") {
			data.alignment = (data.alignment as Record<string, unknown>).id || data.alignmentId || "";
		}
		const raceChoices = data.raceChoices as Record<string, unknown> | undefined;
		if (raceChoices?.charBonus && !data.raceCharBonus) {
			data.raceCharBonus = raceChoices.charBonus;
		}
		if (data.backgrounds && !Array.isArray(data.backgrounds)) {
			const oldBgs = data.backgrounds as Record<string, number>;
			const oldNotes = (data.backgroundNotes as Record<string, string>) || {};
			data.backgrounds = [];
			for (const [id, dots] of Object.entries(oldBgs)) {
				if (dots > 0) {
					const name = id.charAt(0).toUpperCase() + id.slice(1);
					(data.backgrounds as unknown[]).push({ name, dots, notes: oldNotes[id] || "" });
				}
			}
			delete data.backgroundNotes;
		}
		if (Array.isArray(data.feats) && data.feats.length > 0 && typeof data.feats[0] === "string") {
			data.feats = (data.feats as unknown[]).map((f) => ({ name: f as string, notes: "" }));
		}
		if (Array.isArray(data.assets) && data.assets.length > 0 && typeof data.assets[0] === "string") {
			data.assets = (data.assets as unknown[]).map((a) => ({ name: a as string, notes: "" }));
		}
		if (Array.isArray(data.hindrances) && data.hindrances.length > 0 && typeof data.hindrances[0] === "string") {
			data.hindrances = (data.hindrances as unknown[]).map((h) => ({ name: h as string, notes: "" }));
		}
		if (data.weapons && Array.isArray(data.weapons) && !data.meleeWeapons && !data.rangedWeapons) {
			data.meleeWeapons = [];
			data.rangedWeapons = [];
			for (const w of data.weapons as Record<string, unknown>[]) {
				if (w.type === "melee" || w.category === "melee") {
					(data.meleeWeapons as unknown[]).push(w);
				} else {
					(data.rangedWeapons as unknown[]).push(w);
				}
			}
			delete data.weapons;
		}
		if (data.psychicStrength && !Object.hasOwn(data, "fettered")) {
			data.fettered = data.psychicStrength === "fettered";
			delete data.psychicStrength;
		}
		if (Object.hasOwn(data, "globalPush") && !Object.hasOwn(data, "extraSchoolLevels")) {
			data.extraSchoolLevels = data.globalPush || 0;
			delete data.globalPush;
		}

		// Clean up Builder-only fields
		delete data.raceId;
		delete data.exaltationId;
		delete data.alignmentId;
		delete data.raceChoices;
		delete data.equipmentChoices;
		delete data.charPriorities;
		delete data.charDotsSpent;
		delete data.skillPriorities;
		delete data.skillDotsSpent;
		delete data.exportedAt;
		delete data.exaltationPowers;

		return data;
	},
};
