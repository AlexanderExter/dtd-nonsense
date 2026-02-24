/**
 * DTD Tools - Core Utilities
 * Shared functions for all DTD tools
 */

// Use `var` so DTD is on `window` — dice.js and other modules extend it via window.DTD
var DTD = {
    // =========================================================================
    // Data Loading
    // =========================================================================

    /**
     * Load JSON data from the shared data folder
     * @param {string} filename - Name of the JSON file (e.g., 'races.json')
     * @returns {Promise<any>} Parsed JSON data
     */
    async loadData(filename) {
        const basePath = this.getBasePath();
        const response = await fetch(`${basePath}shared/data/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}: ${response.status}`);
        }
        return response.json();
    },

    /**
     * Load multiple data files in parallel
     * @param {string[]} filenames - Array of JSON filenames
     * @returns {Promise<Object>} Object with filename (without .json) as key
     */
    async loadAllData(filenames) {
        const results = await Promise.all(
            filenames.map(f => this.loadData(f))
        );
        const data = {};
        filenames.forEach((f, i) => {
            const key = f.replace('.json', '');
            data[key] = results[i];
        });
        return data;
    },

    /**
     * Get base path to tools folder (handles different depths)
     */
    getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/character-builder/') ||
            path.includes('/character-sheet/') ||
            path.includes('/dice-roller/') ||
            path.includes('/quick-reference/') ||
            path.includes('/npc-generator/') ||
            path.includes('/combat-tracker/') ||
            path.includes('/ship-builder/')) {
            return '../';
        }
        return './';
    },

    // =========================================================================
    // Derived Stats Calculation (DTD.derived namespace)
    // =========================================================================

    /**
     * @namespace DTD.derived
     * Formalized stat calculation functions. Each takes raw characteristic values
     * and returns a number. These are the canonical formulas.
     */
    derived: {
        /**
         * Static Defense: 10 + (Dex + Wis) × 3 − Size × 2
         * Halfling variant: 10 + Dex × 6 − Size × 2
         * @param {number} dex - Dexterity
         * @param {number} wis - Wisdom
         * @param {number} size - Size (typically 3-6)
         * @param {boolean} [isHalfling=false] - Use Halfling variant formula
         * @returns {number}
         */
        calculateSD(dex, wis, size, isHalfling = false) {
            if (isHalfling) {
                return 10 + dex * 6 - size * 2;
            }
            return 10 + (dex + wis) * 3 - size * 2;
        },

        /**
         * Hit Points: (Con + Wil) × 2
         * @param {number} con - Constitution
         * @param {number} wil - Willpower
         * @returns {number}
         */
        calculateHP(con, wil) {
            return (con + wil) * 2;
        },

        /**
         * Mental Defense: 5 + Composure × 5
         * @param {number} composure - Composure
         * @returns {number}
         */
        calculateMentalDefense(composure) {
            return 5 + composure * 5;
        },

        /**
         * Resolve: Willpower + Composure
         * @param {number} wil - Willpower
         * @param {number} composure - Composure
         * @returns {number}
         */
        calculateResolve(wil, composure) {
            return wil + composure;
        },

        /**
         * Initiative base (rolled, not static): Dex + Composure
         * @param {number} dex - Dexterity
         * @param {number} composure - Composure
         * @returns {number}
         */
        calculateInitiativeBase(dex, composure) {
            return dex + composure;
        },

        /**
         * Speed: Strength + Dexterity
         * @param {number} str - Strength (included per Character Sheet formula)
         * @param {number} dex - Dexterity
         * @returns {number}
         */
        calculateSpeed(str, dex) {
            return str + dex;
        },

        /**
         * Resilience: ceil((Size + Level) / 2) + 1
         * @param {number} size - Size (typically 3-6)
         * @param {number} level - Character level (total class levels)
         * @returns {number}
         */
        calculateResilience(size, level) {
            return Math.ceil((size + level) / 2) + 1;
        }
    },

    /**
     * Calculate all derived stats for a character (aggregate convenience).
     * @deprecated Prefer using individual DTD.derived.calculate*() functions
     * @param {Object} char - Character data with characteristics, race, etc.
     * @returns {Object} All calculated derived stats
     */
    calculateDerivedStats(char) {
        const c = this.getTotalCharacteristics(char);
        const size = char.race?.size ?? 4;
        const level = char.level ?? 1;

        return {
            staticDefense: this.derived.calculateSD(c.dexterity, c.wisdom, size),
            hitPoints: this.derived.calculateHP(c.constitution, c.willpower),
            speed: this.derived.calculateSpeed(c.strength, c.dexterity),
            mentalDefense: this.derived.calculateMentalDefense(c.composure),
            resolve: this.derived.calculateResolve(c.willpower, c.composure),
            resilience: this.derived.calculateResilience(size, level),
            size,
            level
        };
    },

    /**
     * Get total characteristic values including racial bonuses
     * @param {Object} char - Character data
     * @returns {Object} All 9 characteristics with totals
     */
    getTotalCharacteristics(char) {
        const base = char.characteristics || {};
        const racial = char.race?.charBonus || {};

        const characteristics = [
            'strength', 'dexterity', 'constitution',
            'charisma', 'fellowship', 'composure',
            'intelligence', 'wisdom', 'willpower'
        ];

        const result = {};
        for (const c of characteristics) {
            result[c] = (base[c] || 1) + (racial[c] || 0);
        }
        return result;
    },

    // =========================================================================
    // XP Calculations
    // =========================================================================

    XP_COSTS: {
        characteristic: (rank) => 100 * rank,
        skill: (rank) => rank === 0 ? 50 : 50 * rank,
        newSchool: 100,
        schoolRank: (rank) => 100 * rank,
        asset: 100,
        background: (rank) => rank <= 3 ? 50 : 100,
        powerStat: (rank) => 200 * rank,
        devotion: (rank) => 50 * rank
    },

    /**
     * Calculate total XP spent
     * @param {Object} char - Character data
     * @returns {number} Total XP spent
     */
    calculateXPSpent(char) {
        let total = 0;

        // Characteristics (beyond starting 1)
        for (const val of Object.values(char.characteristics || {})) {
            for (let r = 2; r <= val; r++) {
                total += this.XP_COSTS.characteristic(r);
            }
        }

        // Skills
        for (const val of Object.values(char.skills || {})) {
            for (let r = 1; r <= val; r++) {
                total += this.XP_COSTS.skill(r);
            }
        }

        // Add other categories as needed...

        return total;
    },

    // =========================================================================
    // Character Persistence (DTD.character namespace)
    // =========================================================================

    /**
     * @namespace DTD.character
     * Canonical character CRUD, validation, and migration.
     * Storage keys: dtd_sheet_{id} for data, dtd_sheet_list for index.
     */
    character: {
        STORAGE_PREFIX: 'dtd_sheet_',
        STORAGE_LIST_KEY: 'dtd_sheet_list',

        /**
         * Canonical character defaults — every field, its type, its default.
         * These match the Character Sheet's schema exactly.
         */
        DEFAULTS: {
            id: '',
            name: '',
            player: '',
            concept: '',
            totalXP: 600,
            xpSpent: 0,

            race: '',
            raceCharBonus: '',
            exaltation: '',
            alignment: '',
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
                willpower: 2
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
            auraSource: '',

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
            exaltationNotes: '',

            modifiers: {
                staticDefense: 0,
                hitPoints: 0,
                mentalDefense: 0,
                resolve: 0,
                speed: 0,
                resilience: 0,
                initiative: 0
            },

            savedPools: [],
            languages: [],
            equipment: '',
            notes: '',
            classNotes: '',
            description: '',
            height: '',
            weight: '',
            age: '',
            currentHP: 0,
            currentResolve: 0
        },

        /**
         * Create a new character with default values and a fresh UUID.
         * @returns {Object} Deep copy of DEFAULTS with new id
         */
        createDefault() {
            const ch = JSON.parse(JSON.stringify(this.DEFAULTS));
            ch.id = this._genId();
            return ch;
        },

        /**
         * Validate/fill missing fields from defaults (deep merge).
         * Ported from Sheet.mergeDefaults.
         * @param {Object} data - Character data (may have missing fields)
         * @returns {Object} Complete character with all fields present
         */
        validate(data) {
            if (!data || typeof data !== 'object') {
                return this.createDefault();
            }
            return this._mergeDefaults(data, this.DEFAULTS);
        },

        /**
         * Save a character to localStorage.
         * @param {string} id - Character ID
         * @param {Object} data - Character data
         */
        save(id, data) {
            try {
                localStorage.setItem(this.STORAGE_PREFIX + id, JSON.stringify(data));
                // Update the list entry
                const list = this.list();
                const entry = list.find(c => c.id === id);
                if (entry) {
                    entry.name = data.name || 'Unnamed';
                    localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(list));
                }
            } catch (e) {
                console.error('Failed to save character:', e);
            }
        },

        /**
         * Load a character from localStorage, validated against defaults.
         * @param {string} id - Character ID
         * @returns {Object} Parsed + validated character
         */
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
                console.error('Failed to load character:', e);
            }
            const def = this.createDefault();
            def.id = id;
            return def;
        },

        /**
         * List all saved characters.
         * @returns {Array<{id: string, name: string}>}
         */
        list() {
            try {
                const raw = localStorage.getItem(this.STORAGE_LIST_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        },

        /**
         * Remove a character from storage and list.
         * @param {string} id - Character ID to remove
         */
        remove(id) {
            localStorage.removeItem(this.STORAGE_PREFIX + id);
            const list = this.list().filter(c => c.id !== id);
            localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(list));
        },

        /**
         * Download character as a JSON file.
         * @param {Object} data - Character data
         * @param {string} [filename] - Override filename
         */
        exportJSON(data, filename) {
            const name = filename || (data.name || 'character').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            a.click();
            URL.revokeObjectURL(url);
        },

        /**
         * Import a JSON file, detecting legacy Builder format and migrating.
         * @param {File} file - File object from input
         * @returns {Promise<Object>} Canonical character data
         */
        async importJSON(file) {
            const text = await file.text();
            let data = JSON.parse(text);
            data = this._migrateIfNeeded(data);
            if (!data.id) data.id = this._genId();
            return this.validate(data);
        },

        // Internal helpers

        _genId() {
            return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        },

        /**
         * Deep merge obj into defaults. Preserves extra keys from obj.
         */
        _mergeDefaults(obj, defaults) {
            const result = { ...defaults };
            for (const key of Object.keys(defaults)) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
                        result[key] = this._mergeDefaults(obj[key] || {}, defaults[key]);
                    } else {
                        result[key] = obj[key];
                    }
                }
            }
            // Preserve extra keys from saved data
            for (const key of Object.keys(obj)) {
                if (!defaults.hasOwnProperty(key)) {
                    result[key] = obj[key];
                }
            }
            return result;
        },

        /**
         * Detect and migrate legacy Builder format to canonical format.
         * @param {Object} data - Potentially legacy data
         * @returns {Object} Migrated data
         */
        _migrateIfNeeded(data) {
            if (!data || typeof data !== 'object') return data;

            // Builder race: object → string ID
            if (data.race && typeof data.race === 'object') {
                const raceId = data.race.id || data.raceId || '';
                data.race = raceId;
            }

            // Builder exaltation: object → string ID
            if (data.exaltation && typeof data.exaltation === 'object') {
                const exId = data.exaltation.id || data.exaltationId || '';
                data.exaltation = exId;
            }

            // Builder alignment: object → string ID
            if (data.alignment && typeof data.alignment === 'object') {
                data.alignment = data.alignment.id || data.alignmentId || '';
            }

            // Builder raceChoices.charBonus → raceCharBonus
            if (data.raceChoices?.charBonus && !data.raceCharBonus) {
                data.raceCharBonus = data.raceChoices.charBonus;
            }

            // Builder backgrounds: plain object {allies: 2} → array [{name, dots, notes}]
            if (data.backgrounds && !Array.isArray(data.backgrounds)) {
                const oldBgs = data.backgrounds;
                const oldNotes = data.backgroundNotes || {};
                data.backgrounds = [];
                for (const [id, dots] of Object.entries(oldBgs)) {
                    if (dots > 0) {
                        const name = id.charAt(0).toUpperCase() + id.slice(1);
                        data.backgrounds.push({ name, dots, notes: oldNotes[id] || '' });
                    }
                }
                delete data.backgroundNotes;
            }

            // Builder feats: array of strings → array of {name, notes}
            if (Array.isArray(data.feats) && data.feats.length > 0 && typeof data.feats[0] === 'string') {
                data.feats = data.feats.map(f => ({ name: f, notes: '' }));
            }

            // Builder assets: array of strings → array of {name, notes}
            if (Array.isArray(data.assets) && data.assets.length > 0 && typeof data.assets[0] === 'string') {
                data.assets = data.assets.map(a => ({ name: a, notes: '' }));
            }

            // Builder hindrances: array of strings → array of {name, notes}
            if (Array.isArray(data.hindrances) && data.hindrances.length > 0 && typeof data.hindrances[0] === 'string') {
                data.hindrances = data.hindrances.map(h => ({ name: h, notes: '' }));
            }

            // Builder weapons (merged) → split into meleeWeapons / rangedWeapons
            if (data.weapons && Array.isArray(data.weapons) && !data.meleeWeapons && !data.rangedWeapons) {
                data.meleeWeapons = [];
                data.rangedWeapons = [];
                for (const w of data.weapons) {
                    if (w.type === 'melee' || w.category === 'melee') {
                        data.meleeWeapons.push(w);
                    } else {
                        data.rangedWeapons.push(w);
                    }
                }
                delete data.weapons;
            }

            // Migrate psychicStrength string → fettered boolean
            if (data.psychicStrength && !data.hasOwnProperty('fettered')) {
                data.fettered = data.psychicStrength === 'fettered';
                delete data.psychicStrength;
            }

            // Migrate globalPush → extraSchoolLevels
            if (data.hasOwnProperty('globalPush') && !data.hasOwnProperty('extraSchoolLevels')) {
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
        }
    },

    // =========================================================================
    // Character Export (legacy convenience)
    // =========================================================================

    /**
     * Export character as downloadable JSON
     * @deprecated Use DTD.character.exportJSON() instead
     * @param {Object} char - Character data
     * @param {string} filename - Download filename
     */
    exportCharacterJSON(char, filename = 'character.json') {
        DTD.character.exportJSON(char, filename);
    },

    // =========================================================================
    // UI Helpers
    // =========================================================================

    /**
     * Render dot rating (filled and empty circles)
     * @param {number} value - Current value
     * @param {number} max - Maximum dots
     * @returns {string} HTML string
     */
    renderDotRating(value, max = 5) {
        let html = '<span class="dot-rating">';
        for (let i = 1; i <= max; i++) {
            html += `<span class="dot ${i <= value ? 'filled' : ''}"></span>`;
        }
        html += '</span>';
        return html;
    },

    /**
     * Initialize accordion behavior
     * @param {HTMLElement} container - Container with .accordion-item elements
     */
    initAccordion(container) {
        const items = container.querySelectorAll('.accordion-item');
        items.forEach(item => {
            const header = item.querySelector('.accordion-header');
            header.addEventListener('click', () => {
                // Toggle this item
                item.classList.toggle('open');
            });
        });
    },

    /**
     * Initialize accordion with single-open behavior
     * @param {HTMLElement} container - Container with .accordion-item elements
     */
    initAccordionExclusive(container) {
        const items = container.querySelectorAll('.accordion-item');
        items.forEach(item => {
            const header = item.querySelector('.accordion-header');
            header.addEventListener('click', () => {
                // Close all others
                items.forEach(other => {
                    if (other !== item) other.classList.remove('open');
                });
                // Toggle this item
                item.classList.toggle('open');
            });
        });
    },

    /**
     * Debounce function for search/filter inputs
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay in ms
     * @returns {Function} Debounced function
     */
    debounce(fn, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Export for module usage if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DTD;
}
