/**
 * DTD Character Sheet
 * Freeform character sheet for Dungeons the Dragoning 40,000: 7th Edition
 *
 * All sections accessible at once, no enforced creation order.
 * Validation is informational (budget displays) rather than blocking.
 */

const Sheet = {

    // =========================================================================
    // Constants
    // =========================================================================

    STORAGE_PREFIX: 'dtd_sheet_',
    STORAGE_LIST_KEY: 'dtd_sheet_list',
    AUTOSAVE_DELAY: 400,

    CHAR_GROUPS: {
        physical: { label: 'Physical', chars: ['strength', 'dexterity', 'constitution'] },
        social:   { label: 'Social',   chars: ['charisma', 'fellowship', 'composure'] },
        mental:   { label: 'Mental',   chars: ['intelligence', 'wisdom', 'willpower'] }
    },

    CHAR_NAMES: {
        strength: 'Strength', dexterity: 'Dexterity', constitution: 'Constitution',
        charisma: 'Charisma', fellowship: 'Fellowship', composure: 'Composure',
        intelligence: 'Intelligence', wisdom: 'Wisdom', willpower: 'Willpower'
    },

    CHAR_ABBREV: {
        strength: 'Str', dexterity: 'Dex', constitution: 'Con',
        charisma: 'Cha', fellowship: 'Fel', composure: 'Com',
        intelligence: 'Int', wisdom: 'Wis', willpower: 'Wil'
    },

    MAGIC_SCHOOLS: [
        { id: 'abjuration', name: 'Abjuration', char: 'willpower' },
        { id: 'conjuration', name: 'Conjuration', char: 'willpower' },
        { id: 'divination', name: 'Divination', char: 'wisdom' },
        { id: 'enchantment', name: 'Enchantment', char: 'charisma' },
        { id: 'evocation', name: 'Evocation', char: 'charisma' },
        { id: 'healing', name: 'Healing', char: 'wisdom' },
        { id: 'illusion', name: 'Illusion', char: 'intelligence' },
        { id: 'necromancy', name: 'Necromancy', char: 'intelligence' },
        { id: 'transmutation', name: 'Transmutation', char: 'wisdom' }
    ],

    SWORD_SCHOOLS: [
        { id: 'desertWind', name: 'Desert Wind' },
        { id: 'devotedSpirit', name: 'Devoted Spirit' },
        { id: 'diamondMind', name: 'Diamond Mind' },
        { id: 'ironHeart', name: 'Iron Heart' },
        { id: 'settingSun', name: 'Setting Sun' },
        { id: 'shadowHand', name: 'Shadow Hand' },
        { id: 'stoneDragon', name: 'Stone Dragon' },
        { id: 'tigerClaw', name: 'Tiger Claw' },
        { id: 'whiteRaven', name: 'White Raven' }
    ],

    GUN_KATA: [
        { id: 'clayPigeon', name: 'Clay Pigeon' },
        { id: 'crisisZone', name: 'Crisis Zone' },
        { id: 'elementalGearbolt', name: 'Elemental Gearbolt' },
        { id: 'pointBlank', name: 'Point Blank' },
        { id: 'silentScope', name: 'Silent Scope' },
        { id: 'tinStar', name: 'Tin Star' }
    ],

    LOCATIONS: ['Head', 'Body', 'Left Arm', 'Right Arm', 'Left Leg', 'Right Leg'],
    ARMOR_TYPES: ['Light', 'Medium', 'Heavy', 'Extreme', 'Power'],
    DAMAGE_TYPES: ['E', 'I', 'R', 'X'],

    WEAPON_TYPES_MELEE: ['Melee'],
    WEAPON_TYPES_RANGED: ['Pistol', 'Basic', 'Thrown'],
    PROFICIENCY_MELEE: ['Basic', 'Melee 1', 'Melee 2', 'Melee 3'],
    PROFICIENCY_RANGED: ['Basic', 'Ranged 1', 'Ranged 2', 'Throwing'],
    AVAILABILITY: ['Ubiquitous', 'Very Common', 'Common', 'Uncommon', 'Rare', 'Very Rare', 'Mythic Rare'],

    BG_IDS: [
        'allies', 'artifact', 'backing', 'contacts', 'fame',
        'followers', 'inheritance', 'mentor', 'sanctum', 'status', 'wealth'
    ],

    // =========================================================================
    // State
    // =========================================================================

    data: {},
    char: null,
    charId: null,
    charList: [],
    saveTimer: null,
    derived: {},

    // =========================================================================
    // Initialization
    // =========================================================================

    async init() {
        try {
            await this.loadGameData();
        } catch (e) {
            console.warn('Failed to load some game data:', e);
        }

        this.loadCharList();

        if (this.charList.length > 0) {
            this.loadCharacter(this.charList[0].id);
        } else {
            this.createCharacter();
        }

        this.bindEvents();
        this.populateDataLists();
    },

    async loadGameData() {
        const files = [
            'races.json', 'exaltations.json', 'alignments.json',
            'classes.json', 'feats.json', 'skills.json',
            'weapons.json', 'backgrounds.json'
        ];
        this.data = await DTD.loadAllData(files);
    },

    populateDataLists() {
        // Feat names datalist
        const featList = document.getElementById('datalist-feats');
        if (featList && this.data.feats) {
            const feats = this.data.feats.feats || [];
            featList.innerHTML = feats.map(f =>
                `<option value="${this.esc(f.name)}">`
            ).join('');
        }

        // Melee weapons datalist
        const meleeList = document.getElementById('datalist-weapons-melee');
        if (meleeList && this.data.weapons) {
            const melee = (this.data.weapons.weapons?.melee || [])
                .concat(this.data.weapons.weapons?.exotic || [])
                .filter(w => w.type === 'melee' || !w.range);
            meleeList.innerHTML = melee.map(w =>
                `<option value="${this.esc(w.name)}">`
            ).join('');
        }

        // Ranged weapons datalist
        const rangedList = document.getElementById('datalist-weapons-ranged');
        if (rangedList && this.data.weapons) {
            const ranged = this.data.weapons.weapons?.ranged || [];
            rangedList.innerHTML = ranged.map(w =>
                `<option value="${this.esc(w.name)}">`
            ).join('');
        }
    },

    // =========================================================================
    // Character CRUD
    // =========================================================================

    getDefaultChar() {
        const ch = {
            id: this.genId(),
            name: '',
            player: '',
            concept: '',
            totalXP: 600,
            xpSpent: 0,
            race: null,
            raceCharBonus: null,
            exaltation: null,
            alignment: null,
            devotion: 0,
            characteristics: {
                strength: 1, dexterity: 1, constitution: 1,
                charisma: 1, fellowship: 1, composure: 1,
                intelligence: 1, wisdom: 1, willpower: 1
            },
            charSpecialties: {},
            skills: {},
            skillSpecialties: {},
            classes: [],
            classNotes: '',
            powerStat: 1,
            resourceCurrent: 0,
            exaltationNotes: '',
            magicSchools: {
                abjuration: 0, conjuration: 0, divination: 0,
                enchantment: 0, evocation: 0, healing: 0,
                illusion: 0, necromancy: 0, transmutation: 0
            },
            bonusSchoolLevels: {},
            spells: [],
            fettered: false,
            pushAmount: 0,
            extraSchoolLevels: 0,
            sanctioned: true,
            swordSchools: {
                desertWind: 0, devotedSpirit: 0, diamondMind: 0,
                ironHeart: 0, settingSun: 0, shadowHand: 0,
                stoneDragon: 0, tigerClaw: 0, whiteRaven: 0
            },
            gunKata: {
                clayPigeon: 0, crisisZone: 0, elementalGearbolt: 0,
                pointBlank: 0, silentScope: 0, tinStar: 0
            },
            specialAttacks: [],
            armor: [],
            aura: 0,
            auraSource: '',
            naturalArmor: 0,
            meleeWeapons: [],
            rangedWeapons: [],
            feats: [],
            assets: [],
            hindrances: [],
            backgrounds: [],
            backgroundNotes: {},
            heroPointsMax: 2,
            heroPointsCurrent: 2,
            heroPointsBurnt: 0,
            languages: ['Trade'],
            equipment: '',
            notes: '',
            height: '',
            weight: '',
            age: '',
            description: '',
            savedPools: [],
            modifiers: {
                staticDefense: 0, hitPoints: 0, mentalDefense: 0,
                resolve: 0, speed: 0, resilience: 0, initiative: 0
            },
            currentHP: 0,
            currentResolve: 0
        };

        // Initialize skills from loaded data
        if (this.data.skills) {
            const groups = this.data.skills.skills || {};
            for (const cat of Object.values(groups)) {
                for (const sk of cat) {
                    ch.skills[sk.id] = 0;
                }
            }
        }

        return ch;
    },

    createCharacter() {
        const ch = this.getDefaultChar();
        this.char = ch;
        this.charId = ch.id;
        this.charList.push({ id: ch.id, name: ch.name || 'New Character' });
        this.saveCharList();
        this.saveCharacter();
        this.renderAll();
    },

    loadCharacter(id) {
        try {
            const raw = localStorage.getItem(this.STORAGE_PREFIX + id);
            if (raw) {
                this.char = JSON.parse(raw);
                // Merge with defaults for any missing fields
                const def = this.getDefaultChar();
                this.char = this.mergeDefaults(this.char, def);
                this.char.id = id;
                // Migrate old psychicStrength field
                if (this.char.psychicStrength && !this.char.hasOwnProperty('fettered')) {
                    this.char.fettered = this.char.psychicStrength === 'fettered';
                    delete this.char.psychicStrength;
                }
                // Migrate old keyed-object backgrounds to array format
                if (this.char.backgrounds && !Array.isArray(this.char.backgrounds)) {
                    const oldBgs = this.char.backgrounds;
                    const oldNotes = this.char.backgroundNotes || {};
                    this.char.backgrounds = [];
                    for (const [id, dots] of Object.entries(oldBgs)) {
                        if (dots > 0) {
                            const name = id.charAt(0).toUpperCase() + id.slice(1);
                            this.char.backgrounds.push({ name, dots, notes: oldNotes[id] || '' });
                        }
                    }
                    delete this.char.backgroundNotes;
                }
                // Migrate globalPush → extraSchoolLevels
                if (this.char.hasOwnProperty('globalPush') && !this.char.hasOwnProperty('extraSchoolLevels')) {
                    this.char.extraSchoolLevels = this.char.globalPush || 0;
                    delete this.char.globalPush;
                }
            } else {
                this.char = this.getDefaultChar();
                this.char.id = id;
            }
        } catch (e) {
            console.error('Failed to load character:', e);
            this.char = this.getDefaultChar();
            this.char.id = id;
        }
        this.charId = id;
        this.renderAll();
    },

    saveCharacter() {
        if (!this.char) return;
        try {
            localStorage.setItem(this.STORAGE_PREFIX + this.charId, JSON.stringify(this.char));
            // Update name in char list
            const entry = this.charList.find(c => c.id === this.charId);
            if (entry) {
                entry.name = this.char.name || 'Unnamed';
                this.saveCharList();
            }
            this.showSaveStatus('saved');
        } catch (e) {
            console.error('Failed to save:', e);
            this.showSaveStatus('error');
        }
    },

    deleteCharacter(id) {
        if (!id) return;
        if (this.charList.length <= 1) {
            alert('Cannot delete the last character. Create a new one first.');
            return;
        }
        if (!confirm('Delete this character permanently?')) return;

        localStorage.removeItem(this.STORAGE_PREFIX + id);
        this.charList = this.charList.filter(c => c.id !== id);
        this.saveCharList();

        // Switch to first remaining
        this.loadCharacter(this.charList[0].id);
    },

    loadCharList() {
        try {
            const raw = localStorage.getItem(this.STORAGE_LIST_KEY);
            this.charList = raw ? JSON.parse(raw) : [];
        } catch (e) {
            this.charList = [];
        }
    },

    saveCharList() {
        localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(this.charList));
    },

    switchCharacter(id) {
        if (id === this.charId) return;
        this.saveCharacter();
        this.loadCharacter(id);
    },

    mergeDefaults(obj, defaults) {
        const result = { ...defaults };
        for (const key of Object.keys(defaults)) {
            if (obj.hasOwnProperty(key)) {
                if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
                    result[key] = this.mergeDefaults(obj[key] || {}, defaults[key]);
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

    genId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    // =========================================================================
    // Auto-save
    // =========================================================================

    scheduleAutoSave() {
        this.showSaveStatus('saving');
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveCharacter(), this.AUTOSAVE_DELAY);
    },

    showSaveStatus(state) {
        const el = document.getElementById('save-status');
        if (!el) return;
        el.className = 'save-status no-print ' + state;
        el.textContent = state === 'saving' ? 'Saving...' : state === 'saved' ? 'Saved' : 'Error';
    },

    // =========================================================================
    // Derived Statistics
    // =========================================================================

    calculateDerived() {
        const c = this.getEffChars();
        const size = this.getRaceSize();
        const level = this.getLevel();
        const mods = this.char.modifiers || {};

        const d = {};

        // Static Defense: 10 + (Dex + Wis) × 3 − (Size × 2)
        // Halfling variant: 10 + Dex × 6 − Size × 2
        if (this.char.race === 'halfling') {
            d.sdBase = 10 + c.dexterity * 6 - size * 2;
        } else {
            d.sdBase = 10 + (c.dexterity + c.wisdom) * 3 - size * 2;
        }
        d.sdMod = mods.staticDefense || 0;
        d.sd = d.sdBase + d.sdMod;

        // Hit Points: (Con + Wil) × 2
        d.hpBase = (c.constitution + c.willpower) * 2;
        d.hpMod = mods.hitPoints || 0;
        d.hp = d.hpBase + d.hpMod;

        // Mental Defense: 5 + (Composure × 5)
        d.mdBase = 5 + c.composure * 5;
        d.mdMod = mods.mentalDefense || 0;
        d.md = d.mdBase + d.mdMod;

        // Resolve: Willpower + Composure
        d.resolveBase = c.willpower + c.composure;
        d.resolveMod = mods.resolve || 0;
        d.resolve = d.resolveBase + d.resolveMod;

        // Speed: Strength + Dexterity
        d.speedBase = c.strength + c.dexterity;
        d.speedMod = mods.speed || 0;
        d.speed = d.speedBase + d.speedMod;
        d.runSpeed = d.speed * 6;

        // Resilience: ceil((Size + Level) / 2) + 1
        d.resilienceBase = Math.ceil((size + level) / 2) + 1;
        d.resilienceMod = mods.resilience || 0;
        d.resilience = d.resilienceBase + d.resilienceMod;

        // Initiative: Dexterity + Composure
        d.initBase = c.dexterity + c.composure;
        d.initMod = mods.initiative || 0;
        d.init = d.initBase + d.initMod;

        d.size = size;
        d.level = level;

        // Resource max
        d.resourceMax = this.getResourceMax(c);

        this.derived = d;
        return d;
    },

    getEffChars() {
        const base = this.char.characteristics || {};
        const racialBonus = {};

        // Apply chosen racial bonus
        if (this.char.race && this.char.raceCharBonus && this.data.races) {
            racialBonus[this.char.raceCharBonus] = 1;
        }

        const result = {};
        for (const id of Object.keys(this.CHAR_NAMES)) {
            result[id] = (base[id] || 1) + (racialBonus[id] || 0);
        }
        return result;
    },

    getRaceSize() {
        if (!this.char.race || !this.data.races) return 4;
        const race = (this.data.races.races || []).find(r => r.id === this.char.race);
        return race ? race.size : 4;
    },

    getLevel() {
        if (!this.char.classes || this.char.classes.length === 0) return 1;
        return Math.max(1, ...this.char.classes.map(c => c.level || 1));
    },

    getResourceMax(chars) {
        if (!this.char.exaltation || !this.data.exaltations) return 0;
        const exalt = (this.data.exaltations.exaltations || []).find(e => e.id === this.char.exaltation);
        if (!exalt || !exalt.resourceStat) return 0;

        const formula = exalt.resourceStat.formula || '';
        const ps = this.char.powerStat || 1;
        const c = chars || this.getEffChars();
        const level = this.getLevel();

        // Parse common formulas
        // "5 × Blood Potency" → 5 * powerStat
        // "Willpower + Level + (2 × Feral Heart)" → wil + level + 2*ps
        // "Charisma + Intelligence + (2 × Gnosis)" → cha + int + 2*ps
        // etc.
        if (formula.includes('5') && formula.includes(exalt.powerStat.name)) {
            return 5 * ps;
        }
        if (formula.includes('Willpower') && formula.includes('Level')) {
            return (c.willpower || 1) + level + 2 * ps;
        }
        if (formula.includes('Charisma') && formula.includes('Intelligence')) {
            return (c.charisma || 1) + (c.intelligence || 1) + 2 * ps;
        }
        if (formula.includes('Fellowship') && formula.includes('Composure')) {
            return (c.fellowship || 1) + (c.composure || 1) + 2 * ps;
        }
        if (formula.includes('Constitution') && formula.includes('Willpower')) {
            return (c.constitution || 1) + (c.willpower || 1) + 2 * ps;
        }
        if (formula.includes('Wisdom') && formula.includes('Composure')) {
            return (c.wisdom || 1) + (c.composure || 1) + 2 * ps;
        }
        if (formula.includes('Intelligence') && formula.includes('Willpower')) {
            return (c.intelligence || 1) + (c.willpower || 1) + 2 * ps;
        }

        // Fallback: try power stat * 5
        return ps * 5;
    },

    // =========================================================================
    // Derived Stats Display Update (targeted DOM updates)
    // =========================================================================

    updateDerivedDisplay() {
        const d = this.calculateDerived();
        const c = this.char;

        // Derived stats in panel cards
        this.setText('base-sd', d.sdBase);
        this.setText('eff-sd', d.sd);
        this.setVal('mod-sd', d.sdMod);

        this.setText('base-hp', d.hpBase);
        this.setText('eff-hp', d.hp);
        this.setVal('mod-hp', d.hpMod);

        this.setText('base-md', d.mdBase);
        this.setText('eff-md', d.md);
        this.setVal('mod-md', d.mdMod);

        this.setText('base-resolve', d.resolveBase);
        this.setText('eff-resolve', d.resolve);
        this.setVal('mod-resolve', d.resolveMod);

        this.setText('base-speed', d.speedBase);
        this.setText('eff-speed', d.speed);
        this.setVal('mod-speed', d.speedMod);
        this.setText('disp-run-speed', d.runSpeed);

        this.setText('base-resilience', d.resilienceBase);
        this.setText('eff-resilience', d.resilience);
        this.setVal('mod-resilience', d.resilienceMod);

        this.setText('base-init', d.initBase);
        this.setText('eff-init', d.init);
        this.setVal('mod-init', d.initMod);

        this.setText('disp-size', d.size);

        // Update SD formula for Halfling variant
        const sdFormulaEl = document.getElementById('formula-sd');
        if (sdFormulaEl) {
            sdFormulaEl.textContent = this.char.race === 'halfling'
                ? '10 + Dex × 6 − Size × 2'
                : '10 + (Dex + Wis) × 3 − Size × 2';
        }

        // Header
        this.setText('disp-level', d.level);
        this.setText('disp-xp-left', (c.totalXP || 600) - (c.xpSpent || 0));
        this.setVal('header-xp-spent', c.xpSpent ?? 0);
        this.setText('disp-hp-max', d.hp);
        this.setText('disp-resolve-max', d.resolve);
        this.setText('disp-resource-max', d.resourceMax);
        this.setText('disp-hero-max', Math.max(0, (c.heroPointsMax || 2) - (c.heroPointsBurnt || 0)));

        // Resource name
        const exalt = this.getExaltData();
        const resName = exalt?.resourceStat?.name || 'Resource';
        this.setText('disp-resource-name', resName);

        // Wound status
        this.updateWoundStatus(d.hp, c.currentHP);
    },

    updateWoundStatus(maxHP, currentHP) {
        const el = document.getElementById('wound-status');
        const descEl = document.getElementById('wound-description');
        if (!el) return;

        const cur = currentHP ?? 0;
        const max = maxHP || 1;
        const hpLost = Math.max(0, max - cur);
        const eff = this.getEffChars();
        const willpower = eff.willpower || 1;
        const con = eff.constitution || 1;

        let status, cssClass, description;

        if (hpLost <= 0) {
            status = 'Healthy';
            cssClass = 'wound-status wound-ok';
            description = 'No Hit Points lost.';
        } else if (cur <= 0) {
            status = 'Critical — 0 HP';
            cssClass = 'wound-status wound-critical';
            description = 'At 0 HP, further hits cause Critical Damage. Consult Critical Effects Tables by hit location and damage type. Critical Damage does not heal naturally — requires medical attention (1 point/week with rest and care).';
        } else if (hpLost <= willpower) {
            status = 'Lightly Wounded';
            cssClass = 'wound-status wound-light';
            description = `HP lost (${hpLost}) ≤ Willpower (${willpower}). Recover 1 HP/day naturally, or ${con} HP/day with full bed rest.`;
        } else {
            status = 'Heavily Wounded';
            cssClass = 'wound-status wound-heavy';
            description = `HP lost (${hpLost}) > Willpower (${willpower}). Recover 1 HP/week naturally, or ${con} HP/week with full rest. Becomes Lightly Wounded when HP lost ≤ ${willpower}.`;
        }

        el.textContent = status;
        el.className = cssClass;
        if (descEl) descEl.textContent = description;
    },


    // =========================================================================
    // Full Rendering
    // =========================================================================

    renderDerivedStat(label, formulaText, baseId, modId, modField, effId, formulaId) {
        const d = this.derived || {};
        const c = this.char;
        const mod = c.modifiers?.[modField] ?? 0;
        return `
            <div class="stat-entry">
                <span class="stat-name">${label}</span>
                ${formulaId ? `<span class="stat-formula" id="${formulaId}">${formulaText}</span>` : `<span class="stat-formula">${formulaText}</span>`}
                <div class="stat-row">
                    <span class="stat-base" id="${baseId}">0</span>
                    <span class="stat-op">+</span>
                    <input type="number" class="stat-modifier" data-mod="${modField}" id="${modId}" value="${mod}" title="Manual modifier">
                    <span class="stat-op">=</span>
                    <span class="stat-value" id="${effId}">0</span>
                </div>
            </div>
        `;
    },

    renderAll() {
        this.renderCharSelect();
        this.renderIdentity();
        this.renderStats();
        this.renderCombat();
        this.renderPowers();
        this.renderFeatures();
        this.calculateDerived();
        this.updateDerivedDisplay();
        this.updateHeaderTrackers();
    },

    updateHeaderTrackers() {
        const c = this.char;
        document.getElementById('char-name').value = c.name || '';
        const totalXpEl = document.getElementById('header-total-xp');
        if (totalXpEl && document.activeElement !== totalXpEl) {
            totalXpEl.value = c.totalXP ?? 600;
        }
        const spentXpEl = document.getElementById('header-xp-spent');
        if (spentXpEl && document.activeElement !== spentXpEl) {
            spentXpEl.value = c.xpSpent ?? 0;
        }
        document.getElementById('track-hp').value = c.currentHP ?? 0;
        document.getElementById('track-resource').value = c.resourceCurrent ?? 0;
        document.getElementById('track-resolve').value = c.currentResolve ?? 0;
        document.getElementById('track-hero').value = c.heroPointsCurrent ?? 2;
    },

    renderCharSelect() {
        const sel = document.getElementById('char-select');
        if (!sel) return;
        sel.innerHTML = this.charList.map(c =>
            `<option value="${c.id}" ${c.id === this.charId ? 'selected' : ''}>${this.esc(c.name || 'Unnamed')}</option>`
        ).join('');
    },

    // =========================================================================
    // Identity Tab
    // =========================================================================

    renderIdentity() {
        const panel = document.getElementById('panel-identity');
        if (!panel) return;
        const c = this.char;

        // Race options
        const races = this.data.races?.races || [];
        const raceOpts = races.map(r =>
            `<option value="${r.id}" ${c.race === r.id ? 'selected' : ''}>${this.esc(r.name)}</option>`
        ).join('');

        // Exaltation options
        const exalts = this.data.exaltations?.exaltations || [];
        const exaltOpts = exalts.map(e =>
            `<option value="${e.id}" ${c.exaltation === e.id ? 'selected' : ''}>${this.esc(e.name)}</option>`
        ).join('');

        // Alignment options
        const alignments = this.data.alignments?.alignments || [];
        const alignOpts = alignments.map(a =>
            `<option value="${a.id}" ${c.alignment === a.id ? 'selected' : ''}>${this.esc(a.name)}</option>`
        ).join('');

        panel.innerHTML = `
            <div class="section-card">
                <h3>Identity & Core Info</h3>
                <div class="field-row">
                    <div class="field-group field-group--wide">
                        <label>Name</label>
                        <input type="text" data-field="name" value="${this.esc(c.name)}" placeholder="Character name">
                    </div>
                    <div class="field-group">
                        <label>Player</label>
                        <input type="text" data-field="player" value="${this.esc(c.player)}" placeholder="Player name">
                    </div>
                </div>
                <div class="field-row">
                    <div class="field-group field-group--wide">
                        <label>Concept</label>
                        <input type="text" data-field="concept" value="${this.esc(c.concept)}" placeholder="Character concept">
                    </div>
                    <div class="field-group field-group--narrow">
                        <label>Size</label>
                        <span class="inline-stat-value" id="disp-size">${this.getRaceSize()}</span>
                    </div>
                </div>
                <div class="field-row">
                    <div class="field-group field-group--narrow">
                        <label>Height</label>
                        <input type="text" data-field="height" value="${this.esc(c.height)}" placeholder="e.g. 1.8m">
                    </div>
                    <div class="field-group field-group--narrow">
                        <label>Weight</label>
                        <input type="text" data-field="weight" value="${this.esc(c.weight)}" placeholder="e.g. 75kg">
                    </div>
                    <div class="field-group field-group--narrow">
                        <label>Age</label>
                        <input type="text" data-field="age" value="${this.esc(c.age)}" placeholder="e.g. 30">
                    </div>
                </div>
                <div class="field-row">
                    <div class="field-group field-group--wide">
                        <label>Description</label>
                        <textarea data-field="description" rows="2" placeholder="Appearance, personality, distinguishing features...">${this.esc(c.description)}</textarea>
                    </div>
                </div>
                <div class="field-row" style="margin-top:var(--space-sm)">
                    <div class="field-group">
                        <label>Languages</label>
                        <div id="languages-list">${this.renderLanguages()}</div>
                        <button class="btn btn-secondary btn-sm btn-add" data-action="add-language" style="margin-top:var(--space-xs)">+ Add Language</button>
                    </div>
                </div>
            </div>

            <div class="section-card">
                <h3>Race</h3>
                <div class="field-row">
                    <div class="field-group">
                        <label>Race</label>
                        <select data-field="race">
                            <option value="">-- Select Race --</option>
                            ${raceOpts}
                        </select>
                    </div>
                    ${this.renderRaceBonusChoice()}
                </div>
                <div id="race-info">${this.renderRaceInfo()}</div>
            </div>

            <div class="section-card">
                <h3>Exaltation</h3>
                <div class="field-row">
                    <div class="field-group">
                        <label>Exaltation</label>
                        <select data-field="exaltation">
                            <option value="">-- Select Exaltation --</option>
                            ${exaltOpts}
                        </select>
                    </div>
                </div>
                <div id="exaltation-info">${this.renderExaltInfo()}</div>
            </div>

            <div class="section-card">
                <h3>Alignment</h3>
                <div class="field-row">
                    <div class="field-group">
                        <label>Alignment</label>
                        <select data-field="alignment">
                            <option value="">-- Select Alignment --</option>
                            ${alignOpts}
                        </select>
                    </div>
                    <div class="field-group field-group--narrow">
                        <label>Devotion</label>
                        <input type="number" data-field="devotion" value="${c.devotion ?? 0}" min="0" max="10">
                    </div>
                </div>
                <div id="alignment-info">${this.renderAlignmentInfo()}</div>
            </div>
        `;
    },

    renderRaceBonusChoice() {
        if (!this.char.race) return '';
        const race = (this.data.races?.races || []).find(r => r.id === this.char.race);
        if (!race || !race.charBonus?.options) return '';

        const opts = race.charBonus.options.map(id =>
            `<option value="${id}" ${this.char.raceCharBonus === id ? 'selected' : ''}>${this.CHAR_NAMES[id] || id}</option>`
        ).join('');

        return `
            <div class="field-group">
                <label>Racial Bonus (${this.esc(race.charBonus.description || '+1')})</label>
                <select data-field="raceCharBonus">
                    <option value="">-- Choose --</option>
                    ${opts}
                </select>
            </div>
        `;
    },

    renderRaceInfo() {
        if (!this.char.race) return '';
        const race = (this.data.races?.races || []).find(r => r.id === this.char.race);
        if (!race) return '';

        const skillBonuses = (race.skillBonus || []).map(s => `${s.skill}: +${s.value}`).join(', ');
        return `
            <div class="info-box">
                <h4>${this.esc(race.name)}</h4>
                <p><span class="info-label">Size:</span> ${race.size}</p>
                <p><span class="info-label">Languages:</span> ${(race.languages || []).join(', ')}</p>
                ${skillBonuses ? `<p><span class="info-label">Skill Bonuses:</span> ${skillBonuses}</p>` : ''}
                ${race.power ? `<p><span class="info-label">${this.esc(race.power.name)}:</span> ${this.esc(race.power.description)}</p>` : ''}
            </div>
        `;
    },

    renderExaltInfo() {
        const exalt = this.getExaltData();
        if (!exalt) return '';

        const psName = exalt.powerStat?.name || 'Power Stat';
        const resName = exalt.resourceStat?.name || null;
        const recovery = exalt.resourceStat?.recovery || '';

        let html = `<div class="info-box"><h4>${this.esc(exalt.name)}</h4>`;
        html += `<p>${this.esc(exalt.description)}</p>`;
        if (exalt.powerStat) html += `<p><span class="info-label">Power Stat:</span> ${this.esc(psName)}</p>`;
        if (resName) {
            html += `<p><span class="info-label">Resource:</span> ${this.esc(resName)} (${this.esc(exalt.resourceStat.formula || '')})</p>`;
            if (recovery) html += `<p><span class="info-label">Recovery:</span> ${this.esc(recovery)}</p>`;
        }
        if (exalt.tell) html += `<p><span class="info-label">Tell:</span> ${this.esc(exalt.tell)}</p>`;

        // Static powers
        if (exalt.staticPowers?.length) {
            html += '<ul>';
            for (const p of exalt.staticPowers) {
                html += `<li><strong>${this.esc(p.name)}</strong>: ${this.esc(p.description)}</li>`;
            }
            html += '</ul>';
        }

        // Progression
        if (exalt.progression?.length) {
            html += `<p class="info-label" style="margin-top:var(--space-sm)">Progression:</p><ul>`;
            for (const p of exalt.progression) {
                html += `<li><strong>${p.dots}:</strong> ${this.esc(p.name)} — ${this.esc(p.description)}</li>`;
            }
            html += '</ul>';
        }

        html += '</div>';
        return html;
    },

    renderAlignmentInfo() {
        if (!this.char.alignment) return '';
        const align = (this.data.alignments?.alignments || []).find(a => a.id === this.char.alignment);
        if (!align) return '';

        const pantheonKey = align.pantheon;
        const pantheonName = this.data.alignments?.pantheons?.[pantheonKey]?.name || pantheonKey || '';

        let html = `<div class="info-box"><h4>${this.esc(align.name)}</h4>`;
        if (pantheonName) html += `<p><span class="info-label">Pantheon:</span> ${this.esc(pantheonName)}</p>`;
        html += `<p>${this.esc(align.description || '')}</p>`;

        if (align.commandments?.length) {
            html += '<p class="info-label">Commandments:</p><ul>';
            for (const cmd of align.commandments) {
                html += `<li>${this.esc(cmd)}</li>`;
            }
            html += '</ul>';
        }

        // Sin table (collapsible)
        if (align.sins?.length) {
            html += `<details class="sin-table-details">
                <summary class="info-label" style="cursor:pointer;margin-top:var(--space-sm)">Sin Table</summary>
                <table class="sin-table">
                    <thead><tr><th>Devotion</th><th>Sin</th></tr></thead>
                    <tbody>`;
            for (const entry of align.sins) {
                const highlight = this.char.devotion && entry.devotion === this.char.devotion ? ' class="sin-current"' : '';
                html += `<tr${highlight}><td>${entry.devotion}</td><td>${this.esc(entry.sin)}</td></tr>`;
            }
            html += `</tbody></table></details>`;
        }

        html += '</div>';
        return html;
    },

    renderResourceSpendingHelper() {
        const rpUses = this.data.exaltations?.resourcePointUses || [];
        if (rpUses.length === 0 && !this.char.exaltation) return '';

        let html = `<details class="spending-helper">
            <summary class="info-label" style="cursor:pointer">Resource Point Uses</summary>
            <div class="spending-helper-body">`;

        if (rpUses.length > 0) {
            html += '<ul>';
            for (const use of rpUses) {
                html += `<li><strong>${use.cost} RP:</strong> ${this.esc(use.effect)}</li>`;
            }
            html += '</ul>';
        }

        const notes = this.data.exaltations?.notes;
        if (notes?.tell) {
            html += `<p style="font-size:0.75rem;color:var(--text-dim);margin-top:var(--space-xs)">${this.esc(notes.tell)}</p>`;
        }

        html += '</div></details>';
        return html;
    },

    // =========================================================================
    // Stats Tab (Characteristics + Skills)
    // =========================================================================

    renderStats() {
        const panel = document.getElementById('panel-stats');
        if (!panel) return;

        panel.innerHTML = `
            <div class="section-card">
                <h3>Characteristics</h3>
                <div class="char-grid">${this.renderCharGroups()}</div>
            </div>
            <div class="section-card">
                <h3>Skills</h3>
                <div class="skill-grid">${this.renderSkillGroups()}</div>
            </div>
            <div class="section-card">
                <h3>Mental Defense & Resolve</h3>
                <div class="derived-stats-grid">
                    ${this.renderDerivedStat('Mental Defense', '5 + Com × 5', 'base-md', 'mod-md', 'mentalDefense', 'eff-md')}
                    ${this.renderDerivedStat('Resolve', 'Wil + Com', 'base-resolve', 'mod-resolve', 'resolve', 'eff-resolve')}
                </div>
            </div>
            <div class="section-card">
                <h3>Pool Calculator</h3>
                <div class="pool-calc-grid">
                    <div class="pool-calc-field">
                        <label>Characteristic</label>
                        <select id="pool-calc-char" class="pool-calc-select">
                            <option value="">—</option>
                            ${Object.entries(this.CHAR_NAMES).map(([id, name]) => `<option value="${id}">${name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="pool-calc-field">
                        <label>+ Char</label>
                        <input type="number" id="pool-calc-char-bonus" class="dot-input" value="0" min="0" title="Additional dice added to characteristic (e.g. from feats)">
                    </div>
                    <div class="pool-calc-field">
                        <label>Skill</label>
                        <select id="pool-calc-skill" class="pool-calc-select">
                            <option value="">—</option>
                            ${this.getSkillOptions()}
                        </select>
                    </div>
                    <div class="pool-calc-field">
                        <label>+ Skill</label>
                        <input type="number" id="pool-calc-skill-bonus" class="dot-input" value="0" min="0" title="Additional dice added to skill (e.g. from racial bonus, equipment)">
                    </div>
                    <div class="pool-calc-field">
                        <label>Flat</label>
                        <input type="number" id="pool-calc-flat" class="dot-input" value="0" min="0" title="Flat bonus added to result (e.g. +1)">
                    </div>
                    <div class="pool-calc-field pool-calc-specialty">
                        <label>
                            <input type="checkbox" id="pool-calc-spec"> Specialty
                        </label>
                    </div>
                </div>
                <div class="pool-calc-result" id="pool-calc-result">—</div>
                <div class="pool-calc-specialty-hint" id="pool-calc-spec-hint" style="display:none">
                    <em>Specialty:</em> Reroll any 1s that come up on the Test roll (attack only, not damage).
                </div>
                <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-xs)">
                    <input type="text" id="pool-calc-label" placeholder="Label (optional)" style="flex:1;font-size:0.85rem">
                    <button class="btn btn-secondary btn-sm" data-action="save-pool">Save</button>
                </div>
                <div class="pool-saved-list" id="pool-saved-list">${this.renderSavedPools()}</div>
            </div>
        `;
    },

    renderCharGroups() {
        const eff = this.getEffChars();
        let html = '';

        for (const [groupId, group] of Object.entries(this.CHAR_GROUPS)) {
            html += `<div class="char-group"><h4>${group.label}</h4>`;
            for (const charId of group.chars) {
                const base = this.char.characteristics[charId] || 1;
                const total = eff[charId];
                const hasRacialBonus = this.char.raceCharBonus === charId;
                const spec = this.char.charSpecialties?.[charId] || '';

                html += `
                    <div class="char-entry">
                        <span class="char-label">${this.CHAR_NAMES[charId]} <span class="char-abbrev">(${this.CHAR_ABBREV[charId]})</span></span>
                        <input type="number" class="dot-input" min="1" max="6" value="${base}" data-char="${charId}">
                        ${hasRacialBonus ? '<span class="char-racial">+1</span>' : ''}
                        <span class="char-total">${total}</span>
                    </div>
                    ${total >= 4 ? `<input type="text" class="specialty-field" placeholder="Specialty" data-char-spec="${charId}" value="${this.esc(spec)}">` : ''}
                `;
            }
            html += '</div>';
        }
        return html;
    },

    getRacialSkillBonuses() {
        if (!this.char.race || !this.data.races) return {};
        const race = (this.data.races.races || []).find(r => r.id === this.char.race);
        if (!race || !race.skillBonus) return {};
        const bonuses = {};
        for (const sb of race.skillBonus) {
            bonuses[sb.skill] = (bonuses[sb.skill] || 0) + sb.value;
        }
        return bonuses;
    },

    renderSkillGroups() {
        const skillData = this.data.skills?.skills || {};
        const racialBonuses = this.getRacialSkillBonuses();
        let html = '';

        for (const [groupId, skills] of Object.entries(skillData)) {
            const groupLabel = groupId.charAt(0).toUpperCase() + groupId.slice(1);
            html += `<div class="skill-group"><h4>${groupLabel}</h4>`;

            for (const sk of skills) {
                const val = this.char.skills?.[sk.id] ?? 0;
                const racialBonus = racialBonuses[sk.id] || 0;
                const spec = this.char.skillSpecialties?.[sk.id] || '';
                const advBadge = sk.advanced ? '<span class="skill-adv">ADV</span>' : '';
                const racialBadge = racialBonus > 0 ? `<span class="char-racial">+${racialBonus}</span>` : '';
                const effVal = val + racialBonus;

                html += `
                    <div class="skill-entry">
                        <span class="skill-label">${this.esc(sk.name)}</span>
                        ${advBadge}
                        <input type="number" class="dot-input" min="0" max="6" value="${val}" data-skill="${sk.id}">
                        ${racialBadge}
                    </div>
                    ${effVal >= 4 ? `<input type="text" class="specialty-field" placeholder="Specialty" data-skill-spec="${sk.id}" value="${this.esc(spec)}">` : ''}
                `;
            }
            html += '</div>';
        }
        return html;
    },

    getSkillOptions() {
        const skillData = this.data.skills?.skills || {};
        let opts = '';
        for (const [groupId, skills] of Object.entries(skillData)) {
            for (const sk of skills) {
                opts += `<option value="${sk.id}">${this.esc(sk.name)}</option>`;
            }
        }
        return opts;
    },

    updatePoolCalcResult() {
        const charSel = document.getElementById('pool-calc-char');
        const skillSel = document.getElementById('pool-calc-skill');
        const charBonusInput = document.getElementById('pool-calc-char-bonus');
        const skillBonusInput = document.getElementById('pool-calc-skill-bonus');
        const flatInput = document.getElementById('pool-calc-flat');
        const specCheck = document.getElementById('pool-calc-spec');
        const specHint = document.getElementById('pool-calc-spec-hint');
        const resultEl = document.getElementById('pool-calc-result');
        if (!charSel || !resultEl) return;

        const charId = charSel.value;
        if (!charId) { resultEl.textContent = '—'; if (specHint) specHint.style.display = 'none'; return; }

        const eff = this.getEffChars();
        const charVal = eff[charId] || 1;
        const charBonus = parseInt(charBonusInput?.value) || 0;
        const skillVal = this.char.skills?.[skillSel?.value] ?? 0;
        const racialBonuses = this.getRacialSkillBonuses();
        const racialBonus = racialBonuses[skillSel?.value] || 0;
        const skillBonus = parseInt(skillBonusInput?.value) || 0;
        const flat = parseInt(flatInput?.value) || 0;

        const kept = charVal + charBonus;
        const rolled = kept + skillVal + racialBonus + skillBonus;
        const flatStr = flat > 0 ? `+${flat}` : '';
        const specActive = specCheck?.checked;

        let text = `${rolled}k${kept}${flatStr}`;
        if (specActive) text += ' (reroll 1s)';
        resultEl.textContent = text;

        if (specHint) specHint.style.display = specActive ? 'block' : 'none';
    },

    renderSavedPools() {
        const pools = this.char.savedPools || [];
        if (pools.length === 0) return '';
        return pools.map((p, i) => `
            <div class="pool-saved-entry">
                <span class="pool-saved-label">${this.esc(p.label || p.formula)}</span>
                <span class="pool-saved-value">${this.esc(p.pool)}</span>
                <button class="btn-remove" data-action="remove-pool" data-index="${i}">&times;</button>
            </div>
        `).join('');
    },

    // =========================================================================
    // Combat Tab
    // =========================================================================

    renderCombat() {
        const panel = document.getElementById('panel-combat');
        if (!panel) return;
        const c = this.char;

        panel.innerHTML = `
            <div class="section-card">
                <h3>Armor & Defense</h3>
                <div class="derived-stats-grid">
                    ${this.renderDerivedStat('Static Defense', this.char.race === 'halfling' ? '10 + Dex × 6 − Size × 2' : '10 + (Dex + Wis) × 3 − Size × 2', 'base-sd', 'mod-sd', 'staticDefense', 'eff-sd', 'formula-sd')}
                    ${this.renderDerivedStat('Hit Points', '(Con + Wil) × 2', 'base-hp', 'mod-hp', 'hitPoints', 'eff-hp')}
                    ${this.renderDerivedStat('Resilience', '⌈(Size + Level) / 2⌉ + 1', 'base-resilience', 'mod-resilience', 'resilience', 'eff-resilience')}
                </div>
                <div class="wound-status" id="wound-status">Healthy</div>
                <div class="wound-description" id="wound-description">No Hit Points lost.</div>
                <div class="subsection-divider"></div>
                <div class="field-row">
                    <div class="field-group field-group--narrow">
                        <label>Aura</label>
                        <input type="number" data-field="aura" value="${c.aura ?? 0}" min="0">
                    </div>
                    <div class="field-group">
                        <label>Aura Source</label>
                        <input type="text" data-field="auraSource" value="${this.esc(c.auraSource)}" placeholder="e.g., Force Field, Spell">
                    </div>
                    <div class="field-group field-group--narrow">
                        <label>Natural Armor</label>
                        <input type="number" data-field="naturalArmor" value="${c.naturalArmor ?? 0}" min="0">
                    </div>
                </div>
                <div class="armor-locations" id="armor-locations">${this.renderArmorLocations()}</div>
                <div id="armor-list">${this.renderArmorList()}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-armor">+ Add Armor</button>
            </div>

            <div class="section-card">
                <h3>Speed & Initiative</h3>
                <div class="derived-stats-grid">
                    ${this.renderDerivedStat('Speed', 'Str + Dex', 'base-speed', 'mod-speed', 'speed', 'eff-speed')}
                    ${this.renderDerivedStat('Initiative', 'Dex + Com', 'base-init', 'mod-init', 'initiative', 'eff-init')}
                </div>
                <div class="derived-sub">Run: <span id="disp-run-speed">${(this.derived?.runSpeed) || 12}</span>m (Speed × 6)</div>
                <div class="derived-hint">Initiative Roll: 1d10 + Dex + Com</div>
            </div>

            <div class="section-card">
                <h3>Melee Weapons</h3>
                <div id="melee-list">${this.renderMeleeList()}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-melee">+ Add Melee Weapon</button>
            </div>

            <div class="section-card">
                <h3>Ranged Weapons</h3>
                <div id="ranged-list">${this.renderRangedList()}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-ranged">+ Add Ranged Weapon</button>
            </div>
        `;
    },

    renderArmorLocations() {
        // Calculate effective AP per location from armor list + natural armor
        const locs = {};
        for (const loc of this.LOCATIONS) locs[loc] = 0;

        for (const a of (this.char.armor || [])) {
            const ap = parseInt(a.ap) || 0;
            const covered = a.locations || [];
            for (const loc of covered) {
                if (locs.hasOwnProperty(loc)) {
                    locs[loc] = Math.max(locs[loc], ap);
                }
            }
        }

        const natArmor = parseInt(this.char.naturalArmor) || 0;

        return this.LOCATIONS.map(loc => {
            const wornAP = locs[loc];
            const totalAP = wornAP + natArmor;
            const breakdown = natArmor > 0 ? ` title="${wornAP} worn + ${natArmor} natural"` : '';
            return `<div class="armor-loc">
                <span class="loc-name">${loc}</span>
                <span class="loc-ap"${breakdown}>${totalAP}</span>
            </div>`;
        }).join('');
    },

    renderArmorList() {
        const items = this.char.armor || [];
        if (items.length === 0) return '<p class="text-muted" style="font-size:0.85rem">No armor equipped.</p>';

        let html = `<table class="list-table">
            <thead><tr>
                <th>Name</th><th class="col-medium">Type</th><th class="col-narrow">AP</th>
                <th class="col-narrow">Max Dex</th><th>Locations</th><th>Special</th><th class="col-actions"></th>
            </tr></thead><tbody>`;

        items.forEach((a, i) => {
            const typeOpts = this.ARMOR_TYPES.map(t =>
                `<option value="${t}" ${a.type === t ? 'selected' : ''}>${t}</option>`
            ).join('');
            const locChecks = this.LOCATIONS.map(loc => {
                const checked = (a.locations || []).includes(loc) ? 'checked' : '';
                return `<label style="font-size:0.7rem;display:inline-flex;align-items:center;gap:2px;margin-right:4px"><input type="checkbox" data-armor-loc="${i}" data-loc="${loc}" ${checked}>${loc.replace(/(Left|Right)\s/, (m,p)=>p[0]+' ')}</label>`;
            }).join('');

            html += `<tr>
                <td><input type="text" data-armor="${i}" data-prop="name" value="${this.esc(a.name || '')}"></td>
                <td><select data-armor="${i}" data-prop="type">${typeOpts}</select></td>
                <td><input type="number" data-armor="${i}" data-prop="ap" value="${a.ap ?? 0}" min="0" class="col-narrow"></td>
                <td><input type="number" data-armor="${i}" data-prop="maxDex" value="${a.maxDex ?? ''}" min="0" class="col-narrow"></td>
                <td style="font-size:0.75rem">${locChecks}</td>
                <td><input type="text" data-armor="${i}" data-prop="special" value="${this.esc(a.special || '')}" placeholder="Special qualities"></td>
                <td class="col-actions"><button class="btn-remove" data-action="remove-armor" data-index="${i}">&times;</button></td>
            </tr>`;
        });

        html += '</tbody></table>';
        return html;
    },

    renderMeleeList() {
        const items = this.char.meleeWeapons || [];
        if (items.length === 0) return '<p class="text-muted" style="font-size:0.85rem">No melee weapons.</p>';

        const eff = this.getEffChars();
        let html = `<table class="list-table weapon-table">
            <thead><tr>
                <th>Name</th><th class="col-narrow">Type</th><th class="col-medium">Prof</th>
                <th class="col-medium">Test</th><th class="col-medium">Damage</th><th class="col-narrow">Dmg Type</th>
                <th class="col-narrow">Pen</th><th class="col-medium">Avail</th><th>Special</th>
                <th class="col-medium">Total Dmg</th><th class="col-actions"></th>
            </tr></thead><tbody>`;

        items.forEach((w, i) => {
            const dmgStr = w.damage || '';
            const parsed = DTD.dice.parseNotation(dmgStr);
            let totalDmg = dmgStr;
            if (parsed) {
                totalDmg = `${parsed.num + eff.strength}k${parsed.keep}`;
            }

            const typeOpts = this.WEAPON_TYPES_MELEE.map(t =>
                `<option value="${t}" ${w.weaponType === t ? 'selected' : ''}>${t}</option>`
            ).join('');
            const profOpts = this.PROFICIENCY_MELEE.map(p =>
                `<option value="${p}" ${w.proficiency === p ? 'selected' : ''}>${p}</option>`
            ).join('');
            const dmgTypeOpts = this.DAMAGE_TYPES.map(t =>
                `<option value="${t}" ${w.damageType === t ? 'selected' : ''}>${t}</option>`
            ).join('');
            const availOpts = this.AVAILABILITY.map(a =>
                `<option value="${a}" ${w.availability === a ? 'selected' : ''}>${a}</option>`
            ).join('');

            html += `<tr>
                <td><input type="text" data-melee="${i}" data-prop="name" value="${this.esc(w.name || '')}" list="datalist-weapons-melee"></td>
                <td><select data-melee="${i}" data-prop="weaponType">${typeOpts}</select></td>
                <td><select data-melee="${i}" data-prop="proficiency"><option value="">—</option>${profOpts}</select></td>
                <td><input type="text" data-melee="${i}" data-prop="test" value="${this.esc(w.test || '')}" placeholder="XkY" class="col-medium"></td>
                <td><input type="text" data-melee="${i}" data-prop="damage" value="${this.esc(w.damage || '')}" placeholder="XkY" class="col-medium"></td>
                <td><select data-melee="${i}" data-prop="damageType"><option value="">—</option>${dmgTypeOpts}</select></td>
                <td><input type="number" data-melee="${i}" data-prop="pen" value="${w.pen ?? 0}" min="0" class="col-narrow"></td>
                <td><select data-melee="${i}" data-prop="availability"><option value="">—</option>${availOpts}</select></td>
                <td><input type="text" data-melee="${i}" data-prop="special" value="${this.esc(w.special || '')}" placeholder="Qualities"></td>
                <td class="text-accent" style="font-weight:600">${totalDmg}</td>
                <td class="col-actions"><button class="btn-remove" data-action="remove-melee" data-index="${i}">&times;</button></td>
            </tr>`;
        });

        html += '</tbody></table>';
        return html;
    },

    renderRangedList() {
        const items = this.char.rangedWeapons || [];
        if (items.length === 0) return '<p class="text-muted" style="font-size:0.85rem">No ranged weapons.</p>';

        let html = `<table class="list-table weapon-table">
            <thead><tr>
                <th>Name</th><th class="col-narrow">Type</th><th class="col-medium">Prof</th>
                <th class="col-medium">Test</th><th class="col-medium">Damage</th><th class="col-narrow">Dmg Type</th>
                <th class="col-narrow">Pen</th><th class="col-narrow">ROF</th><th class="col-narrow">Range</th>
                <th class="col-narrow">Clip</th><th class="col-narrow">Reload</th>
                <th class="col-medium">Avail</th><th>Special</th><th class="col-actions"></th>
            </tr></thead><tbody>`;

        items.forEach((w, i) => {
            const typeOpts = this.WEAPON_TYPES_RANGED.map(t =>
                `<option value="${t}" ${w.weaponType === t ? 'selected' : ''}>${t}</option>`
            ).join('');
            const profOpts = this.PROFICIENCY_RANGED.map(p =>
                `<option value="${p}" ${w.proficiency === p ? 'selected' : ''}>${p}</option>`
            ).join('');
            const dmgTypeOpts = this.DAMAGE_TYPES.map(t =>
                `<option value="${t}" ${w.damageType === t ? 'selected' : ''}>${t}</option>`
            ).join('');
            const availOpts = this.AVAILABILITY.map(a =>
                `<option value="${a}" ${w.availability === a ? 'selected' : ''}>${a}</option>`
            ).join('');

            html += `<tr>
                <td><input type="text" data-ranged="${i}" data-prop="name" value="${this.esc(w.name || '')}" list="datalist-weapons-ranged"></td>
                <td><select data-ranged="${i}" data-prop="weaponType"><option value="">—</option>${typeOpts}</select></td>
                <td><select data-ranged="${i}" data-prop="proficiency"><option value="">—</option>${profOpts}</select></td>
                <td><input type="text" data-ranged="${i}" data-prop="test" value="${this.esc(w.test || '')}" placeholder="XkY" class="col-medium"></td>
                <td><input type="text" data-ranged="${i}" data-prop="damage" value="${this.esc(w.damage || '')}" placeholder="XkY" class="col-medium"></td>
                <td><select data-ranged="${i}" data-prop="damageType"><option value="">—</option>${dmgTypeOpts}</select></td>
                <td><input type="number" data-ranged="${i}" data-prop="pen" value="${w.pen ?? 0}" min="0" class="col-narrow"></td>
                <td><input type="text" data-ranged="${i}" data-prop="rof" value="${this.esc(w.rof || '')}" class="col-narrow"></td>
                <td><input type="number" data-ranged="${i}" data-prop="range" value="${w.range ?? ''}" min="0" class="col-narrow"></td>
                <td><input type="number" data-ranged="${i}" data-prop="clip" value="${w.clip ?? ''}" min="0" class="col-narrow"></td>
                <td><input type="text" data-ranged="${i}" data-prop="reload" value="${this.esc(w.reload || '')}" class="col-narrow"></td>
                <td><select data-ranged="${i}" data-prop="availability"><option value="">—</option>${availOpts}</select></td>
                <td><input type="text" data-ranged="${i}" data-prop="special" value="${this.esc(w.special || '')}"></td>
                <td class="col-actions"><button class="btn-remove" data-action="remove-ranged" data-index="${i}">&times;</button></td>
            </tr>`;
        });

        html += '</tbody></table>';
        return html;
    },

    // =========================================================================
    // Powers Tab
    // =========================================================================

    renderPowers() {
        const panel = document.getElementById('panel-powers');
        if (!panel) return;
        const c = this.char;

        const exalt = this.getExaltData();
        const psName = exalt?.powerStat?.name || 'Power Stat';
        const resName = exalt?.resourceStat?.name || 'Resource';

        panel.innerHTML = `
            <div class="section-card">
                <h3>Exaltation, Resource & Hero Points</h3>
                <div class="field-row">
                    <div class="field-group field-group--narrow">
                        <label>${this.esc(psName)}</label>
                        <input type="number" data-field="powerStat" value="${c.powerStat ?? 1}" min="1" max="5">
                    </div>
                    <div class="field-group field-group--narrow">
                        <label>Limit/Round</label>
                        <span class="spend-limit-display">${c.powerStat ?? 1} ${this.esc(resName)}/round</span>
                    </div>
                </div>
                ${this.renderResourceSpendingHelper()}
                <div class="subsection-divider"></div>
                <h4 style="color:var(--accent);margin:var(--space-sm) 0">Hero Points</h4>
                <div class="hero-points-section">
                    <div class="field-group field-group--narrow">
                        <label>Max</label>
                        <input type="number" data-field="heroPointsMax" value="${c.heroPointsMax ?? 2}" min="0">
                    </div>
                    <div class="field-group field-group--narrow">
                        <label>Burnt</label>
                        <input type="number" data-field="heroPointsBurnt" value="${c.heroPointsBurnt ?? 0}" min="0">
                    </div>
                    <div class="field-group field-group--narrow">
                        <label>Effective Max</label>
                        <input type="number" value="${Math.max(0, (c.heroPointsMax || 2) - (c.heroPointsBurnt || 0))}" readonly tabindex="-1" style="opacity:0.7">
                    </div>
                </div>
                <details class="spending-helper">
                    <summary class="info-label" style="cursor:pointer">Spending & Burning</summary>
                    <div class="spending-helper-body">
                        <p class="info-label" style="margin-bottom:2px">Spend 1 Hero Point (Free Action):</p>
                        <ul>
                            <li>Reroll a failed Test (final)</li>
                            <li>Reduce TN by 5 (before rolling)</li>
                            <li>Add an extra Raise to a success</li>
                            <li>Count as rolling 10 for Initiative</li>
                            <li>Instantly recover from Stunned</li>
                        </ul>
                        <p class="info-label" style="margin-bottom:2px">Burn 1 Hero Point (permanent):</p>
                        <ul><li>Survive what would have killed you</li></ul>
                        <p style="font-size:0.75rem;color:var(--text-dim);margin-top:var(--space-xs)">Spent points refresh at session start. Burnt points are gone forever.</p>
                    </div>
                </details>
                <div class="subsection-divider"></div>
                <div class="field-row">
                    <div class="field-group">
                        <label>Exaltation Powers & Notes</label>
                        <textarea data-field="exaltationNotes" rows="3" placeholder="Special powers, Paradox counter, War-Form notes...">${this.esc(c.exaltationNotes)}</textarea>
                    </div>
                </div>
            </div>

            <div class="section-card">
                <h3>Magic Schools</h3>
                <div class="toggle-row">
                    <label>
                        <input type="checkbox" data-field="fettered" ${c.fettered ? 'checked' : ''}>
                        Fettered <span class="text-muted" style="font-size:0.75rem">(halve rolled dice, round up; kept reduced if needed)</span>
                    </label>
                    <label>
                        <input type="checkbox" data-field="sanctioned" ${c.sanctioned ? 'checked' : ''}>
                        Sanctioned
                    </label>
                </div>
                <div class="toggle-row">
                    <label>Push:
                        <input type="number" class="dot-input" min="0" value="${c.pushAmount ?? 0}" data-field="pushAmount" title="Increase effective school levels" style="width:50px;margin-left:4px">
                    </label>
                    <label>Extra School Levels:
                        <input type="number" class="dot-input" min="0" value="${c.extraSchoolLevels ?? 0}" data-field="extraSchoolLevels" title="Flat bonus to ALL school levels (replaces per-school bonus)" style="width:50px;margin-left:4px">
                    </label>
                </div>
                <div class="school-grid" id="magic-schools">${this.renderMagicSchools()}</div>
            </div>

            <div class="section-card">
                <h3>Spells Known</h3>
                <div id="spells-list">${this.renderSpellsList()}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-spell">+ Add Spell</button>
            </div>

            <div class="section-card">
                <h3>Sword Schools <span class="text-muted" style="font-size:0.8rem;font-weight:normal">Martial Adept Level: <strong id="disp-martial-level">${this.getMartialLevel()}</strong></span></h3>
                <div class="school-grid" id="sword-schools">${this.renderSchoolDots(this.SWORD_SCHOOLS, 'swordSchools')}</div>
            </div>

            <div class="section-card">
                <h3>Gun Kata <span class="text-muted" style="font-size:0.8rem;font-weight:normal">Gunslinger Level: <strong id="disp-gunslinger-level">${this.getGunslingerLevel()}</strong></span></h3>
                <div class="school-grid" id="gun-kata">${this.renderSchoolDots(this.GUN_KATA, 'gunKata')}</div>
            </div>

            <div class="section-card">
                <h3>Special Attacks / Trick Shots</h3>
                <div id="special-attacks-list">${this.renderSpecialAttacks()}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-special-attack">+ Add Special Attack</button>
            </div>
        `;
    },

    renderMagicSchools() {
        const c = this.char;
        const eff = this.getEffChars();
        const level = this.getLevel();
        const extraSchoolLevels = c.extraSchoolLevels ?? 0;
        const pushAmount = c.pushAmount ?? 0;
        const isFettered = c.fettered ?? false;

        return this.MAGIC_SCHOOLS.map(school => {
            const dots = c.magicSchools?.[school.id] ?? 0;
            const perSchoolBonus = c.bonusSchoolLevels?.[school.id] ?? 0;
            const bonusUsed = extraSchoolLevels > 0 ? extraSchoolLevels : perSchoolBonus;
            const effLevel = dots + bonusUsed + pushAmount;
            const charVal = eff[school.char] || 1;

            let pool = '—';
            if (effLevel > 0) {
                let rolled = effLevel + charVal;
                let kept = charVal;
                if (isFettered) {
                    rolled = Math.ceil(rolled / 2);
                    kept = Math.min(kept, rolled);
                }
                pool = `${rolled}k${kept}`;
            }

            const bonusDisabled = extraSchoolLevels > 0 ? 'disabled style="opacity:0.4;width:36px;font-size:0.78rem"' : '';

            return `
                <div class="school-entry">
                    <span class="school-name">${school.name}</span>
                    <span class="school-char">${this.CHAR_ABBREV[school.char]}</span>
                    <input type="number" class="dot-input" min="0" max="${level}" value="${dots}" data-magic="${school.id}" title="School dots (max: Level ${level})">
                    <input type="number" class="school-bonus" min="0" value="${perSchoolBonus}" data-magic-bonus="${school.id}" title="Bonus levels (e.g., Atlantean)" ${bonusDisabled}>
                    <span class="school-pool">${pool}</span>
                </div>
            `;
        }).join('');
    },

    renderSchoolDots(schools, fieldGroup) {
        const vals = this.char[fieldGroup] || {};
        return schools.map(school => {
            const dots = vals[school.id] ?? 0;
            return `
                <div class="school-entry">
                    <span class="school-name">${school.name}</span>
                    <input type="number" class="dot-input" min="0" max="5" value="${dots}" data-school="${fieldGroup}.${school.id}">
                </div>
            `;
        }).join('');
    },

    getMartialLevel() {
        const vals = this.char.swordSchools || {};
        return Math.max(0, ...Object.values(vals));
    },

    getGunslingerLevel() {
        const vals = this.char.gunKata || {};
        return Math.max(0, ...Object.values(vals));
    },

    renderSpellsList() {
        const spells = this.char.spells || [];
        if (spells.length === 0) return '<p class="text-muted" style="font-size:0.85rem">No spells known.</p>';

        const schoolOpts = this.MAGIC_SCHOOLS.map(s =>
            `<option value="${s.id}">${s.name}</option>`
        ).join('');

        let html = `<table class="list-table">
            <thead><tr>
                <th>School</th><th class="col-narrow">Level</th><th>Name</th><th>Notes</th><th class="col-actions"></th>
            </tr></thead><tbody>`;

        spells.forEach((sp, i) => {
            const opts = this.MAGIC_SCHOOLS.map(s =>
                `<option value="${s.id}" ${sp.school === s.id ? 'selected' : ''}>${s.name}</option>`
            ).join('');

            html += `<tr>
                <td><select data-spell="${i}" data-prop="school">${opts}</select></td>
                <td><input type="number" data-spell="${i}" data-prop="level" value="${sp.level ?? 1}" min="1" max="5" class="col-narrow"></td>
                <td><input type="text" data-spell="${i}" data-prop="name" value="${this.esc(sp.name || '')}"></td>
                <td><input type="text" data-spell="${i}" data-prop="notes" value="${this.esc(sp.notes || '')}" placeholder="Effect summary"></td>
                <td class="col-actions"><button class="btn-remove" data-action="remove-spell" data-index="${i}">&times;</button></td>
            </tr>`;
        });

        html += '</tbody></table>';
        return html;
    },

    renderSpecialAttacks() {
        const items = this.char.specialAttacks || [];
        if (items.length === 0) return '<p class="text-muted" style="font-size:0.85rem">No special attacks.</p>';

        let html = `<table class="list-table">
            <thead><tr><th>Name</th><th>Description</th><th class="col-actions"></th></tr></thead><tbody>`;

        items.forEach((sa, i) => {
            html += `<tr>
                <td><input type="text" data-special-attack="${i}" data-prop="name" value="${this.esc(sa.name || '')}"></td>
                <td><input type="text" data-special-attack="${i}" data-prop="description" value="${this.esc(sa.description || '')}"></td>
                <td class="col-actions"><button class="btn-remove" data-action="remove-special-attack" data-index="${i}">&times;</button></td>
            </tr>`;
        });

        html += '</tbody></table>';
        return html;
    },

    // =========================================================================
    // Features Tab
    // =========================================================================

    renderFeatures() {
        const panel = document.getElementById('panel-features');
        if (!panel) return;
        const c = this.char;

        panel.innerHTML = `
            <div class="section-card">
                <h3>Classes</h3>
                <div id="classes-list">${this.renderClassesList()}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-class">+ Add Class</button>
                <div class="field-row" style="margin-top:var(--space-sm)">
                    <div class="field-group">
                        <label>Class Notes (completion bonuses, etc.)</label>
                        <textarea data-field="classNotes" rows="2">${this.esc(c.classNotes)}</textarea>
                    </div>
                </div>
            </div>

            <div class="section-card">
                <h3>Feats</h3>
                <div id="feats-list">${this.renderNameNotesList('feats')}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-feat">+ Add Feat</button>
            </div>

            <div class="section-card">
                <h3>Assets</h3>
                <div id="assets-list">${this.renderNameNotesList('assets')}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-asset">+ Add Asset</button>
            </div>

            <div class="section-card">
                <h3>Hindrances</h3>
                <div id="hindrances-list">${this.renderNameNotesList('hindrances')}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-hindrance">+ Add Hindrance</button>
            </div>

            <div class="section-card">
                <h3>Backgrounds <span class="bg-total" id="bg-total">${this.renderBgTotal()}</span></h3>
                <div class="bg-grid" id="bg-list">${this.renderBackgrounds()}</div>
                <button class="btn btn-secondary btn-sm btn-add" data-action="add-background" style="margin-top:var(--space-xs)">+ Add Background</button>
            </div>

            <div class="section-card">
                <h3>Equipment</h3>
                <textarea data-field="equipment" rows="5" placeholder="Inventory, gear, items...">${this.esc(c.equipment)}</textarea>
            </div>

            <div class="section-card">
                <h3>Notes</h3>
                <textarea data-field="notes" rows="5" placeholder="Backstory, session notes, miscellaneous...">${this.esc(c.notes)}</textarea>
            </div>
        `;
    },

    renderClassesList() {
        const items = this.char.classes || [];
        if (items.length === 0) return '<p class="text-muted" style="font-size:0.85rem">No classes taken.</p>';

        const classes = this.data.classes?.classes || [];

        let html = '';

        items.forEach((entry, i) => {
            const classOpts = classes.map(cls =>
                `<option value="${cls.id}" ${entry.classId === cls.id ? 'selected' : ''}>${this.esc(cls.name)} (L${cls.level})</option>`
            ).join('');

            const cls = classes.find(cl => cl.id === entry.classId);

            html += `<div class="class-row">
                <div class="class-row-header">
                    <select data-class="${i}" data-prop="classId"><option value="">-- Select --</option>${classOpts}</select>
                    <input type="number" data-class="${i}" data-prop="level" value="${entry.level ?? 1}" min="1" max="5" class="dot-input" style="width:50px">
                    <button class="btn-remove" data-action="remove-class" data-index="${i}">&times;</button>
                </div>
                ${cls ? this.renderClassDetails(cls) : ''}
            </div>`;
        });

        return html;
    },

    renderClassDetails(cls) {
        const chars = (cls.characteristics || []).join(', ');
        const skills = (cls.skills || []).join(', ');

        let featsHtml = '';
        if (cls.feats?.length) {
            featsHtml = '<ul class="class-feat-list">' + cls.feats.map(f => {
                const suffix = (f.type === 'optional' || f.type === 'mandatory-choice') ? ' *' : '';
                return `<li>${this.esc(f.name)}${suffix}</li>`;
            }).join('') + '</ul><p class="feat-legend">* = optional</p>';
        }

        const swordSchools = (cls.swordSchools || []).join(', ');
        const magicSchools = (cls.magicSchools || []).join(', ');
        const gunKata = (cls.gunKata || []).join(', ');

        let html = `<details class="class-details">
            <summary>Class Details</summary>
            <div class="class-details-body">`;

        if (chars) html += `<p><span class="info-label">Characteristics:</span> ${this.esc(chars)}</p>`;
        if (skills) html += `<p><span class="info-label">Skills:</span> ${this.esc(skills)}</p>`;
        if (featsHtml) html += `<div><span class="info-label">Feats:</span>${featsHtml}</div>`;
        if (swordSchools) html += `<p><span class="info-label">Sword Schools:</span> ${this.esc(swordSchools)}</p>`;
        if (magicSchools) html += `<p><span class="info-label">Magic Schools:</span> ${this.esc(magicSchools)}</p>`;
        if (gunKata) html += `<p><span class="info-label">Gun Kata:</span> ${this.esc(gunKata)}</p>`;
        if (cls.completionBonus) html += `<p><span class="info-label">Completion:</span> ${this.esc(cls.completionBonus)}</p>`;
        if (cls.suggestedExits?.length) html += `<p><span class="info-label">Exits:</span> ${this.esc(cls.suggestedExits.join(', '))}</p>`;

        html += `</div></details>`;
        return html;
    },

    renderNameNotesList(listName) {
        const items = this.char[listName] || [];
        if (items.length === 0) return `<p class="text-muted" style="font-size:0.85rem">None added.</p>`;

        const useDatalist = listName === 'feats' ? ' list="datalist-feats"' : '';

        let html = `<table class="list-table">
            <thead><tr><th>Name</th><th>Notes</th><th class="col-actions"></th></tr></thead><tbody>`;

        items.forEach((item, i) => {
            html += `<tr>
                <td><input type="text" data-list="${listName}" data-index="${i}" data-prop="name" value="${this.esc(item.name || '')}"${useDatalist}></td>
                <td><input type="text" data-list="${listName}" data-index="${i}" data-prop="notes" value="${this.esc(item.notes || '')}" placeholder="Effect / source"></td>
                <td class="col-actions"><button class="btn-remove" data-action="remove-${listName}" data-index="${i}">&times;</button></td>
            </tr>`;
        });

        html += '</tbody></table>';
        return html;
    },

    renderBackgrounds() {
        const items = this.char.backgrounds || [];
        if (items.length === 0) return '<p class="text-muted" style="font-size:0.85rem">No backgrounds added.</p>';

        let html = '';
        items.forEach((bg, i) => {
            html += `
                <div class="bg-entry">
                    <input type="text" class="bg-name-input" placeholder="Background name" data-bg-name="${i}" value="${this.esc(bg.name || '')}">
                    <input type="number" class="dot-input" min="0" max="5" value="${bg.dots ?? 0}" data-bg-dots="${i}">
                    <input type="text" class="bg-notes-input" placeholder="Details..." data-bg-notes="${i}" value="${this.esc(bg.notes || '')}">
                    <button class="btn-remove" data-action="remove-background" data-index="${i}">&times;</button>
                </div>
            `;
        });
        return html;
    },

    renderBgTotal() {
        const items = this.char.backgrounds || [];
        let total = 0;
        for (const bg of items) {
            const dots = bg.dots || 0;
            for (let d = 1; d <= dots; d++) {
                total += d >= 4 ? 2 : 1;
            }
        }
        return `<span class="budget-display ${total > 7 ? 'over-budget' : ''}"><span class="budget-count">${total}</span> / 7 dots spent</span>`;
    },

    renderLanguages() {
        const langs = this.char.languages || ['Trade'];
        if (langs.length === 0) return '<p class="text-muted" style="font-size:0.85rem">No languages.</p>';

        let html = '<div class="field-row" style="flex-wrap:wrap;gap:var(--space-xs)">';
        langs.forEach((lang, i) => {
            html += `
                <div style="display:flex;align-items:center;gap:4px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:2px 6px;">
                    <input type="text" data-language="${i}" value="${this.esc(lang)}" style="border:none;background:transparent;width:100px;padding:2px;font-size:0.85rem;color:var(--text)">
                    <button class="btn-remove" data-action="remove-language" data-index="${i}" style="font-size:0.8rem">&times;</button>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    // =========================================================================
    // Event Binding
    // =========================================================================

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Character management bar
        document.getElementById('char-select')?.addEventListener('change', (e) => {
            this.switchCharacter(e.target.value);
        });
        document.getElementById('btn-new')?.addEventListener('click', () => this.createCharacter());
        document.getElementById('btn-delete')?.addEventListener('click', () => this.deleteCharacter(this.charId));
        document.getElementById('btn-export')?.addEventListener('click', () => this.exportJSON());
        document.getElementById('btn-import')?.addEventListener('click', () => {
            document.getElementById('file-import')?.click();
        });
        document.getElementById('file-import')?.addEventListener('change', (e) => {
            if (e.target.files[0]) this.importFromFile(e.target.files[0]);
            e.target.value = '';
        });

        // Header name
        document.getElementById('char-name')?.addEventListener('input', (e) => {
            this.char.name = e.target.value;
            this.scheduleAutoSave();
            this.renderCharSelect();
        });

        // Header trackers
        for (const [id, field] of [['track-hp', 'currentHP'], ['track-resource', 'resourceCurrent'], ['track-resolve', 'currentResolve'], ['track-hero', 'heroPointsCurrent']]) {
            document.getElementById(id)?.addEventListener('input', (e) => {
                this.char[field] = parseInt(e.target.value) || 0;
                if (field === 'currentHP') this.updateWoundStatus(this.derived.hp, this.char.currentHP);
                this.scheduleAutoSave();
            });
        }

        // Header Total XP input
        document.getElementById('header-total-xp')?.addEventListener('input', (e) => {
            this.char.totalXP = parseInt(e.target.value) || 0;
            this.setText('disp-xp-left', (this.char.totalXP || 600) - (this.char.xpSpent || 0));
            this.scheduleAutoSave();
        });

        // Header XP Spent input
        document.getElementById('header-xp-spent')?.addEventListener('input', (e) => {
            this.char.xpSpent = parseInt(e.target.value) || 0;
            this.setText('disp-xp-left', (this.char.totalXP || 600) - (this.char.xpSpent || 0));
            this.scheduleAutoSave();
        });

        // Delegated event handling for panels
        document.querySelector('.tab-panels')?.addEventListener('input', (e) => this.handlePanelInput(e));
        document.querySelector('.tab-panels')?.addEventListener('change', (e) => this.handlePanelChange(e));
        document.querySelector('.tab-panels')?.addEventListener('click', (e) => this.handlePanelClick(e));
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-panel').forEach(p => {
            p.classList.toggle('active', p.dataset.tab === tabName);
        });
    },

    // =========================================================================
    // Delegated Event Handlers
    // =========================================================================

    handlePanelInput(e) {
        const el = e.target;

        // Generic data-field inputs
        if (el.dataset.field) {
            const field = el.dataset.field;
            if (el.type === 'checkbox') {
                this.char[field] = el.checked;
            } else if (el.type === 'number') {
                this.char[field] = parseInt(el.value) || 0;
            } else {
                this.char[field] = el.value;
            }

            // Fields that affect derived stats
            if (['totalXP', 'xpSpent'].includes(field)) {
                this.setText('disp-xp-left', (this.char.totalXP || 600) - (this.char.xpSpent || 0));
                // Sync header inputs when changed from panel
                if (field === 'totalXP') {
                    const hdrEl = document.getElementById('header-total-xp');
                    if (hdrEl && document.activeElement !== hdrEl) hdrEl.value = this.char.totalXP;
                }
                if (field === 'xpSpent') {
                    const hdrEl = document.getElementById('header-xp-spent');
                    if (hdrEl && document.activeElement !== hdrEl) hdrEl.value = this.char.xpSpent;
                }
            }
            if (['powerStat'].includes(field)) {
                this.calculateDerived();
                this.updateDerivedDisplay();
            }
            if (['heroPointsMax', 'heroPointsBurnt'].includes(field)) {
                this.setText('disp-hero-max', Math.max(0, (this.char.heroPointsMax || 2) - (this.char.heroPointsBurnt || 0)));
            }
            if (['fettered', 'pushAmount', 'extraSchoolLevels'].includes(field)) {
                this.rerenderPowerSection('magic-schools', () => this.renderMagicSchools());
            }
            if (field === 'naturalArmor') {
                const container = document.getElementById('armor-locations');
                if (container) container.innerHTML = this.renderArmorLocations();
            }
            if (field === 'devotion') {
                const info = document.getElementById('alignment-info');
                if (info) info.innerHTML = this.renderAlignmentInfo();
            }
            this.scheduleAutoSave();
            return;
        }

        // Stat modifier inputs (data-mod)
        if (el.dataset.mod !== undefined) {
            const mod = el.dataset.mod;
            if (this.char.modifiers) {
                this.char.modifiers[mod] = parseInt(el.value) || 0;
                this.calculateDerived();
                this.updateDerivedDisplay();
            }
            this.scheduleAutoSave();
            return;
        }

        // Pool calculator inputs
        if (el.id?.startsWith('pool-calc-')) {
            this.updatePoolCalcResult();
            return;
        }

        // Characteristic inputs
        if (el.dataset.char !== undefined) {
            const charId = el.dataset.char;
            this.char.characteristics[charId] = Math.min(6, Math.max(1, parseInt(el.value) || 1));
            this.calculateDerived();
            this.updateDerivedDisplay();

            // Update total display next to the input
            const eff = this.getEffChars();
            const totalEl = el.closest('.char-entry')?.querySelector('.char-total');
            if (totalEl) totalEl.textContent = eff[charId];

            // Re-render stats to show/hide specialty field
            this.renderStats();
            this.scheduleAutoSave();
            return;
        }

        // Characteristic specialty
        if (el.dataset.charSpec !== undefined) {
            if (!this.char.charSpecialties) this.char.charSpecialties = {};
            this.char.charSpecialties[el.dataset.charSpec] = el.value;
            this.scheduleAutoSave();
            return;
        }

        // Skill inputs
        if (el.dataset.skill !== undefined) {
            const skillId = el.dataset.skill;
            if (!this.char.skills) this.char.skills = {};
            this.char.skills[skillId] = Math.min(6, Math.max(0, parseInt(el.value) || 0));
            // Re-render to show/hide specialty
            this.renderStats();
            this.scheduleAutoSave();
            return;
        }

        // Skill specialty
        if (el.dataset.skillSpec !== undefined) {
            if (!this.char.skillSpecialties) this.char.skillSpecialties = {};
            this.char.skillSpecialties[el.dataset.skillSpec] = el.value;
            this.scheduleAutoSave();
            return;
        }

        // Magic school dots
        if (el.dataset.magic !== undefined) {
            const id = el.dataset.magic;
            if (!this.char.magicSchools) this.char.magicSchools = {};
            this.char.magicSchools[id] = Math.min(this.getLevel(), Math.max(0, parseInt(el.value) || 0));
            this.rerenderPowerSection('magic-schools', () => this.renderMagicSchools());
            this.scheduleAutoSave();
            return;
        }

        // Magic school bonus
        if (el.dataset.magicBonus !== undefined) {
            const id = el.dataset.magicBonus;
            if (!this.char.bonusSchoolLevels) this.char.bonusSchoolLevels = {};
            this.char.bonusSchoolLevels[id] = Math.max(0, parseInt(el.value) || 0);
            this.rerenderPowerSection('magic-schools', () => this.renderMagicSchools());
            this.scheduleAutoSave();
            return;
        }

        // Sword school / gun kata dots
        if (el.dataset.school !== undefined) {
            const parts = el.dataset.school.split('.');
            const group = parts[0];
            const id = parts[1];
            if (!this.char[group]) this.char[group] = {};
            this.char[group][id] = Math.min(5, Math.max(0, parseInt(el.value) || 0));

            // Update martial/gunslinger level display
            if (group === 'swordSchools') {
                this.setText('disp-martial-level', this.getMartialLevel());
            } else {
                this.setText('disp-gunslinger-level', this.getGunslingerLevel());
            }
            this.scheduleAutoSave();
            return;
        }

        // Background name inputs
        if (el.dataset.bgName !== undefined) {
            const idx = parseInt(el.dataset.bgName);
            if (this.char.backgrounds?.[idx]) {
                this.char.backgrounds[idx].name = el.value;
            }
            this.scheduleAutoSave();
            return;
        }

        // Background dot inputs
        if (el.dataset.bgDots !== undefined) {
            const idx = parseInt(el.dataset.bgDots);
            if (this.char.backgrounds?.[idx]) {
                this.char.backgrounds[idx].dots = Math.min(5, Math.max(0, parseInt(el.value) || 0));
                // Update budget display
                const totalEl = document.getElementById('bg-total');
                if (totalEl) totalEl.innerHTML = this.renderBgTotal();
            }
            this.scheduleAutoSave();
            return;
        }

        // Background notes
        if (el.dataset.bgNotes !== undefined) {
            const idx = parseInt(el.dataset.bgNotes);
            if (this.char.backgrounds?.[idx]) {
                this.char.backgrounds[idx].notes = el.value;
            }
            this.scheduleAutoSave();
            return;
        }

        // Language inputs
        if (el.dataset.language !== undefined) {
            const idx = parseInt(el.dataset.language);
            if (!this.char.languages) this.char.languages = [];
            this.char.languages[idx] = el.value;
            this.scheduleAutoSave();
            return;
        }

        // List item inputs (feats, assets, hindrances)
        if (el.dataset.list !== undefined) {
            const listName = el.dataset.list;
            const idx = parseInt(el.dataset.index);
            const prop = el.dataset.prop;
            if (this.char[listName] && this.char[listName][idx]) {
                this.char[listName][idx][prop] = el.value;

                // Auto-populate feat description on name match
                if (listName === 'feats' && prop === 'name' && this.data.feats) {
                    const feat = (this.data.feats.feats || []).find(f => f.name === el.value);
                    if (feat && !this.char[listName][idx].notes) {
                        this.char[listName][idx].notes = feat.effect || '';
                        // Update the notes input in the same row
                        const row = el.closest('tr');
                        const notesInput = row?.querySelector('[data-prop="notes"]');
                        if (notesInput) notesInput.value = feat.effect || '';
                    }
                }
            }
            this.scheduleAutoSave();
            return;
        }

        // Weapon/armor/class/spell indexed inputs
        this.handleIndexedInput(el);
    },

    handleIndexedInput(el) {
        // Armor location checkboxes (no data-prop attribute)
        if (el.dataset.armorLoc !== undefined) {
            const idx = parseInt(el.dataset.armorLoc);
            const loc = el.dataset.loc;
            if (this.char.armor?.[idx]) {
                if (!this.char.armor[idx].locations) this.char.armor[idx].locations = [];
                const locs = this.char.armor[idx].locations;
                if (el.checked) {
                    if (!locs.includes(loc)) locs.push(loc);
                } else {
                    this.char.armor[idx].locations = locs.filter(l => l !== loc);
                }
                // Update armor location display
                const container = document.getElementById('armor-locations');
                if (container) container.innerHTML = this.renderArmorLocations();
            }
            this.scheduleAutoSave();
            return;
        }

        const prop = el.dataset.prop;
        if (!prop) return;

        // Armor
        if (el.dataset.armor !== undefined) {
            const idx = parseInt(el.dataset.armor);
            if (this.char.armor?.[idx]) {
                if (el.type === 'number') {
                    this.char.armor[idx][prop] = parseInt(el.value) || 0;
                } else {
                    this.char.armor[idx][prop] = el.value;
                }
                // Update armor location display
                const container = document.getElementById('armor-locations');
                if (container) container.innerHTML = this.renderArmorLocations();
            }
            this.scheduleAutoSave();
            return;
        }

        // Melee weapons
        if (el.dataset.melee !== undefined) {
            const idx = parseInt(el.dataset.melee);
            if (this.char.meleeWeapons?.[idx]) {
                if (el.type === 'number') {
                    this.char.meleeWeapons[idx][prop] = parseInt(el.value) || 0;
                } else {
                    this.char.meleeWeapons[idx][prop] = el.value;
                }
            }
            this.scheduleAutoSave();
            return;
        }

        // Ranged weapons
        if (el.dataset.ranged !== undefined) {
            const idx = parseInt(el.dataset.ranged);
            if (this.char.rangedWeapons?.[idx]) {
                if (el.type === 'number') {
                    this.char.rangedWeapons[idx][prop] = parseInt(el.value) || 0;
                } else {
                    this.char.rangedWeapons[idx][prop] = el.value;
                }
            }
            this.scheduleAutoSave();
            return;
        }

        // Classes
        if (el.dataset.class !== undefined) {
            const idx = parseInt(el.dataset.class);
            if (this.char.classes?.[idx]) {
                if (prop === 'level') {
                    this.char.classes[idx][prop] = parseInt(el.value) || 1;
                } else {
                    this.char.classes[idx][prop] = el.value;
                }
                // Level changes affect derived stats
                this.calculateDerived();
                this.updateDerivedDisplay();
            }
            this.scheduleAutoSave();
            return;
        }

        // Spells
        if (el.dataset.spell !== undefined) {
            const idx = parseInt(el.dataset.spell);
            if (this.char.spells?.[idx]) {
                if (prop === 'level') {
                    this.char.spells[idx][prop] = parseInt(el.value) || 1;
                } else {
                    this.char.spells[idx][prop] = el.value;
                }
            }
            this.scheduleAutoSave();
            return;
        }

        // Special attacks
        if (el.dataset.specialAttack !== undefined) {
            const idx = parseInt(el.dataset.specialAttack);
            if (this.char.specialAttacks?.[idx]) {
                this.char.specialAttacks[idx][prop] = el.value;
            }
            this.scheduleAutoSave();
            return;
        }
    },

    handlePanelChange(e) {
        const el = e.target;

        // Race change → re-render identity tab section
        if (el.dataset.field === 'race') {
            this.char.race = el.value || null;
            this.char.raceCharBonus = null;

            // Auto-seed languages from race
            if (this.char.race) {
                const race = (this.data.races?.races || []).find(r => r.id === this.char.race);
                if (race?.languages) {
                    this.char.languages = [...new Set([...race.languages])];
                }
            }

            this.renderIdentity();
            this.calculateDerived();
            this.updateDerivedDisplay();
            this.scheduleAutoSave();
            return;
        }

        // Race char bonus change
        if (el.dataset.field === 'raceCharBonus') {
            this.char.raceCharBonus = el.value || null;
            this.calculateDerived();
            this.updateDerivedDisplay();
            // Update char totals in stats tab
            this.renderStats();
            this.scheduleAutoSave();
            return;
        }

        // Exaltation change → re-render identity + powers
        if (el.dataset.field === 'exaltation') {
            this.char.exaltation = el.value || null;
            this.renderIdentity();
            this.renderPowers();
            this.calculateDerived();
            this.updateDerivedDisplay();
            this.scheduleAutoSave();
            return;
        }

        // Alignment change
        if (el.dataset.field === 'alignment') {
            this.char.alignment = el.value || null;
            // Re-render alignment info
            const info = document.getElementById('alignment-info');
            if (info) info.innerHTML = this.renderAlignmentInfo();
            this.scheduleAutoSave();
            return;
        }

        // Sanctioned checkbox
        if (el.dataset.field === 'sanctioned') {
            this.char.sanctioned = el.checked;
            this.scheduleAutoSave();
            return;
        }

        // Class dropdown changes
        if (el.dataset.class !== undefined && el.dataset.prop === 'classId') {
            const idx = parseInt(el.dataset.class);
            if (this.char.classes?.[idx]) {
                this.char.classes[idx].classId = el.value;
                // Determine level from class data
                const cls = (this.data.classes?.classes || []).find(c => c.id === el.value);
                if (cls) {
                    this.char.classes[idx].level = cls.level || 1;
                }
                this.renderFeatures();
                this.calculateDerived();
                this.updateDerivedDisplay();
            }
            this.scheduleAutoSave();
            return;
        }

        // Fallback: delegate unhandled change events (selects, checkboxes) to input handler
        this.handlePanelInput(e);

        // Pool calculator selects and specialty checkbox
        if (el.id?.startsWith('pool-calc-')) {
            this.updatePoolCalcResult();
        }
    },

    handlePanelClick(e) {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const idx = parseInt(btn.dataset.index);

        switch (action) {
            // Add actions
            case 'add-armor':
                if (!this.char.armor) this.char.armor = [];
                this.char.armor.push({ name: '', type: 'Light', ap: 0, maxDex: null, locations: [], craftsmanship: '', special: '' });
                this.rerenderCombatSection('armor-list', () => this.renderArmorList());
                break;
            case 'add-melee':
                if (!this.char.meleeWeapons) this.char.meleeWeapons = [];
                this.char.meleeWeapons.push({ name: '', damage: '', damageType: 'I', pen: 0, special: '', weaponType: 'Melee', proficiency: 'Basic', test: '', availability: 'Common' });
                this.rerenderCombatSection('melee-list', () => this.renderMeleeList());
                break;
            case 'add-ranged':
                if (!this.char.rangedWeapons) this.char.rangedWeapons = [];
                this.char.rangedWeapons.push({ name: '', damage: '', damageType: 'I', pen: 0, rof: '', range: 0, clip: 0, reload: '', special: '', weaponType: 'Basic', proficiency: 'Basic', test: '', availability: 'Common' });
                this.rerenderCombatSection('ranged-list', () => this.renderRangedList());
                break;
            case 'add-spell':
                if (!this.char.spells) this.char.spells = [];
                this.char.spells.push({ school: 'abjuration', level: 1, name: '', notes: '' });
                this.rerenderPowerSection('spells-list', () => this.renderSpellsList());
                break;
            case 'add-special-attack':
                if (!this.char.specialAttacks) this.char.specialAttacks = [];
                this.char.specialAttacks.push({ name: '', description: '' });
                this.rerenderPowerSection('special-attacks-list', () => this.renderSpecialAttacks());
                break;
            case 'add-class':
                if (!this.char.classes) this.char.classes = [];
                this.char.classes.push({ classId: '', level: 1 });
                this.rerenderFeatureSection('classes-list', () => this.renderClassesList());
                break;
            case 'add-feat':
                if (!this.char.feats) this.char.feats = [];
                this.char.feats.push({ name: '', notes: '' });
                this.rerenderFeatureSection('feats-list', () => this.renderNameNotesList('feats'));
                break;
            case 'add-asset':
                if (!this.char.assets) this.char.assets = [];
                this.char.assets.push({ name: '', notes: '' });
                this.rerenderFeatureSection('assets-list', () => this.renderNameNotesList('assets'));
                break;
            case 'add-hindrance':
                if (!this.char.hindrances) this.char.hindrances = [];
                this.char.hindrances.push({ name: '', notes: '' });
                this.rerenderFeatureSection('hindrances-list', () => this.renderNameNotesList('hindrances'));
                break;
            case 'add-language':
                if (!this.char.languages) this.char.languages = [];
                this.char.languages.push('');
                this.rerenderFeatureSection('languages-list', () => this.renderLanguages());
                break;
            case 'add-background':
                if (!this.char.backgrounds) this.char.backgrounds = [];
                this.char.backgrounds.push({ name: '', dots: 0, notes: '' });
                this.rerenderFeatureSection('bg-list', () => this.renderBackgrounds());
                break;

            case 'save-pool': {
                const charSel = document.getElementById('pool-calc-char');
                const skillSel = document.getElementById('pool-calc-skill');
                const labelInput = document.getElementById('pool-calc-label');
                const resultEl = document.getElementById('pool-calc-result');
                if (!charSel?.value) break;

                const charName = this.CHAR_ABBREV[charSel.value] || charSel.value;
                const skillName = skillSel?.value ? (this.data.skills?.skills ? Object.values(this.data.skills.skills).flat().find(s => s.id === skillSel.value)?.name || skillSel.value : skillSel.value) : '';
                const formula = skillName ? `${charName} + ${skillName}` : charName;
                const label = labelInput?.value || formula;

                if (!this.char.savedPools) this.char.savedPools = [];
                this.char.savedPools.push({ label, formula, pool: resultEl?.textContent || '—' });
                if (labelInput) labelInput.value = '';

                const listEl = document.getElementById('pool-saved-list');
                if (listEl) listEl.innerHTML = this.renderSavedPools();
                break;
            }

            case 'remove-pool':
                this.char.savedPools?.splice(idx, 1);
                const poolListEl = document.getElementById('pool-saved-list');
                if (poolListEl) poolListEl.innerHTML = this.renderSavedPools();
                break;

            // Remove actions
            case 'remove-armor':
                this.char.armor?.splice(idx, 1);
                this.rerenderCombatSection('armor-list', () => this.renderArmorList());
                document.getElementById('armor-locations').innerHTML = this.renderArmorLocations();
                break;
            case 'remove-melee':
                this.char.meleeWeapons?.splice(idx, 1);
                this.rerenderCombatSection('melee-list', () => this.renderMeleeList());
                break;
            case 'remove-ranged':
                this.char.rangedWeapons?.splice(idx, 1);
                this.rerenderCombatSection('ranged-list', () => this.renderRangedList());
                break;
            case 'remove-spell':
                this.char.spells?.splice(idx, 1);
                this.rerenderPowerSection('spells-list', () => this.renderSpellsList());
                break;
            case 'remove-special-attack':
                this.char.specialAttacks?.splice(idx, 1);
                this.rerenderPowerSection('special-attacks-list', () => this.renderSpecialAttacks());
                break;
            case 'remove-class':
                this.char.classes?.splice(idx, 1);
                this.rerenderFeatureSection('classes-list', () => this.renderClassesList());
                this.calculateDerived();
                this.updateDerivedDisplay();
                break;
            case 'remove-feats':
                this.char.feats?.splice(idx, 1);
                this.rerenderFeatureSection('feats-list', () => this.renderNameNotesList('feats'));
                break;
            case 'remove-assets':
                this.char.assets?.splice(idx, 1);
                this.rerenderFeatureSection('assets-list', () => this.renderNameNotesList('assets'));
                break;
            case 'remove-hindrances':
                this.char.hindrances?.splice(idx, 1);
                this.rerenderFeatureSection('hindrances-list', () => this.renderNameNotesList('hindrances'));
                break;
            case 'remove-language':
                this.char.languages?.splice(idx, 1);
                this.rerenderFeatureSection('languages-list', () => this.renderLanguages());
                break;
            case 'remove-background':
                this.char.backgrounds?.splice(idx, 1);
                this.rerenderFeatureSection('bg-list', () => this.renderBackgrounds());
                // Update budget
                const bgTotalEl = document.getElementById('bg-total');
                if (bgTotalEl) bgTotalEl.innerHTML = this.renderBgTotal();
                break;
        }

        this.scheduleAutoSave();
    },

    // Section re-render helpers
    rerenderCombatSection(containerId, renderFn) {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = renderFn();
    },

    rerenderPowerSection(containerId, renderFn) {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = renderFn();
    },

    rerenderFeatureSection(containerId, renderFn) {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = renderFn();
    },

    // =========================================================================
    // Import / Export
    // =========================================================================

    exportJSON() {
        if (!this.char) return;
        const name = (this.char.name || 'character').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        DTD.exportCharacterJSON(this.char, `${name}.json`);
    },

    async importFromFile(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            this.importJSON(data);
        } catch (e) {
            alert('Failed to import: ' + e.message);
        }
    },

    importJSON(data) {
        if (!data || typeof data !== 'object') return;

        // Ensure it has an ID
        if (!data.id) data.id = this.genId();

        const def = this.getDefaultChar();
        const merged = this.mergeDefaults(data, def);
        merged.id = data.id;

        this.char = merged;
        this.charId = merged.id;

        // Add to list if not present
        if (!this.charList.find(c => c.id === merged.id)) {
            this.charList.push({ id: merged.id, name: merged.name || 'Imported' });
            this.saveCharList();
        }

        this.saveCharacter();
        this.renderAll();
    },

    // =========================================================================
    // Helpers
    // =========================================================================

    esc(str) {
        if (str == null) return '';
        return DTD.escapeHtml(String(str));
    },

    setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    setVal(id, value) {
        const el = document.getElementById(id);
        if (el && document.activeElement !== el) {
            el.value = value;
        }
    },

    getExaltData() {
        if (!this.char?.exaltation || !this.data.exaltations) return null;
        return (this.data.exaltations.exaltations || []).find(e => e.id === this.char.exaltation);
    }
};

// =========================================================================
// Bootstrap
// =========================================================================

document.addEventListener('DOMContentLoaded', () => Sheet.init());
