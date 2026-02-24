/**
 * NPC Stat Block Builder
 * Manual stat block builder with auto-calculated derived stats,
 * trait system, template loading, and printable output.
 */

const NPCBuilder = {

    // =========================================================================
    // Constants
    // =========================================================================

    STORAGE_PREFIX: 'dtd_npc_',
    STORAGE_LIST_KEY: 'dtd_npc_list',

    CHAR_KEYS: ['strength', 'dexterity', 'constitution', 'charisma', 'fellowship', 'composure', 'intelligence', 'wisdom', 'willpower'],
    CHAR_ABBREV: { strength: 'Str', dexterity: 'Dex', constitution: 'Con', charisma: 'Cha', fellowship: 'Fel', composure: 'Cmp', intelligence: 'Int', wisdom: 'Wis', willpower: 'Wil' },
    CHAR_INPUTS: { strength: 'char-str', dexterity: 'char-dex', constitution: 'char-con', charisma: 'char-cha', fellowship: 'char-fel', composure: 'char-cmp', intelligence: 'char-int', wisdom: 'char-wis', willpower: 'char-wil' },

    LOCATIONS: ['Head', 'Body', 'Arms', 'Legs'],

    QUICK_SKILLS: {
        combat: [{ name: 'Weaponry', dots: 3 }, { name: 'Ballistics', dots: 3 }, { name: 'Athletics', dots: 2 }],
        social: [{ name: 'Persuasion', dots: 3 }, { name: 'Deceive', dots: 2 }, { name: 'Intimidation', dots: 2 }],
        stealth: [{ name: 'Stealth', dots: 3 }, { name: 'Larceny', dots: 2 }, { name: 'Acrobatics', dots: 2 }]
    },

    // =========================================================================
    // State
    // =========================================================================

    data: {},          // loaded JSON data
    traits: [],        // loaded traits definitions
    templates: [],     // loaded NPC templates
    skillNames: [],    // flat list of skill names from skills.json

    npc: null,         // current NPC state
    savedList: [],     // list of saved NPC ids

    // =========================================================================
    // Initialization
    // =========================================================================

    async init() {
        try {
            const [traitsData, templatesData, skillsData] = await Promise.all([
                DTD.loadData('traits.json'),
                DTD.loadData('npc-templates.json'),
                DTD.loadData('skills.json')
            ]);
            this.traits = traitsData;
            this.templates = templatesData;
            this.skillNames = this.extractSkillNames(skillsData);

            this.loadSavedList();
            this.buildUI();
            this.bindEvents();
            this.resetNPC();
            this.update();
        } catch (err) {
            console.error('NPC Builder init failed:', err);
        }
    },

    extractSkillNames(skillsData) {
        const names = [];
        if (skillsData.skills) {
            for (const cat of Object.values(skillsData.skills)) {
                for (const skill of cat) {
                    names.push(skill.name);
                }
            }
        }
        return names.sort();
    },

    // =========================================================================
    // Default NPC State
    // =========================================================================

    createDefaultNPC() {
        return {
            name: '',
            level: 1,
            size: 4,
            speed: 4,
            characteristics: { strength: 2, dexterity: 2, constitution: 2, charisma: 2, fellowship: 2, composure: 2, intelligence: 2, wisdom: 2, willpower: 2 },
            skills: [],
            feats: [],
            traits: [],        // [{ id, param? }]
            armor: [],         // [{ name, ap, locations: [] }]
            weapons: [],       // [{ name, type, damage, damageType, pen, range?, rof?, clip?, reload?, special }]
            abilities: [],     // [{ name, description }]
            gear: ''
        };
    },

    resetNPC() {
        this.npc = this.createDefaultNPC();
        this.loadNPCToForm();
    },

    // =========================================================================
    // UI Building
    // =========================================================================

    buildUI() {
        this.buildTemplateDropdown();
        this.buildSavedDropdown();
        this.buildTraitsGrid();
    },

    buildTemplateDropdown() {
        const sel = document.getElementById('template-select');
        // Group templates by category
        const categories = {};
        for (const t of this.templates) {
            const cat = t.category || 'other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(t);
        }
        const catOrder = ['mortal', 'supernatural', 'creature', 'construct', 'undead', 'other'];
        for (const cat of catOrder) {
            if (!categories[cat]) continue;
            const group = document.createElement('optgroup');
            group.label = cat.charAt(0).toUpperCase() + cat.slice(1);
            for (const t of categories[cat]) {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = `${t.name} (Lvl ${t.level})`;
                group.appendChild(opt);
            }
            sel.appendChild(group);
        }
    },

    buildSavedDropdown() {
        const sel = document.getElementById('saved-select');
        // Remove all but first option
        while (sel.options.length > 1) sel.remove(1);
        for (const id of this.savedList) {
            const raw = localStorage.getItem(this.STORAGE_PREFIX + id);
            if (!raw) continue;
            try {
                const npc = JSON.parse(raw);
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = npc.name || id;
                sel.appendChild(opt);
            } catch (_) { /* skip corrupt */ }
        }
    },

    buildTraitsGrid() {
        const grid = document.getElementById('traits-grid');
        grid.innerHTML = '';
        for (const trait of this.traits) {
            const item = document.createElement('div');
            item.className = 'trait-item';
            item.dataset.traitId = trait.id;

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = 'trait-' + trait.id;

            const lbl = document.createElement('label');
            lbl.className = 'trait-label';
            lbl.htmlFor = cb.id;
            lbl.textContent = trait.name;

            item.appendChild(cb);
            item.appendChild(lbl);

            if (trait.parameterized) {
                const inp = document.createElement('input');
                inp.type = 'text';
                inp.className = trait.paramType === 'caster' || trait.paramType === 'resource' ? 'trait-param trait-param-wide' : 'trait-param';
                inp.placeholder = trait.paramLabel || 'X';
                inp.dataset.traitId = trait.id;
                inp.disabled = true;
                item.appendChild(inp);
            }

            grid.appendChild(item);
        }
    },

    // =========================================================================
    // Event Binding
    // =========================================================================

    bindEvents() {
        // Core inputs
        document.getElementById('npc-name').addEventListener('input', () => this.onFieldChange());
        document.getElementById('npc-level').addEventListener('change', () => this.onFieldChange());
        document.getElementById('npc-size').addEventListener('input', () => this.onFieldChange());
        document.getElementById('npc-speed').addEventListener('input', () => this.onFieldChange());
        document.getElementById('gear-text').addEventListener('input', () => this.onFieldChange());

        // Characteristics
        for (const key of this.CHAR_KEYS) {
            document.getElementById(this.CHAR_INPUTS[key]).addEventListener('input', () => this.onFieldChange());
        }

        // Traits checkboxes
        document.getElementById('traits-grid').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const item = e.target.closest('.trait-item');
                const paramInput = item.querySelector('.trait-param');
                if (paramInput) paramInput.disabled = !e.target.checked;
                item.classList.toggle('active', e.target.checked);
                this.onFieldChange();
            }
        });
        document.getElementById('traits-grid').addEventListener('input', (e) => {
            if (e.target.classList.contains('trait-param')) {
                this.onFieldChange();
            }
        });

        // Add buttons
        document.getElementById('btn-add-skill').addEventListener('click', () => this.addSkillEntry());
        document.getElementById('btn-add-feat').addEventListener('click', () => this.addFeatEntry());
        document.getElementById('btn-add-armor').addEventListener('click', () => this.addArmorEntry());
        document.getElementById('btn-add-weapon').addEventListener('click', () => this.addWeaponEntry());
        document.getElementById('btn-add-ability').addEventListener('click', () => this.addAbilityEntry());

        // Quick skill buttons
        document.querySelectorAll('[data-quick-skills]').forEach(btn => {
            btn.addEventListener('click', () => {
                const pack = this.QUICK_SKILLS[btn.dataset.quickSkills];
                if (pack) {
                    for (const s of pack) this.addSkillEntry(s.name, s.dots);
                    this.onFieldChange();
                }
            });
        });

        // Delegated remove buttons
        document.querySelectorAll('.list-entries').forEach(container => {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('entry-remove')) {
                    e.target.closest('.list-entry').remove();
                    this.onFieldChange();
                }
            });
        });

        // Template loading
        document.getElementById('template-select').addEventListener('change', (e) => {
            if (!e.target.value) return;
            const tpl = this.templates.find(t => t.id === e.target.value);
            if (tpl) this.loadTemplate(tpl);
            e.target.value = '';
        });

        // Save/Load/Delete
        document.getElementById('btn-save').addEventListener('click', () => this.saveNPC());
        document.getElementById('btn-delete-saved').addEventListener('click', () => this.deleteSavedNPC());
        document.getElementById('btn-clear').addEventListener('click', () => {
            this.resetNPC();
            this.clearForm();
            this.update();
        });

        document.getElementById('saved-select').addEventListener('change', (e) => {
            if (!e.target.value) return;
            this.loadSavedNPC(e.target.value);
        });

        // Output actions
        document.getElementById('btn-copy-md').addEventListener('click', () => this.copyMarkdown());
        document.getElementById('btn-print').addEventListener('click', () => window.print());
        document.getElementById('btn-duplicate').addEventListener('click', () => this.duplicateNPC());
    },

    // =========================================================================
    // Form <-> State
    // =========================================================================

    onFieldChange() {
        this.readFormToState();
        this.update();
    },

    readFormToState() {
        const npc = this.npc;
        npc.name = document.getElementById('npc-name').value.trim();
        npc.level = parseInt(document.getElementById('npc-level').value, 10) || 1;
        npc.size = parseInt(document.getElementById('npc-size').value, 10) || 4;
        npc.speed = parseInt(document.getElementById('npc-speed').value, 10) || 0;
        npc.gear = document.getElementById('gear-text').value.trim();

        // Characteristics
        for (const key of this.CHAR_KEYS) {
            npc.characteristics[key] = parseInt(document.getElementById(this.CHAR_INPUTS[key]).value, 10) || 0;
        }

        // Skills
        npc.skills = [];
        document.querySelectorAll('#skills-list .list-entry').forEach(el => {
            const name = el.querySelector('.entry-name').value.trim();
            const dots = parseInt(el.querySelector('.entry-dots').value, 10) || 1;
            if (name) npc.skills.push({ name, dots });
        });

        // Feats
        npc.feats = [];
        document.querySelectorAll('#feats-list .list-entry').forEach(el => {
            const val = el.querySelector('.entry-name').value.trim();
            if (val) npc.feats.push(val);
        });

        // Traits
        npc.traits = [];
        document.querySelectorAll('#traits-grid .trait-item').forEach(item => {
            const cb = item.querySelector('input[type="checkbox"]');
            if (cb.checked) {
                const traitId = item.dataset.traitId;
                const paramInput = item.querySelector('.trait-param');
                const entry = { id: traitId };
                if (paramInput && paramInput.value.trim()) {
                    const pv = paramInput.value.trim();
                    entry.param = isNaN(pv) ? pv : parseFloat(pv);
                }
                npc.traits.push(entry);
            }
        });

        // Armor
        npc.armor = [];
        document.querySelectorAll('#armor-list .list-entry').forEach(el => {
            const name = el.querySelector('.armor-name').value.trim();
            const ap = parseInt(el.querySelector('.armor-ap').value, 10) || 0;
            const locations = [];
            el.querySelectorAll('.armor-locations input[type="checkbox"]').forEach(cb => {
                if (cb.checked) locations.push(cb.value);
            });
            if (name || ap) npc.armor.push({ name, ap, locations });
        });

        // Weapons
        npc.weapons = [];
        document.querySelectorAll('#weapons-list .list-entry').forEach(el => {
            const w = {
                name: el.querySelector('.weapon-name').value.trim(),
                type: el.querySelector('.weapon-type-sel').value,
                damage: el.querySelector('.weapon-damage').value.trim(),
                damageType: el.querySelector('.weapon-dtype').value.trim(),
                pen: parseInt(el.querySelector('.weapon-pen').value, 10) || 0,
                special: el.querySelector('.weapon-special').value.trim()
            };
            if (w.type === 'ranged') {
                w.range = parseInt(el.querySelector('.weapon-range').value, 10) || 0;
                w.rof = el.querySelector('.weapon-rof').value.trim();
                w.clip = el.querySelector('.weapon-clip').value.trim();
                w.reload = el.querySelector('.weapon-reload').value.trim();
            }
            if (w.name) npc.weapons.push(w);
        });

        // Abilities
        npc.abilities = [];
        document.querySelectorAll('#abilities-list .list-entry').forEach(el => {
            const name = el.querySelector('.ability-name').value.trim();
            const desc = el.querySelector('.ability-desc').value.trim();
            if (name) npc.abilities.push({ name, description: desc });
        });
    },

    loadNPCToForm() {
        const npc = this.npc;
        document.getElementById('npc-name').value = npc.name;
        document.getElementById('npc-level').value = npc.level;
        document.getElementById('npc-size').value = npc.size;
        document.getElementById('npc-speed').value = npc.speed;
        document.getElementById('gear-text').value = npc.gear || '';

        for (const key of this.CHAR_KEYS) {
            document.getElementById(this.CHAR_INPUTS[key]).value = npc.characteristics[key];
        }

        // Clear dynamic lists
        document.getElementById('skills-list').innerHTML = '';
        document.getElementById('feats-list').innerHTML = '';
        document.getElementById('armor-list').innerHTML = '';
        document.getElementById('weapons-list').innerHTML = '';
        document.getElementById('abilities-list').innerHTML = '';

        // Populate skills
        for (const s of npc.skills) this.addSkillEntry(s.name, s.dots);

        // Populate feats
        for (const f of npc.feats) this.addFeatEntry(f);

        // Populate traits
        document.querySelectorAll('#traits-grid .trait-item').forEach(item => {
            const cb = item.querySelector('input[type="checkbox"]');
            const paramInput = item.querySelector('.trait-param');
            const traitId = item.dataset.traitId;
            const match = npc.traits.find(t => t.id === traitId);
            cb.checked = !!match;
            item.classList.toggle('active', !!match);
            if (paramInput) {
                paramInput.disabled = !match;
                paramInput.value = match && match.param != null ? match.param : '';
            }
        });

        // Populate armor
        for (const a of npc.armor) this.addArmorEntry(a);

        // Populate weapons
        for (const w of npc.weapons) this.addWeaponEntry(w);

        // Populate abilities
        for (const a of npc.abilities) this.addAbilityEntry(a);
    },

    clearForm() {
        document.getElementById('npc-name').value = '';
        document.getElementById('npc-level').value = '1';
        document.getElementById('npc-size').value = '4';
        document.getElementById('npc-speed').value = '4';
        document.getElementById('gear-text').value = '';

        for (const key of this.CHAR_KEYS) {
            document.getElementById(this.CHAR_INPUTS[key]).value = '2';
        }

        document.getElementById('skills-list').innerHTML = '';
        document.getElementById('feats-list').innerHTML = '';
        document.getElementById('armor-list').innerHTML = '';
        document.getElementById('weapons-list').innerHTML = '';
        document.getElementById('abilities-list').innerHTML = '';

        document.querySelectorAll('#traits-grid .trait-item').forEach(item => {
            const cb = item.querySelector('input[type="checkbox"]');
            const paramInput = item.querySelector('.trait-param');
            cb.checked = false;
            item.classList.remove('active');
            if (paramInput) {
                paramInput.disabled = true;
                paramInput.value = '';
            }
        });
    },

    // =========================================================================
    // Dynamic Entry Builders
    // =========================================================================

    addSkillEntry(name = '', dots = 1) {
        const list = document.getElementById('skills-list');
        const el = document.createElement('div');
        el.className = 'list-entry skill-entry';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'entry-name';
        nameInput.value = name;
        nameInput.placeholder = 'Skill name';
        nameInput.setAttribute('list', 'skill-datalist');
        nameInput.addEventListener('input', () => this.onFieldChange());

        // Create datalist if not present
        if (!document.getElementById('skill-datalist')) {
            const dl = document.createElement('datalist');
            dl.id = 'skill-datalist';
            for (const s of this.skillNames) {
                const opt = document.createElement('option');
                opt.value = s;
                dl.appendChild(opt);
            }
            document.body.appendChild(dl);
        }

        const dotsInput = document.createElement('input');
        dotsInput.type = 'number';
        dotsInput.className = 'entry-dots';
        dotsInput.min = '1';
        dotsInput.max = '6';
        dotsInput.value = dots;
        dotsInput.addEventListener('input', () => this.onFieldChange());

        const removeBtn = document.createElement('button');
        removeBtn.className = 'entry-remove';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove';

        el.appendChild(nameInput);
        el.appendChild(dotsInput);
        el.appendChild(removeBtn);
        list.appendChild(el);
    },

    addFeatEntry(value = '') {
        const list = document.getElementById('feats-list');
        const el = document.createElement('div');
        el.className = 'list-entry feat-entry';

        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'entry-name';
        inp.value = value;
        inp.placeholder = 'Feat name';
        inp.addEventListener('input', () => this.onFieldChange());

        const removeBtn = document.createElement('button');
        removeBtn.className = 'entry-remove';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove';

        el.appendChild(inp);
        el.appendChild(removeBtn);
        list.appendChild(el);
    },

    addArmorEntry(data = null) {
        const list = document.getElementById('armor-list');
        const el = document.createElement('div');
        el.className = 'list-entry armor-entry';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'armor-name';
        nameInput.placeholder = 'Armor name';
        nameInput.value = data ? data.name : '';
        nameInput.addEventListener('input', () => this.onFieldChange());

        const apLabel = document.createElement('span');
        apLabel.textContent = 'AP';
        apLabel.style.fontSize = '0.8rem';
        apLabel.style.color = 'var(--text-muted)';

        const apInput = document.createElement('input');
        apInput.type = 'number';
        apInput.className = 'armor-ap';
        apInput.min = '0';
        apInput.max = '30';
        apInput.value = data ? data.ap : 0;
        apInput.addEventListener('input', () => this.onFieldChange());

        const locDiv = document.createElement('div');
        locDiv.className = 'armor-locations';

        const allLocs = ['Head', 'Body', 'Arms', 'Legs'];
        const activeLocs = data ? data.locations.map(l => l === 'All' ? allLocs : l).flat() : [];

        for (const loc of allLocs) {
            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = loc;
            cb.checked = activeLocs.includes(loc) || (data && data.locations.includes('All'));
            cb.addEventListener('change', () => this.onFieldChange());
            label.appendChild(cb);
            label.appendChild(document.createTextNode(loc));
            locDiv.appendChild(label);
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'entry-remove';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove';

        el.appendChild(nameInput);
        el.appendChild(apLabel);
        el.appendChild(apInput);
        el.appendChild(locDiv);
        el.appendChild(removeBtn);
        list.appendChild(el);
    },

    addWeaponEntry(data = null) {
        const list = document.getElementById('weapons-list');
        const el = document.createElement('div');
        el.className = 'list-entry weapon-entry';

        const row1 = document.createElement('div');
        row1.className = 'weapon-row';

        const typeSel = document.createElement('select');
        typeSel.className = 'weapon-type-sel';
        for (const t of ['melee', 'ranged']) {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
            typeSel.appendChild(opt);
        }
        typeSel.value = data ? data.type : 'melee';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'weapon-name';
        nameInput.placeholder = 'Weapon name';
        nameInput.value = data ? data.name : '';

        const dmgInput = document.createElement('input');
        dmgInput.type = 'text';
        dmgInput.className = 'weapon-damage';
        dmgInput.placeholder = 'XkY';
        dmgInput.value = data ? data.damage : '';

        const dtypeInput = document.createElement('input');
        dtypeInput.type = 'text';
        dtypeInput.className = 'weapon-dtype';
        dtypeInput.placeholder = 'E/I/R/X';
        dtypeInput.value = data ? data.damageType : '';
        dtypeInput.style.width = '55px';

        const penLabel = document.createElement('span');
        penLabel.textContent = 'Pen';
        penLabel.style.fontSize = '0.8rem';
        penLabel.style.color = 'var(--text-muted)';

        const penInput = document.createElement('input');
        penInput.type = 'number';
        penInput.className = 'weapon-pen';
        penInput.min = '0';
        penInput.value = data ? data.pen : 0;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'entry-remove';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove';

        row1.appendChild(typeSel);
        row1.appendChild(nameInput);
        row1.appendChild(dmgInput);
        row1.appendChild(dtypeInput);
        row1.appendChild(penLabel);
        row1.appendChild(penInput);
        row1.appendChild(removeBtn);
        el.appendChild(row1);

        // Row 2: ranged fields
        const row2 = document.createElement('div');
        row2.className = 'weapon-row weapon-ranged-fields';

        const rangeInput = document.createElement('input');
        rangeInput.type = 'number';
        rangeInput.className = 'weapon-range';
        rangeInput.placeholder = 'Range';
        rangeInput.value = data && data.range ? data.range : '';

        const rofInput = document.createElement('input');
        rofInput.type = 'text';
        rofInput.className = 'weapon-rof';
        rofInput.placeholder = 'ROF';
        rofInput.value = data && data.rof ? data.rof : '';

        const clipInput = document.createElement('input');
        clipInput.type = 'text';
        clipInput.className = 'weapon-clip';
        clipInput.placeholder = 'Clip';
        clipInput.value = data && data.clip != null ? data.clip : '';

        const reloadInput = document.createElement('input');
        reloadInput.type = 'text';
        reloadInput.className = 'weapon-reload';
        reloadInput.placeholder = 'Reload';
        reloadInput.value = data && data.reload ? data.reload : '';

        row2.appendChild(rangeInput);
        row2.appendChild(rofInput);
        row2.appendChild(clipInput);
        row2.appendChild(reloadInput);
        el.appendChild(row2);

        // Row 3: special
        const row3 = document.createElement('div');
        row3.className = 'weapon-row';

        const specInput = document.createElement('input');
        specInput.type = 'text';
        specInput.className = 'weapon-special';
        specInput.placeholder = 'Special properties';
        specInput.value = data ? data.special : '';

        row3.appendChild(specInput);
        el.appendChild(row3);

        // Toggle ranged row visibility
        const updateRanged = () => {
            row2.style.display = typeSel.value === 'ranged' ? 'flex' : 'none';
        };
        typeSel.addEventListener('change', () => {
            updateRanged();
            this.onFieldChange();
        });
        updateRanged();

        // Bind all inputs for live update
        el.querySelectorAll('input, select').forEach(inp => {
            inp.addEventListener('input', () => this.onFieldChange());
        });

        list.appendChild(el);
    },

    addAbilityEntry(data = null) {
        const list = document.getElementById('abilities-list');
        const el = document.createElement('div');
        el.className = 'list-entry ability-entry';

        const header = document.createElement('div');
        header.className = 'ability-header';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'ability-name';
        nameInput.placeholder = 'Ability name';
        nameInput.value = data ? data.name : '';
        nameInput.addEventListener('input', () => this.onFieldChange());

        const removeBtn = document.createElement('button');
        removeBtn.className = 'entry-remove';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove';

        header.appendChild(nameInput);
        header.appendChild(removeBtn);

        const descArea = document.createElement('textarea');
        descArea.className = 'ability-desc';
        descArea.placeholder = 'Description';
        descArea.rows = 2;
        descArea.value = data ? data.description : '';
        descArea.addEventListener('input', () => this.onFieldChange());

        el.appendChild(header);
        el.appendChild(descArea);
        list.appendChild(el);
    },

    // =========================================================================
    // Derived Stats Calculation
    // =========================================================================

    calculateDerived() {
        const c = this.npc.characteristics;
        const size = this.npc.size;
        const level = this.npc.level;

        // Base calculations using DTD.derived
        let sd = DTD.derived.calculateSD(c.dexterity, c.wisdom, size);
        let hp = DTD.derived.calculateHP(c.constitution, c.willpower);
        let mentalDef = DTD.derived.calculateMentalDefense(c.composure);
        let resilience = size; // NPC resilience is typically = size
        let aura = 0;
        let armorBonus = 0; // bonus from traits to all locations

        // Apply trait effects
        const activeTraits = this.npc.traits;
        for (const traitRef of activeTraits) {
            const traitDef = this.traits.find(t => t.id === traitRef.id);
            if (!traitDef || !traitDef.derivedEffects) continue;

            const effects = traitDef.derivedEffects;

            // HP effects
            if (effects.hp === 'add_con') {
                hp += c.constitution;
            } else if (effects.hp === 'double') {
                hp *= 2;
            }

            // Resilience effects
            if (effects.resilience === 'add_con') {
                resilience += c.constitution;
            }

            // Armor effects
            if (effects.armor_all === 'param') {
                armorBonus += (typeof traitRef.param === 'number' ? traitRef.param : parseInt(traitRef.param, 10) || 0);
            } else if (effects.armor_all === 'add_con') {
                armorBonus += c.constitution;
            }

            // Aura
            if (effects.aura === 'param') {
                aura += (typeof traitRef.param === 'number' ? traitRef.param : parseInt(traitRef.param, 10) || 0);
            }
        }

        return { sd, hp, resilience, mentalDef, aura, armorBonus };
    },

    // =========================================================================
    // Update Preview
    // =========================================================================

    update() {
        const npc = this.npc;
        const derived = this.calculateDerived();

        // Update derived stats bar
        document.getElementById('derived-sd').textContent = derived.sd;
        document.getElementById('derived-hp').textContent = derived.hp;
        document.getElementById('derived-resilience').textContent = derived.resilience;
        document.getElementById('derived-mental').textContent = derived.mentalDef;
        document.getElementById('derived-aura').textContent = derived.aura;

        // Update stat card
        document.getElementById('card-name').textContent = npc.name || 'New NPC';

        // Char row
        const row = document.getElementById('card-char-row');
        const cells = row.querySelectorAll('td');
        this.CHAR_KEYS.forEach((key, i) => {
            const val = npc.characteristics[key];
            cells[i].textContent = val === 0 ? '-' : val;
        });

        // Stats line
        const statsDiv = document.getElementById('card-stats');
        statsDiv.innerHTML =
            `<strong>Speed:</strong> ${npc.speed}` +
            ` | <strong>Size/Resilience:</strong> ${npc.size}/${derived.resilience}` +
            ` | <strong>SD:</strong> ${derived.sd}` +
            ` | <strong>HP:</strong> ${derived.hp}` +
            ` | <strong>Level:</strong> ${npc.level}`;

        // Body sections
        const bodyDiv = document.getElementById('card-body');
        let html = '';

        // Skills
        if (npc.skills.length) {
            html += `<div class="card-line"><span class="card-line-label">Skills:</span> ${npc.skills.map(s => `${s.name} ${s.dots}`).join(', ')}</div>`;
        }

        // Feats
        if (npc.feats.length) {
            html += `<div class="card-line"><span class="card-line-label">Feats:</span> ${npc.feats.join(', ')}</div>`;
        }

        // Armor
        if (npc.armor.length) {
            const armorStr = npc.armor.map(a => {
                const locs = a.locations.length ? a.locations.join(', ') : '';
                return `${a.name} (${a.ap} AP${locs ? '; ' + locs : ''})`;
            }).join(', ');
            html += `<div class="card-line"><span class="card-line-label">Armor:</span> ${armorStr}</div>`;
        } else {
            html += `<div class="card-line"><span class="card-line-label">Armor:</span> None</div>`;
        }

        // Weapons/Attacks
        if (npc.weapons.length) {
            const attackStr = npc.weapons.map(w => this.formatWeapon(w)).join(', ');
            html += `<div class="card-line"><span class="card-line-label">Attacks:</span> ${attackStr}</div>`;
        }

        // Abilities
        if (npc.abilities.length) {
            html += `<div class="card-line"><span class="card-line-label">Abilities:</span></div>`;
            for (const a of npc.abilities) {
                html += `<div class="card-ability">- <span class="card-ability-name">${this.escapeHtml(a.name)}</span>${a.description ? ' - ' + this.escapeHtml(a.description) : ''}</div>`;
            }
        }

        // Traits
        if (npc.traits.length) {
            const traitStr = npc.traits.map(t => {
                const def = this.traits.find(d => d.id === t.id);
                const name = def ? def.name : t.id;
                return t.param != null ? `${name} (${t.param})` : name;
            }).join(', ');
            html += `<div class="card-line"><span class="card-line-label">Traits:</span> ${traitStr}</div>`;
        }

        // Gear
        if (npc.gear) {
            html += `<div class="card-line"><span class="card-line-label">Gear:</span> ${this.escapeHtml(npc.gear)}</div>`;
        }

        bodyDiv.innerHTML = html;
    },

    formatWeapon(w) {
        let s = this.escapeHtml(w.name);
        if (w.type === 'melee') {
            const parts = [];
            if (w.damage) parts.push(`${w.damage}${w.damageType ? ' ' + w.damageType : ''}`);
            if (w.pen) parts.push(`Pen ${w.pen}`);
            if (w.special) parts.push(w.special);
            if (parts.length) s += ` (${parts.join('; ')})`;
        } else {
            const parts = [];
            if (w.range) parts.push(`${w.range}m`);
            if (w.rof) parts.push(w.rof);
            if (w.damage) parts.push(`${w.damage}${w.damageType ? ' ' + w.damageType : ''}`);
            if (w.pen) parts.push(`Pen ${w.pen}`);
            if (w.clip != null && w.clip !== '') parts.push(`Clip ${w.clip}`);
            if (w.reload) parts.push(`Reload ${w.reload}`);
            if (w.special) parts.push(w.special);
            if (parts.length) s += ` (${parts.join('; ')})`;
        }
        return s;
    },

    escapeHtml(str) {
        const el = document.createElement('span');
        el.textContent = str;
        return el.innerHTML;
    },

    // =========================================================================
    // Markdown Output
    // =========================================================================

    generateMarkdown() {
        const npc = this.npc;
        const derived = this.calculateDerived();
        let md = '';

        md += `## ${npc.name || 'Unnamed NPC'}\n\n`;

        // Char table
        md += '| Str | Dex | Con | Cha | Fel | Cmp | Int | Wis | Wil |\n';
        md += '| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |\n';
        md += '|';
        for (const key of this.CHAR_KEYS) {
            const val = npc.characteristics[key];
            md += `  ${val === 0 ? '-' : val}  |`;
        }
        md += '\n\n';

        md += `**Speed:** ${npc.speed}\n`;
        md += `**Size/Resilience:** ${npc.size}/${derived.resilience}\n`;
        md += `**Static Defense:** ${derived.sd}\n`;
        md += `**HP:** ${derived.hp}\n`;
        md += `**Level:** ${npc.level}\n\n`;

        if (npc.skills.length) {
            md += `**Skills:** ${npc.skills.map(s => `${s.name} ${s.dots}`).join(', ')}\n`;
        }

        if (npc.feats.length) {
            md += `**Feats:** ${npc.feats.join(', ')}\n`;
        } else {
            md += `**Feats:** None\n`;
        }

        if (npc.armor.length) {
            const armorStr = npc.armor.map(a => {
                const locs = a.locations.length ? a.locations.join(', ') : '';
                return `${a.name} (${a.ap} AP${locs ? '; ' + locs : ''})`;
            }).join(', ');
            md += `**Armor:** ${armorStr}\n`;
        } else {
            md += `**Armor:** None\n`;
        }

        if (npc.weapons.length) {
            md += `**Attacks:** ${npc.weapons.map(w => this.formatWeaponMd(w)).join(', ')}\n`;
        }

        if (npc.abilities.length) {
            md += `**Abilities:**\n\n`;
            for (const a of npc.abilities) {
                md += `- ${a.name}${a.description ? ' - ' + a.description : ''}\n`;
            }
            md += '\n';
        }

        if (npc.traits.length) {
            const traitStr = npc.traits.map(t => {
                const def = this.traits.find(d => d.id === t.id);
                const name = def ? def.name : t.id;
                return t.param != null ? `${name} (${t.param})` : name;
            }).join(', ');
            md += `**Traits:** ${traitStr}\n`;
        }

        if (npc.gear) {
            md += `**Gear:** ${npc.gear}\n`;
        }

        return md;
    },

    formatWeaponMd(w) {
        let s = w.name;
        if (w.type === 'melee') {
            const parts = [];
            if (w.damage) parts.push(`${w.damage}${w.damageType ? ' ' + w.damageType : ''}`);
            if (w.pen) parts.push(`Pen ${w.pen}`);
            if (w.special) parts.push(w.special);
            if (parts.length) s += ` (${parts.join('; ')})`;
        } else {
            const parts = [];
            if (w.range) parts.push(`${w.range}m`);
            if (w.rof) parts.push(w.rof);
            if (w.damage) parts.push(`${w.damage}${w.damageType ? ' ' + w.damageType : ''}`);
            if (w.pen) parts.push(`Pen ${w.pen}`);
            if (w.clip != null && w.clip !== '') parts.push(`Clip ${w.clip}`);
            if (w.reload) parts.push(`Reload ${w.reload}`);
            if (w.special) parts.push(w.special);
            if (parts.length) s += ` (${parts.join('; ')})`;
        }
        return s;
    },

    async copyMarkdown() {
        const md = this.generateMarkdown();
        try {
            await navigator.clipboard.writeText(md);
            this.showToast('Markdown copied to clipboard');
        } catch (_) {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = md;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            this.showToast('Markdown copied to clipboard');
        }
    },

    // =========================================================================
    // Templates
    // =========================================================================

    loadTemplate(tpl) {
        this.npc = {
            name: tpl.name,
            level: tpl.level,
            size: tpl.size,
            speed: tpl.speed,
            characteristics: { ...tpl.characteristics },
            skills: tpl.skills.map(s => ({ ...s })),
            feats: [...tpl.feats],
            traits: (tpl.traits || []).map(t => ({ ...t })),
            armor: (tpl.armor || []).map(a => ({ ...a, locations: [...a.locations] })),
            weapons: (tpl.weapons || []).map(w => ({ ...w })),
            abilities: (tpl.abilities || []).map(a => ({ ...a })),
            gear: Array.isArray(tpl.gear) ? tpl.gear.join(', ') : (tpl.gear || '')
        };
        this.loadNPCToForm();
        this.update();
        this.showToast(`Loaded: ${tpl.name}`);
    },

    // =========================================================================
    // Save / Load / Delete
    // =========================================================================

    loadSavedList() {
        try {
            const raw = localStorage.getItem(this.STORAGE_LIST_KEY);
            this.savedList = raw ? JSON.parse(raw) : [];
        } catch (_) {
            this.savedList = [];
        }
    },

    saveSavedList() {
        localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(this.savedList));
    },

    saveNPC() {
        this.readFormToState();
        const npc = this.npc;
        const id = npc.name ? npc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') : 'npc-' + Date.now();

        localStorage.setItem(this.STORAGE_PREFIX + id, JSON.stringify(npc));

        if (!this.savedList.includes(id)) {
            this.savedList.push(id);
            this.saveSavedList();
        }

        this.buildSavedDropdown();
        document.getElementById('saved-select').value = id;
        this.showToast(`Saved: ${npc.name || id}`);
    },

    loadSavedNPC(id) {
        const raw = localStorage.getItem(this.STORAGE_PREFIX + id);
        if (!raw) return;
        try {
            const npc = JSON.parse(raw);
            // Ensure all fields exist
            this.npc = { ...this.createDefaultNPC(), ...npc };
            this.loadNPCToForm();
            this.update();
            this.showToast(`Loaded: ${this.npc.name || id}`);
        } catch (_) {
            this.showToast('Failed to load NPC');
        }
    },

    deleteSavedNPC() {
        const sel = document.getElementById('saved-select');
        const id = sel.value;
        if (!id) {
            this.showToast('Select a saved NPC to delete');
            return;
        }

        localStorage.removeItem(this.STORAGE_PREFIX + id);
        this.savedList = this.savedList.filter(i => i !== id);
        this.saveSavedList();
        this.buildSavedDropdown();
        this.showToast('Deleted saved NPC');
    },

    duplicateNPC() {
        this.readFormToState();
        this.npc.name = (this.npc.name || 'NPC') + ' (Copy)';
        this.loadNPCToForm();
        this.update();
        this.showToast('Duplicated — edit and save as new');
    },

    // =========================================================================
    // Toast
    // =========================================================================

    showToast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.hidden = false;
        el.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => { el.hidden = true; }, 300);
        }, 2000);
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => NPCBuilder.init());
