/**
 * DTD Core — shared utilities for all tools (ES module)
 *
 * Ported from tools/shared/js/core.js.
 * Import specific functions: import { loadData, derived, character } from '@/lib/dtd/core';
 */

// =========================================================================
// Data Loading
// =========================================================================

/**
 * Load JSON data from the /data/ folder (Astro public dir).
 * @param {string} filename - Name of the JSON file (e.g., 'races.json')
 * @returns {Promise<any>} Parsed JSON data
 */
export async function loadData(filename) {
  const response = await fetch(`/data/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}: ${response.status}`);
  }
  return response.json();
}

/**
 * Load multiple data files in parallel.
 * @param {string[]} filenames - Array of JSON filenames
 * @returns {Promise<Object>} Object with filename (without .json) as key
 */
export async function loadAllData(filenames) {
  const results = await Promise.all(filenames.map((f) => loadData(f)));
  const data = {};
  filenames.forEach((f, i) => {
    const key = f.replace(".json", "");
    data[key] = results[i];
  });
  return data;
}

// =========================================================================
// Derived Stats Calculation
// =========================================================================

export const derived = {
  /**
   * Static Defense: 10 + (Dex + Wis) × 3 − Size × 2
   * Halfling variant: 10 + Dex × 6 − Size × 2
   */
  calculateSD(dex, wis, size, isHalfling = false) {
    if (isHalfling) {
      return 10 + dex * 6 - size * 2;
    }
    return 10 + (dex + wis) * 3 - size * 2;
  },

  /** Hit Points: (Con + Wil) × 2 */
  calculateHP(con, wil) {
    return (con + wil) * 2;
  },

  /** Mental Defense: 5 + Composure × 5 */
  calculateMentalDefense(composure) {
    return 5 + composure * 5;
  },

  /** Resolve: Willpower + Composure */
  calculateResolve(wil, composure) {
    return wil + composure;
  },

  /** Initiative base: Dex + Composure */
  calculateInitiativeBase(dex, composure) {
    return dex + composure;
  },

  /** Speed: Strength + Dexterity */
  calculateSpeed(str, dex) {
    return str + dex;
  },

  /** Resilience: ceil((Size + Level) / 2) + 1 */
  calculateResilience(size, level) {
    return Math.ceil((size + level) / 2) + 1;
  },
};

/**
 * Calculate all derived stats for a character (aggregate convenience).
 * @param {Object} char - Character data with characteristics, race, etc.
 * @returns {Object} All calculated derived stats
 */
export function calculateDerivedStats(char) {
  const c = getTotalCharacteristics(char);
  const size = char.race?.size ?? 4;
  const level = char.level ?? 1;

  return {
    staticDefense: derived.calculateSD(c.dexterity, c.wisdom, size),
    hitPoints: derived.calculateHP(c.constitution, c.willpower),
    speed: derived.calculateSpeed(c.strength, c.dexterity),
    mentalDefense: derived.calculateMentalDefense(c.composure),
    resolve: derived.calculateResolve(c.willpower, c.composure),
    resilience: derived.calculateResilience(size, level),
    size,
    level,
  };
}

/**
 * Get total characteristic values including racial bonuses.
 */
export function getTotalCharacteristics(char) {
  const base = char.characteristics || {};
  const racial = char.race?.charBonus || {};

  const characteristics = [
    "strength",
    "dexterity",
    "constitution",
    "charisma",
    "fellowship",
    "composure",
    "intelligence",
    "wisdom",
    "willpower",
  ];

  const result = {};
  for (const c of characteristics) {
    result[c] = (base[c] || 1) + (racial[c] || 0);
  }
  return result;
}

// =========================================================================
// XP Calculations
// =========================================================================

export const XP_COSTS = {
  characteristic: (rank) => 100 * rank,
  skill: (rank) => (rank === 0 ? 50 : 50 * rank),
  newSchool: 100,
  schoolRank: (rank) => 100 * rank,
  asset: 100,
  background: (rank) => (rank <= 3 ? 50 : 100),
  powerStat: (rank) => 200 * rank,
  devotion: (rank) => 50 * rank,
};

/**
 * Calculate total XP spent.
 */
export function calculateXPSpent(char) {
  let total = 0;

  for (const val of Object.values(char.characteristics || {})) {
    for (let r = 2; r <= val; r++) {
      total += XP_COSTS.characteristic(r);
    }
  }

  for (const val of Object.values(char.skills || {})) {
    for (let r = 1; r <= val; r++) {
      total += XP_COSTS.skill(r);
    }
  }

  return total;
}

// =========================================================================
// Character Persistence
// =========================================================================

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
      strength: 2,
      dexterity: 2,
      constitution: 2,
      charisma: 2,
      fellowship: 2,
      composure: 2,
      intelligence: 2,
      wisdom: 2,
      willpower: 2,
    },
    charSpecialties: {},
    skills: {},
    skillSpecialties: {},

    backgrounds: [],
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
    languages: [],
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

  createDefault() {
    const ch = JSON.parse(JSON.stringify(this.DEFAULTS));
    ch.id = this._genId();
    return ch;
  },

  validate(data) {
    if (!data || typeof data !== "object") {
      return this.createDefault();
    }
    return this._mergeDefaults(data, this.DEFAULTS);
  },

  save(id, data) {
    try {
      localStorage.setItem(this.STORAGE_PREFIX + id, JSON.stringify(data));
      const list = this.list();
      const entry = list.find((c) => c.id === id);
      if (entry) {
        entry.name = data.name || "Unnamed";
        localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(list));
      }
    } catch (e) {
      console.error("Failed to save character:", e);
    }
  },

  load(id) {
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

  list() {
    try {
      const raw = localStorage.getItem(this.STORAGE_LIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  remove(id) {
    localStorage.removeItem(this.STORAGE_PREFIX + id);
    const list = this.list().filter((c) => c.id !== id);
    localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(list));
  },

  exportJSON(data, filename) {
    const name =
      filename ||
      (data.name || "character").replace(/[^a-z0-9]/gi, "_").toLowerCase() +
        ".json";
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  },

  async importJSON(file) {
    const text = await file.text();
    let data = JSON.parse(text);
    data = this._migrateIfNeeded(data);
    if (!data.id) data.id = this._genId();
    return this.validate(data);
  },

  // -- Internal helpers --

  _genId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    );
  },

  _mergeDefaults(obj, defaults) {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (
          typeof defaults[key] === "object" &&
          defaults[key] !== null &&
          !Array.isArray(defaults[key])
        ) {
          result[key] = this._mergeDefaults(obj[key] || {}, defaults[key]);
        } else {
          result[key] = obj[key];
        }
      }
    }
    for (const key of Object.keys(obj)) {
      if (!Object.prototype.hasOwnProperty.call(defaults, key)) {
        result[key] = obj[key];
      }
    }
    return result;
  },

  _migrateIfNeeded(data) {
    if (!data || typeof data !== "object") return data;

    if (data.race && typeof data.race === "object") {
      data.race = data.race.id || data.raceId || "";
    }
    if (data.exaltation && typeof data.exaltation === "object") {
      data.exaltation = data.exaltation.id || data.exaltationId || "";
    }
    if (data.alignment && typeof data.alignment === "object") {
      data.alignment = data.alignment.id || data.alignmentId || "";
    }
    if (data.raceChoices?.charBonus && !data.raceCharBonus) {
      data.raceCharBonus = data.raceChoices.charBonus;
    }
    if (data.backgrounds && !Array.isArray(data.backgrounds)) {
      const oldBgs = data.backgrounds;
      const oldNotes = data.backgroundNotes || {};
      data.backgrounds = [];
      for (const [id, dots] of Object.entries(oldBgs)) {
        if (dots > 0) {
          const name = id.charAt(0).toUpperCase() + id.slice(1);
          data.backgrounds.push({ name, dots, notes: oldNotes[id] || "" });
        }
      }
      delete data.backgroundNotes;
    }
    if (
      Array.isArray(data.feats) &&
      data.feats.length > 0 &&
      typeof data.feats[0] === "string"
    ) {
      data.feats = data.feats.map((f) => ({ name: f, notes: "" }));
    }
    if (
      Array.isArray(data.assets) &&
      data.assets.length > 0 &&
      typeof data.assets[0] === "string"
    ) {
      data.assets = data.assets.map((a) => ({ name: a, notes: "" }));
    }
    if (
      Array.isArray(data.hindrances) &&
      data.hindrances.length > 0 &&
      typeof data.hindrances[0] === "string"
    ) {
      data.hindrances = data.hindrances.map((h) => ({ name: h, notes: "" }));
    }
    if (
      data.weapons &&
      Array.isArray(data.weapons) &&
      !data.meleeWeapons &&
      !data.rangedWeapons
    ) {
      data.meleeWeapons = [];
      data.rangedWeapons = [];
      for (const w of data.weapons) {
        if (w.type === "melee" || w.category === "melee") {
          data.meleeWeapons.push(w);
        } else {
          data.rangedWeapons.push(w);
        }
      }
      delete data.weapons;
    }
    if (data.psychicStrength && !Object.prototype.hasOwnProperty.call(data, "fettered")) {
      data.fettered = data.psychicStrength === "fettered";
      delete data.psychicStrength;
    }
    if (
      Object.prototype.hasOwnProperty.call(data, "globalPush") &&
      !Object.prototype.hasOwnProperty.call(data, "extraSchoolLevels")
    ) {
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

// =========================================================================
// UI Helpers
// =========================================================================

/**
 * Render dot rating (filled and empty circles).
 */
export function renderDotRating(value, max = 5) {
  let html = '<span class="dot-rating">';
  for (let i = 1; i <= max; i++) {
    html += `<span class="dot ${i <= value ? "filled" : ""}"></span>`;
  }
  html += "</span>";
  return html;
}

/** Initialize accordion behavior. */
export function initAccordion(container) {
  const items = container.querySelectorAll(".accordion-item");
  items.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    header.addEventListener("click", () => {
      item.classList.toggle("open");
    });
  });
}

/** Initialize accordion with single-open behavior. */
export function initAccordionExclusive(container) {
  const items = container.querySelectorAll(".accordion-item");
  items.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    header.addEventListener("click", () => {
      items.forEach((other) => {
        if (other !== item) other.classList.remove("open");
      });
      item.classList.toggle("open");
    });
  });
}

/** Debounce function for search/filter inputs. */
export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/** Escape HTML to prevent XSS. */
export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
