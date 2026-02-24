/**
 * DTD Ship Builder + Ship Sheet
 * Two-mode tool: Builder (construct ship) and Sheet (track ship in play)
 *
 * Follows the same object literal pattern as the Character Sheet.
 * Storage: dtd_ship_{id}, dtd_ship_list
 */

const ShipTool = {

    // =========================================================================
    // Constants
    // =========================================================================

    STORAGE_PREFIX: 'dtd_ship_',
    STORAGE_LIST_KEY: 'dtd_ship_list',
    AUTOSAVE_DELAY: 400,

    CONSOLE_TYPES: ['arcana', 'command', 'engineering', 'tactical', 'universal'],
    CONSOLE_LABELS: {
        arcana: 'Arcana',
        command: 'Command',
        engineering: 'Engineering',
        tactical: 'Tactical',
        universal: 'Universal'
    },

    OFFICER_POSITIONS: [
        { id: 'helmsman', title: 'Helmsman', skill: 'Pilot' },
        { id: 'tactical', title: 'Tactical Officer', skill: 'Ballistics' },
        { id: 'engineer', title: 'Chief Engineer', skill: 'Tech-Use' },
        { id: 'captain', title: 'Captain', skill: 'Command' },
        { id: 'arcana', title: 'Chief Arcana Officer', skill: 'Arcana' }
    ],

    WEAPON_SIZES: ['Light Cannon', 'Heavy Cannon', 'Light Beam', 'Heavy Beam', 'Turret'],
    WEAPON_MATERIALS: ['Las', 'Melta', 'Plasma', 'Orgone', 'Mass Driver', 'Positron', 'Anti-Meson'],

    // =========================================================================
    // State
    // =========================================================================

    data: null,        // ships.json
    ship: null,        // current ship data
    shipId: null,      // current ship id
    mode: 'builder',   // 'builder' or 'sheet'
    _saveTimer: null,

    // =========================================================================
    // Initialisation
    // =========================================================================

    async init() {
        try {
            this.data = await DTD.loadData('ships.json');
        } catch (e) {
            console.error('Failed to load ship data:', e);
            document.body.innerHTML = '<p style="color:red;padding:2rem">Failed to load ship data. Check console.</p>';
            return;
        }

        this.bindEvents();
        this.loadShipList();

        // Load last ship or create new
        const list = this.getShipList();
        if (list.length > 0) {
            this.loadShip(list[list.length - 1].id);
        } else {
            this.newShip();
        }
    },

    // =========================================================================
    // Ship Data Defaults
    // =========================================================================

    defaultShip() {
        return {
            id: this.generateId(),
            name: '',
            hullId: '',
            consoles: {},       // { slotKey: consoleId }
            weapons: {          // { 'forward-0': weaponId, ... }
                forward: [],    // array of weaponId or null
                rear: []
            },
            weaponPartials: {}, // { 'forward-0': 'Light Cannon', ... } tracks size before material chosen
            hasTorpedoTube: false,
            torpedoes: ['', '', '', '', ''],  // 5 slots
            shieldId: '',
            crewQuality: 2,
            holdings: 0,
            customBP: false,
            customBPValue: 0,
            officers: {
                helmsman:  { name: '', skill: 0 },
                tactical:  { name: '', skill: 0 },
                engineer:  { name: '', skill: 0 },
                captain:   { name: '', skill: 0 },
                arcana:    { name: '', skill: 0 }
            },
            mode: 'builder',    // persisted mode
            // Sheet combat state
            combat: {
                shieldCurrent: 0,
                hullCurrent: 0,
                crewCurrent: 0,
                disruption: 0,
                turn: 1,
                critLog: [],
                departments: { maneuver: false, tactical: false, engineering: false, command: false, arcana: false },
                consoleStatus: {},   // consoleId: true/false (active)
                weaponStatus: {}     // slotKey: true/false (active)
            }
        };
    },

    generateId() {
        return 'ship_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    },

    // =========================================================================
    // Persistence
    // =========================================================================

    getShipList() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_LIST_KEY)) || [];
        } catch { return []; }
    },

    saveShipList(list) {
        localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(list));
    },

    saveShip() {
        if (!this.ship) return;
        localStorage.setItem(this.STORAGE_PREFIX + this.ship.id, JSON.stringify(this.ship));

        // Update list entry
        const list = this.getShipList();
        const idx = list.findIndex(s => s.id === this.ship.id);
        const entry = { id: this.ship.id, name: this.ship.name || 'Unnamed Ship' };
        if (idx >= 0) list[idx] = entry;
        else list.push(entry);
        this.saveShipList(list);
        this.refreshShipSelect();
    },

    scheduleSave() {
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => this.saveShip(), this.AUTOSAVE_DELAY);
    },

    loadShip(id) {
        try {
            const raw = localStorage.getItem(this.STORAGE_PREFIX + id);
            if (raw) {
                this.ship = JSON.parse(raw);
                this.shipId = this.ship.id;
                // Ensure combat state exists
                if (!this.ship.combat) {
                    this.ship.combat = this.defaultShip().combat;
                }
                this.setMode(this.ship.mode || 'builder');
                this.renderAll();
                this.refreshShipSelect();
                return;
            }
        } catch (e) {
            console.error('Failed to load ship:', e);
        }
        this.newShip();
    },

    newShip() {
        this.ship = this.defaultShip();
        this.shipId = this.ship.id;
        this.saveShip();
        this.setMode('builder');
        this.renderAll();
    },

    deleteShip() {
        if (!this.ship) return;
        if (!confirm(`Delete "${this.ship.name || 'Unnamed Ship'}"?`)) return;

        localStorage.removeItem(this.STORAGE_PREFIX + this.ship.id);
        let list = this.getShipList().filter(s => s.id !== this.ship.id);
        this.saveShipList(list);

        if (list.length > 0) {
            this.loadShip(list[list.length - 1].id);
        } else {
            this.newShip();
        }
    },

    exportShip() {
        if (!this.ship) return;
        const json = JSON.stringify(this.ship, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (this.ship.name || 'ship') + '.json';
        a.click();
        URL.revokeObjectURL(url);
    },

    importShip(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                // Give it a new ID to avoid collisions
                imported.id = this.generateId();
                this.ship = imported;
                this.shipId = this.ship.id;
                if (!this.ship.combat) this.ship.combat = this.defaultShip().combat;
                this.saveShip();
                this.setMode(this.ship.mode || 'builder');
                this.renderAll();
            } catch (err) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    },

    // =========================================================================
    // Ship Select Dropdown
    // =========================================================================

    loadShipList() {
        this.refreshShipSelect();
    },

    refreshShipSelect() {
        const sel = document.getElementById('ship-select');
        const list = this.getShipList();
        sel.innerHTML = list.map(s =>
            `<option value="${s.id}" ${s.id === this.shipId ? 'selected' : ''}>${s.name || 'Unnamed Ship'}</option>`
        ).join('');
    },

    // =========================================================================
    // Mode Switching
    // =========================================================================

    setMode(mode) {
        this.mode = mode;
        if (this.ship) this.ship.mode = mode;

        document.getElementById('mode-builder').classList.toggle('hidden', mode !== 'builder');
        document.getElementById('mode-sheet').classList.toggle('hidden', mode !== 'sheet');

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        if (mode === 'sheet') {
            this.initCombatState();
            this.renderSheet();
        }
    },

    // =========================================================================
    // Event Binding
    // =========================================================================

    bindEvents() {
        // Ship management
        document.getElementById('ship-select').addEventListener('change', (e) => this.loadShip(e.target.value));
        document.getElementById('btn-new').addEventListener('click', () => this.newShip());
        document.getElementById('btn-delete').addEventListener('click', () => this.deleteShip());
        document.getElementById('btn-export').addEventListener('click', () => this.exportShip());
        document.getElementById('btn-import').addEventListener('click', () => document.getElementById('file-import').click());
        document.getElementById('file-import').addEventListener('change', (e) => {
            if (e.target.files[0]) this.importShip(e.target.files[0]);
            e.target.value = '';
        });

        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setMode(btn.dataset.mode);
                this.scheduleSave();
            });
        });
        document.getElementById('btn-to-sheet').addEventListener('click', () => {
            this.setMode('sheet');
            this.scheduleSave();
        });
        document.getElementById('btn-to-builder').addEventListener('click', () => {
            this.setMode('builder');
            this.scheduleSave();
        });

        // Hull filters
        document.querySelector('.hull-filters').addEventListener('click', (e) => {
            if (!e.target.classList.contains('filter-btn')) return;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.filterHulls(e.target.dataset.class);
        });

        // Ship name
        document.getElementById('ship-name').addEventListener('input', (e) => {
            this.ship.name = e.target.value;
            this.scheduleSave();
        });

        // Holdings
        document.getElementById('holdings-input').addEventListener('change', (e) => {
            this.ship.holdings = parseInt(e.target.value);
            this.updateBudget();
            this.scheduleSave();
        });

        // Custom BP
        document.getElementById('custom-bp-toggle').addEventListener('change', (e) => {
            this.ship.customBP = e.target.checked;
            document.getElementById('custom-bp-input').classList.toggle('hidden', !e.target.checked);
            this.updateBudget();
            this.scheduleSave();
        });
        document.getElementById('custom-bp-input').addEventListener('input', (e) => {
            this.ship.customBPValue = parseInt(e.target.value) || 0;
            this.updateBudget();
            this.scheduleSave();
        });

        // Torpedo tube
        document.getElementById('has-torpedo-tube').addEventListener('change', (e) => {
            this.ship.hasTorpedoTube = e.target.checked;
            document.getElementById('torpedo-loadout').classList.toggle('hidden', !e.target.checked);
            this.updateBudget();
            this.scheduleSave();
        });

        // Shield type
        document.getElementById('shield-type').addEventListener('change', (e) => {
            const markSel = document.getElementById('shield-mark');
            markSel.disabled = !e.target.value;
            this.updateShieldSelection();
        });
        document.getElementById('shield-mark').addEventListener('change', () => this.updateShieldSelection());

        // Crew quality
        document.getElementById('crew-quality').addEventListener('change', (e) => {
            this.ship.crewQuality = parseInt(e.target.value);
            this.updateBudget();
            this.renderSummaryStats();
            this.scheduleSave();
        });

        // Officers (delegated)
        document.querySelector('.officer-grid').addEventListener('input', (e) => {
            if (e.target.dataset.officer) {
                this.ship.officers[e.target.dataset.officer].name = e.target.value;
                this.scheduleSave();
            }
            if (e.target.dataset.officerSkill) {
                this.ship.officers[e.target.dataset.officerSkill].skill = parseInt(e.target.value) || 0;
                this.scheduleSave();
            }
        });

        // ---- Sheet mode events ----
        // HP buttons (delegated)
        document.getElementById('mode-sheet').addEventListener('click', (e) => {
            const hpBtn = e.target.closest('.hp-btn');
            if (hpBtn) {
                this.handleHPButton(hpBtn.dataset.target, parseInt(hpBtn.dataset.delta));
                return;
            }

            // Toggle console/weapon active
            const toggle = e.target.closest('.item-toggle');
            if (toggle) {
                this.handleItemToggle(toggle);
                return;
            }
        });

        // Shield regen
        document.getElementById('btn-regen-shields').addEventListener('click', () => this.regenShields());
        document.getElementById('btn-reset-disruption').addEventListener('click', () => {
            document.getElementById('disruption-total').value = 0;
            this.ship.combat.disruption = 0;
            this.scheduleSave();
        });
        document.getElementById('disruption-total').addEventListener('input', (e) => {
            this.ship.combat.disruption = parseInt(e.target.value) || 0;
            this.scheduleSave();
        });

        // Direct HP input
        document.getElementById('shield-current').addEventListener('input', (e) => {
            this.ship.combat.shieldCurrent = Math.max(0, parseInt(e.target.value) || 0);
            this.scheduleSave();
        });
        document.getElementById('hull-current').addEventListener('input', (e) => {
            this.ship.combat.hullCurrent = Math.max(0, parseInt(e.target.value) || 0);
            this.scheduleSave();
        });
        document.getElementById('crew-current').addEventListener('input', (e) => {
            this.ship.combat.crewCurrent = Math.max(0, parseInt(e.target.value) || 0);
            this.scheduleSave();
        });

        // Initiative
        document.getElementById('btn-roll-init').addEventListener('click', () => this.rollInitiative());

        // Department actions
        document.getElementById('btn-reset-actions').addEventListener('click', () => this.resetDepartments());
        document.querySelectorAll('[data-dept]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                this.ship.combat.departments[e.target.dataset.dept] = e.target.checked;
                this.scheduleSave();
            });
        });

        // Turn counter
        document.getElementById('btn-next-turn').addEventListener('click', () => this.nextTurn());
        document.getElementById('btn-prev-turn').addEventListener('click', () => this.prevTurn());

        // Critical damage
        document.getElementById('btn-roll-crit').addEventListener('click', () => this.rollCritical());
    },

    // =========================================================================
    // Render All (Builder)
    // =========================================================================

    renderAll() {
        this.renderHullGrid();
        this.renderConsoleSlots();
        this.renderWeaponSlots();
        this.renderTorpedoSlots();
        this.renderShieldState();
        this.renderCrewState();
        this.renderSummary();

        // Populate ship name
        document.getElementById('ship-name').value = this.ship.name || '';
        document.getElementById('holdings-input').value = this.ship.holdings;
        document.getElementById('custom-bp-toggle').checked = this.ship.customBP;
        document.getElementById('custom-bp-input').classList.toggle('hidden', !this.ship.customBP);
        document.getElementById('custom-bp-input').value = this.ship.customBPValue;
        document.getElementById('has-torpedo-tube').checked = this.ship.hasTorpedoTube;
        document.getElementById('torpedo-loadout').classList.toggle('hidden', !this.ship.hasTorpedoTube);
        document.getElementById('crew-quality').value = this.ship.crewQuality;

        if (this.mode === 'sheet') {
            this.renderSheet();
        }
    },

    // =========================================================================
    // Hull Grid
    // =========================================================================

    renderHullGrid() {
        const grid = document.getElementById('hull-grid');
        grid.innerHTML = this.data.hulls.map(hull => {
            const totalSlots = Object.values(hull.consoles).reduce((a, b) => a + b, 0);
            const totalWeapons = hull.weapons.forward + hull.weapons.rear;
            return `
                <div class="hull-card ${this.ship.hullId === hull.id ? 'selected' : ''}"
                     data-hull-id="${hull.id}" data-hull-class="${hull.class}">
                    <div class="hull-name">${hull.name}</div>
                    <div class="hull-class">${hull.class}</div>
                    <div class="hull-stats">
                        <span>Hull: <strong>${hull.hullStrength}</strong></span>
                        <span>Man: <strong>${hull.maneuverability >= 0 ? '+' : ''}${hull.maneuverability}</strong></span>
                        <span>Speed: <strong>${hull.speed}</strong></span>
                        <span>Acc: <strong>${hull.acceleration >= 0 ? '+' : ''}${hull.acceleration}</strong></span>
                        <span>Sensors: <strong>${hull.sensors >= 0 ? '+' : ''}${hull.sensors}</strong></span>
                        <span>Crew: <strong>${hull.crew}</strong></span>
                        <span>Consoles: <strong>${totalSlots}</strong></span>
                        <span>Weapons: <strong>${totalWeapons}</strong></span>
                    </div>
                    <span class="hull-cost">${hull.cost} BP</span>
                </div>`;
        }).join('');

        // Click to select
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.hull-card');
            if (!card) return;
            this.selectHull(card.dataset.hullId);
        });

        this.filterHulls('all');
    },

    filterHulls(hullClass) {
        document.querySelectorAll('.hull-card').forEach(card => {
            card.style.display = (hullClass === 'all' || card.dataset.hullClass === hullClass) ? '' : 'none';
        });
    },

    selectHull(hullId) {
        const oldHull = this.ship.hullId;
        this.ship.hullId = hullId;

        // If hull changed, reset consoles and weapons if they don't fit
        if (oldHull !== hullId) {
            this.ship.consoles = {};
            this.ship.weapons = { forward: [], rear: [] };
            this.ship.weaponPartials = {};
            const hull = this.getHull();
            if (hull) {
                this.ship.weapons.forward = new Array(hull.weapons.forward).fill('');
                this.ship.weapons.rear = new Array(hull.weapons.rear).fill('');
            }
        }

        // Update UI
        document.querySelectorAll('.hull-card').forEach(c => c.classList.toggle('selected', c.dataset.hullId === hullId));
        this.renderConsoleSlots();
        this.renderWeaponSlots();
        this.renderSummary();
        this.scheduleSave();
    },

    getHull() {
        return this.data.hulls.find(h => h.id === this.ship.hullId) || null;
    },

    // =========================================================================
    // Console Slots
    // =========================================================================

    renderConsoleSlots() {
        const container = document.getElementById('console-slots');
        const hint = document.getElementById('console-hint');
        const hull = this.getHull();

        if (!hull) {
            container.innerHTML = '';
            hint.style.display = '';
            return;
        }
        hint.style.display = 'none';

        let html = '';
        let slotIndex = 0;

        for (const type of this.CONSOLE_TYPES) {
            const count = hull.consoles[type];
            if (count === 0) continue;

            html += `<div class="console-slot-group">
                <h4><span class="slot-type-badge ${type}">${type.charAt(0).toUpperCase()}</span> ${this.CONSOLE_LABELS[type]} (${count})</h4>`;

            for (let i = 0; i < count; i++) {
                const slotKey = `${type}-${i}`;
                const currentId = this.ship.consoles[slotKey] || '';
                const options = this.getConsoleOptions(type);

                html += `<div class="console-slot">
                    <span class="slot-type-badge ${type}">${type.charAt(0).toUpperCase()}</span>
                    <select class="console-select" data-slot="${slotKey}">
                        <option value="">— Empty —</option>
                        ${options.map(c => `<option value="${c.id}" ${c.id === currentId ? 'selected' : ''}>${c.name} (${c.cost} BP)</option>`).join('')}
                    </select>
                    <span class="console-cost">${currentId ? this.data.consoles.find(c => c.id === currentId)?.cost + ' BP' : ''}</span>
                </div>`;

                // Show effect if console selected
                const console = currentId ? this.data.consoles.find(c => c.id === currentId) : null;
                if (console) {
                    html += `<div class="console-effect">${console.effect}</div>`;
                }
                slotIndex++;
            }
            html += '</div>';
        }

        container.innerHTML = html;

        // Bind change events
        container.querySelectorAll('.console-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                this.ship.consoles[e.target.dataset.slot] = e.target.value;
                this.renderConsoleSlots(); // re-render to show effect
                this.updateBudget();
                this.scheduleSave();
            });
        });
    },

    getConsoleOptions(slotType) {
        // A typed slot accepts its own type + universal consoles
        // A universal slot accepts any console
        if (slotType === 'universal') {
            return this.data.consoles;
        }
        return this.data.consoles.filter(c => c.type === slotType || c.type === 'universal');
    },

    // =========================================================================
    // Weapon Slots
    // =========================================================================

    renderWeaponSlots() {
        const container = document.getElementById('weapon-slots');
        const hint = document.getElementById('weapon-hint');
        const hull = this.getHull();

        if (!hull) {
            container.innerHTML = '';
            hint.style.display = '';
            return;
        }
        hint.style.display = 'none';

        // Ensure weapon arrays are the right size
        while (this.ship.weapons.forward.length < hull.weapons.forward) this.ship.weapons.forward.push('');
        while (this.ship.weapons.rear.length < hull.weapons.rear) this.ship.weapons.rear.push('');
        this.ship.weapons.forward.length = hull.weapons.forward;
        this.ship.weapons.rear.length = hull.weapons.rear;

        let html = '';

        const renderGroup = (position, count) => {
            if (count === 0) return;
            html += `<div class="weapon-group"><h4>${position === 'forward' ? 'Forward' : 'Rear'} Hardpoints (${count})</h4>`;
            for (let i = 0; i < count; i++) {
                const slotKey = `${position}-${i}`;
                const weaponId = this.ship.weapons[position][i] || '';
                const weapon = weaponId ? this.data.weapons.find(w => w.id === weaponId) : null;

                // Parse current selection — use partials if no complete weapon yet
                if (!this.ship.weaponPartials) this.ship.weaponPartials = {};
                const currentSize = weapon ? weapon.size : (this.ship.weaponPartials[slotKey] || '');
                const currentMaterial = weapon ? weapon.material : '';

                html += `<div class="weapon-slot" data-slot="${slotKey}">
                    <div class="weapon-selectors">
                        <select class="weapon-size-select" data-position="${position}" data-index="${i}">
                            <option value="">— Empty —</option>
                            ${this.WEAPON_SIZES.map(s => `<option value="${s}" ${s === currentSize ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                        <select class="weapon-material-select" data-position="${position}" data-index="${i}" ${!currentSize ? 'disabled' : ''}>
                            <option value="">— Material —</option>
                            ${this.WEAPON_MATERIALS.map(m => `<option value="${m}" ${m === currentMaterial ? 'selected' : ''}>${m}</option>`).join('')}
                        </select>
                    </div>`;

                if (weapon) {
                    html += `<div class="weapon-preview">
                        <span>Dam: <strong>${weapon.damage}</strong></span>
                        <span>Dis: <strong>${weapon.disruption}</strong></span>
                        <span>Acc: <strong>${weapon.accuracy >= 0 ? '+' : ''}${weapon.accuracy}</strong></span>
                        <span>Crit: <strong>${weapon.crit >= 0 ? '+' : ''}${weapon.crit}</strong></span>
                        <span>Range: <strong>${weapon.range} VU</strong></span>
                        <span>Arc: <strong>${weapon.arc}</strong></span>
                        <span>Type: <strong>${weapon.type}</strong></span>
                        <span>Cost: <strong>${weapon.cost} BP</strong></span>
                    </div>`;
                }
                html += '</div>';
            }
            html += '</div>';
        };

        renderGroup('forward', hull.weapons.forward);
        renderGroup('rear', hull.weapons.rear);

        container.innerHTML = html;

        // Bind events
        container.querySelectorAll('.weapon-size-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const pos = e.target.dataset.position;
                const idx = parseInt(e.target.dataset.index);
                const slotKey = `${pos}-${idx}`;
                if (!this.ship.weaponPartials) this.ship.weaponPartials = {};
                if (!e.target.value) {
                    // Cleared size — remove weapon and partial
                    this.ship.weapons[pos][idx] = '';
                    delete this.ship.weaponPartials[slotKey];
                } else {
                    // Size chosen — store partial, clear weapon until material is picked
                    this.ship.weapons[pos][idx] = '';
                    this.ship.weaponPartials[slotKey] = e.target.value;
                }
                this.renderWeaponSlots();
                this.updateBudget();
                this.scheduleSave();
            });
        });

        container.querySelectorAll('.weapon-material-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const pos = e.target.dataset.position;
                const idx = parseInt(e.target.dataset.index);
                const slotKey = `${pos}-${idx}`;
                if (!this.ship.weaponPartials) this.ship.weaponPartials = {};
                // Get size from partial, or from the currently installed weapon
                let size = this.ship.weaponPartials[slotKey] || '';
                if (!size) {
                    const currentWeapon = this.data.weapons.find(w => w.id === this.ship.weapons[pos][idx]);
                    if (currentWeapon) size = currentWeapon.size;
                }
                const material = e.target.value;

                if (size && material) {
                    const weapon = this.data.weapons.find(w => w.size === size && w.material === material);
                    this.ship.weapons[pos][idx] = weapon ? weapon.id : '';
                    // Clear partial once we have a full weapon
                    if (weapon) delete this.ship.weaponPartials[slotKey];
                } else {
                    this.ship.weapons[pos][idx] = '';
                }
                this.renderWeaponSlots();
                this.updateBudget();
                this.scheduleSave();
            });
        });
    },

    // =========================================================================
    // Torpedo Slots
    // =========================================================================

    renderTorpedoSlots() {
        const container = document.getElementById('torpedo-slots');
        if (!this.ship.torpedoes) this.ship.torpedoes = ['', '', '', '', ''];

        let html = '';
        for (let i = 0; i < 5; i++) {
            const current = this.ship.torpedoes[i] || '';
            html += `<div class="torpedo-slot">
                <span>#${i + 1}</span>
                <select class="torpedo-select" data-index="${i}">
                    <option value="">— Empty —</option>
                    ${this.data.torpedoes.map(t => `<option value="${t.id}" ${t.id === current ? 'selected' : ''}>${t.name} (${t.cost} BP)</option>`).join('')}
                </select>
                <span class="torpedo-cost">${current ? (this.data.torpedoes.find(t => t.id === current)?.cost || 0) + ' BP' : ''}</span>
            </div>`;
        }
        container.innerHTML = html;

        container.querySelectorAll('.torpedo-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                this.ship.torpedoes[parseInt(e.target.dataset.index)] = e.target.value;
                this.renderTorpedoSlots();
                this.updateBudget();
                this.scheduleSave();
            });
        });
    },

    // =========================================================================
    // Shield State
    // =========================================================================

    renderShieldState() {
        const shield = this.getSelectedShield();
        document.getElementById('shield-type').value = shield ? shield.type : '';
        document.getElementById('shield-mark').value = shield ? String(shield.mark) : '1';
        document.getElementById('shield-mark').disabled = !shield;
        this.renderShieldPreview();
    },

    updateShieldSelection() {
        const type = document.getElementById('shield-type').value;
        const mark = parseInt(document.getElementById('shield-mark').value);

        if (type) {
            const shield = this.data.shields.find(s => s.type === type && s.mark === mark);
            this.ship.shieldId = shield ? shield.id : '';
        } else {
            this.ship.shieldId = '';
        }
        this.renderShieldPreview();
        this.updateBudget();
        this.scheduleSave();
    },

    getSelectedShield() {
        return this.data.shields.find(s => s.id === this.ship.shieldId) || null;
    },

    renderShieldPreview() {
        const preview = document.getElementById('shield-preview');
        const shield = this.getSelectedShield();

        if (!shield) {
            preview.innerHTML = '<span class="text-muted">No shield selected</span>';
            return;
        }

        let html = `
            <div class="shield-stat"><span class="label">Capacity</span><span>${shield.capacity}</span></div>
            <div class="shield-stat"><span class="label">Regeneration</span><span>${shield.regeneration}/turn</span></div>
            <div class="shield-stat"><span class="label">Cost</span><span>${shield.cost} BP</span></div>`;

        if (shield.special) {
            html += `<div class="shield-stat"><span class="label">Special</span><span>${shield.special}</span></div>`;
        }
        if (shield.layers) {
            html += `<div class="shield-stat"><span class="label">Layers</span><span>${shield.layers}</span></div>`;
        }
        preview.innerHTML = html;
    },

    // =========================================================================
    // Crew State
    // =========================================================================

    renderCrewState() {
        // Populate officer fields
        for (const pos of Object.keys(this.ship.officers)) {
            const nameInput = document.querySelector(`[data-officer="${pos}"]`);
            const skillInput = document.querySelector(`[data-officer-skill="${pos}"]`);
            if (nameInput) nameInput.value = this.ship.officers[pos].name || '';
            if (skillInput) skillInput.value = this.ship.officers[pos].skill || 0;
        }
    },

    // =========================================================================
    // Summary Panel
    // =========================================================================

    renderSummary() {
        this.renderSummaryHull();
        this.renderSummaryStats();
        this.updateBudget();
    },

    renderSummaryHull() {
        const hull = this.getHull();
        const container = document.getElementById('summary-hull');
        if (!hull) {
            container.innerHTML = '<span class="text-muted">No hull selected</span>';
            return;
        }
        container.innerHTML = `<strong>${hull.name}</strong> <span class="text-muted">(${hull.class})</span>`;
    },

    renderSummaryStats() {
        const container = document.getElementById('summary-stats');
        const hull = this.getHull();
        if (!hull) {
            container.innerHTML = '';
            return;
        }

        const cq = this.ship.crewQuality;
        const man = hull.maneuverability + this.getManBonus();
        const tn = 3 * cq + man;
        const sensors = hull.sensors + this.getSensorBonus();
        const acc = hull.acceleration + this.getAccBonus();
        const speed = hull.speed + this.getSpeedBonus();
        const hullHP = this.getEffectiveHullStrength();
        const crew = hull.crew + this.getCrewBonus();

        container.innerHTML = `<table>
            <tr><td>Hull Strength</td><td>${hullHP}</td></tr>
            <tr><td>Maneuverability</td><td>${man >= 0 ? '+' : ''}${man}</td></tr>
            <tr><td>Acceleration</td><td>${acc >= 0 ? '+' : ''}${acc}</td></tr>
            <tr><td>Speed</td><td>${speed}</td></tr>
            <tr><td>Sensors</td><td>${sensors >= 0 ? '+' : ''}${sensors}</td></tr>
            <tr><td>Crew Quality</td><td>${cq}</td></tr>
            <tr><td>Crew Size</td><td>${crew}</td></tr>
            <tr><td>TN to Hit</td><td>${tn}</td></tr>
            <tr><td>Initiative</td><td>+${sensors} + ${acc} + 1d10</td></tr>
        </table>`;
    },

    // =========================================================================
    // Console bonus helpers
    // =========================================================================

    getInstalledConsoleIds() {
        return Object.values(this.ship.consoles).filter(Boolean);
    },

    hasConsole(consoleId) {
        return this.getInstalledConsoleIds().includes(consoleId);
    },

    getManBonus() {
        return this.hasConsole('thrust-vectoring') ? 5 : 0;
    },

    getSensorBonus() {
        return this.hasConsole('enhanced-sensors') ? 5 : 0;
    },

    getAccBonus() {
        return this.hasConsole('large-engine') ? 5 : 0;
    },

    getSpeedBonus() {
        return this.hasConsole('large-engine') ? 2 : 0;
    },

    getCrewBonus() {
        // Count how many Rating Quarters are installed
        return this.getInstalledConsoleIds().filter(id => id === 'rating-quarters').length * 2;
    },

    getEffectiveHullStrength() {
        const hull = this.getHull();
        if (!hull) return 0;
        let base = hull.hullStrength;
        // Each Hardened Armor is +10%
        const hardenedCount = this.getInstalledConsoleIds().filter(id => id === 'hardened-armor').length;
        base = Math.floor(base * (1 + hardenedCount * 0.1));
        return base;
    },

    // =========================================================================
    // Budget Calculation
    // =========================================================================

    calculateBPSpent() {
        const breakdown = { hull: 0, consoles: 0, weapons: 0, torpedoes: 0, shields: 0, crew: 0 };

        // Hull
        const hull = this.getHull();
        if (hull) breakdown.hull = hull.cost;

        // Consoles
        for (const consoleId of this.getInstalledConsoleIds()) {
            const c = this.data.consoles.find(x => x.id === consoleId);
            if (c) breakdown.consoles += c.cost;
        }

        // Weapons
        for (const pos of ['forward', 'rear']) {
            for (const wid of (this.ship.weapons[pos] || [])) {
                if (!wid) continue;
                const w = this.data.weapons.find(x => x.id === wid);
                if (w) breakdown.weapons += w.cost;
            }
        }

        // Torpedo tube + torpedoes
        if (this.ship.hasTorpedoTube) {
            breakdown.torpedoes += this.data.torpedoTubeCost;
            for (const tid of (this.ship.torpedoes || [])) {
                if (!tid) continue;
                const t = this.data.torpedoes.find(x => x.id === tid);
                if (t) breakdown.torpedoes += t.cost;
            }
        }

        // Shields
        const shield = this.getSelectedShield();
        if (shield) breakdown.shields = shield.cost;

        // Crew quality
        const cqCost = this.data.crewQualityCost[String(this.ship.crewQuality)] || 0;
        breakdown.crew = cqCost;

        return breakdown;
    },

    getBPBudget() {
        if (this.ship.customBP) return this.ship.customBPValue;
        return this.data.holdingsBP[this.ship.holdings] || 0;
    },

    updateBudget() {
        const budget = this.getBPBudget();
        const breakdown = this.calculateBPSpent();
        const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

        document.getElementById('bp-display').textContent = `${total} / ${budget} BP`;

        const fill = document.getElementById('bp-bar-fill');
        const pct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
        fill.style.width = pct + '%';
        fill.classList.toggle('over-budget', total > budget);

        // Breakdown
        const bd = document.getElementById('bp-breakdown');
        const lines = [
            { label: 'Hull', val: breakdown.hull },
            { label: 'Consoles', val: breakdown.consoles },
            { label: 'Weapons', val: breakdown.weapons },
            { label: 'Torpedoes', val: breakdown.torpedoes },
            { label: 'Shields', val: breakdown.shields },
            { label: 'Crew', val: breakdown.crew }
        ].filter(l => l.val !== 0);

        bd.innerHTML = lines.map(l =>
            `<div class="bp-line ${total > budget ? 'over-budget' : ''}"><span>${l.label}</span><span>${l.val} BP</span></div>`
        ).join('');
    },

    // =========================================================================
    // SHEET MODE
    // =========================================================================

    initCombatState() {
        const hull = this.getHull();
        if (!hull) return;

        const shield = this.getSelectedShield();
        const hullHP = this.getEffectiveHullStrength();
        const crew = hull.crew + this.getCrewBonus();

        // Only initialise if not already set (preserve mid-combat state)
        if (this.ship.combat.hullCurrent === 0 && this.ship.combat.shieldCurrent === 0) {
            this.ship.combat.hullCurrent = hullHP;
            this.ship.combat.crewCurrent = crew;
            if (shield) {
                this.ship.combat.shieldCurrent = shield.capacity;
            }
        }
    },

    renderSheet() {
        const hull = this.getHull();
        if (!hull) return;

        const shield = this.getSelectedShield();
        const cq = this.ship.crewQuality;
        const man = hull.maneuverability + this.getManBonus();
        const sensors = hull.sensors + this.getSensorBonus();
        const acc = hull.acceleration + this.getAccBonus();
        const speed = hull.speed + this.getSpeedBonus();
        const hullHP = this.getEffectiveHullStrength();
        const crew = hull.crew + this.getCrewBonus();

        // Header
        document.getElementById('sheet-ship-name').textContent = this.ship.name || 'Unnamed Ship';
        document.getElementById('sheet-hull-class').textContent = `${hull.name} — ${hull.class}`;

        // Stats table
        const tbody = document.querySelector('#sheet-stats-table tbody');
        tbody.innerHTML = `
            <tr><td>Hull Class</td><td>${hull.class}</td></tr>
            <tr><td>Hull Strength</td><td>${hullHP}</td></tr>
            <tr><td>Maneuverability</td><td>${man >= 0 ? '+' : ''}${man}</td></tr>
            <tr><td>Acceleration</td><td>${acc >= 0 ? '+' : ''}${acc}</td></tr>
            <tr><td>Speed</td><td>${speed} VU</td></tr>
            <tr><td>Sensors</td><td>${sensors >= 0 ? '+' : ''}${sensors}</td></tr>
            <tr><td>Crew Quality</td><td>${cq}</td></tr>
            <tr><td>Crew Size</td><td>${crew}</td></tr>
            <tr><td>TN to Hit</td><td>${3 * cq + man}</td></tr>`;

        // Consoles
        const consolesDiv = document.getElementById('sheet-consoles');
        const installedConsoles = this.getInstalledConsoleIds();
        if (installedConsoles.length === 0) {
            consolesDiv.innerHTML = '<span class="text-muted">No consoles installed</span>';
        } else {
            consolesDiv.innerHTML = installedConsoles.map(cid => {
                const c = this.data.consoles.find(x => x.id === cid);
                if (!c) return '';
                const active = this.ship.combat.consoleStatus[cid] !== false;
                return `<div class="sheet-list-item ${active ? '' : 'disabled'}">
                    <div class="item-info">
                        <div class="item-name">${c.name} <span class="slot-type-badge ${c.type}" style="font-size:0.6rem;width:14px;height:14px;line-height:14px">${c.type.charAt(0).toUpperCase()}</span></div>
                        <div class="item-detail">${c.effect}</div>
                    </div>
                    <button class="item-toggle ${active ? '' : 'off'}" data-console-id="${cid}">${active ? 'Active' : 'Disabled'}</button>
                </div>`;
            }).join('');
        }

        // Weapons
        const weaponsDiv = document.getElementById('sheet-weapons');
        let weaponHtml = '';
        for (const pos of ['forward', 'rear']) {
            for (let i = 0; i < (this.ship.weapons[pos] || []).length; i++) {
                const wid = this.ship.weapons[pos][i];
                if (!wid) continue;
                const w = this.data.weapons.find(x => x.id === wid);
                if (!w) continue;
                const slotKey = `${pos}-${i}`;
                const active = this.ship.combat.weaponStatus[slotKey] !== false;
                weaponHtml += `<div class="sheet-list-item ${active ? '' : 'disabled'}">
                    <div class="item-info">
                        <div class="item-name">${w.name} <span class="text-muted">(${pos})</span></div>
                        <div class="item-detail">Dam: ${w.damage} | Dis: ${w.disruption} | Acc: ${w.accuracy >= 0 ? '+' : ''}${w.accuracy} | Crit: ${w.crit >= 0 ? '+' : ''}${w.crit} | Range: ${w.range} VU | Arc: ${w.arc} | ${w.type}</div>
                    </div>
                    <button class="item-toggle ${active ? '' : 'off'}" data-weapon-slot="${slotKey}">${active ? 'Active' : 'Offline'}</button>
                </div>`;
            }
        }
        weaponsDiv.innerHTML = weaponHtml || '<span class="text-muted">No weapons installed</span>';

        // Torpedoes
        const torpSection = document.getElementById('sheet-torpedo-section');
        const torpDiv = document.getElementById('sheet-torpedoes');
        if (this.ship.hasTorpedoTube) {
            torpSection.classList.remove('hidden');
            const loaded = (this.ship.torpedoes || []).filter(Boolean);
            if (loaded.length === 0) {
                torpDiv.innerHTML = '<span class="text-muted">Tube installed, no torpedoes loaded</span>';
            } else {
                torpDiv.innerHTML = loaded.map(tid => {
                    const t = this.data.torpedoes.find(x => x.id === tid);
                    if (!t) return '';
                    return `<div class="sheet-list-item">
                        <div class="item-info">
                            <div class="item-name">${t.name}</div>
                            <div class="item-detail">Dam: ${t.damage} | Dis: ${t.disruption} | Acc: +${t.accuracy} | Crit: +${t.crit} | Range: ${t.range} VU | Arc: ${t.arc}</div>
                            <div class="item-detail">${t.effect}</div>
                        </div>
                    </div>`;
                }).join('');
            }
        } else {
            torpSection.classList.add('hidden');
        }

        // Officers
        const officerDiv = document.getElementById('sheet-officers');
        officerDiv.innerHTML = this.OFFICER_POSITIONS.map(pos => {
            const off = this.ship.officers[pos.id];
            return `<div class="officer-card">
                <div class="position">${pos.title}</div>
                <div class="name">${off.name || '—'}</div>
                <div class="skill-info">${pos.skill}: ${off.skill || 0}</div>
            </div>`;
        }).join('');

        // Combat sidebar
        document.getElementById('sheet-shield-type').textContent = shield ? `${shield.type} Mk ${shield.mark}` : 'None';
        document.getElementById('shield-max').textContent = shield ? shield.capacity : 0;
        document.getElementById('shield-regen').textContent = shield ? shield.regeneration : 0;
        document.getElementById('shield-current').value = this.ship.combat.shieldCurrent;
        document.getElementById('hull-max').textContent = hullHP;
        document.getElementById('hull-current').value = this.ship.combat.hullCurrent;
        document.getElementById('crew-max').textContent = crew;
        document.getElementById('crew-current').value = this.ship.combat.crewCurrent;
        document.getElementById('disruption-total').value = this.ship.combat.disruption || 0;

        // Initiative formula
        document.getElementById('init-formula').textContent = `Sensors(${sensors >= 0 ? '+' : ''}${sensors}) + Acc(${acc >= 0 ? '+' : ''}${acc}) + 1d10`;

        // TN to hit
        document.getElementById('tn-to-hit').textContent = 3 * cq + man;
        document.getElementById('tn-formula').textContent = `3 × ${cq} + ${man >= 0 ? '+' : ''}${man}`;

        // Department checkboxes
        for (const [dept, checked] of Object.entries(this.ship.combat.departments || {})) {
            const cb = document.querySelector(`[data-dept="${dept}"]`);
            if (cb) cb.checked = checked;
        }

        // Turn counter
        document.getElementById('turn-counter').textContent = this.ship.combat.turn || 1;

        // Crit log
        this.renderCritLog();
    },

    // =========================================================================
    // Combat Actions
    // =========================================================================

    handleHPButton(target, delta) {
        const map = {
            shield: { input: 'shield-current', max: 'shield-max', field: 'shieldCurrent' },
            hull:   { input: 'hull-current',   max: 'hull-max',   field: 'hullCurrent' },
            crew:   { input: 'crew-current',   max: 'crew-max',   field: 'crewCurrent' }
        };
        const info = map[target];
        if (!info) return;

        const maxVal = parseInt(document.getElementById(info.max).textContent) || 0;
        let current = parseInt(document.getElementById(info.input).value) || 0;
        current = Math.max(0, Math.min(current + delta, maxVal));
        document.getElementById(info.input).value = current;
        this.ship.combat[info.field] = current;
        this.scheduleSave();
    },

    handleItemToggle(btn) {
        if (btn.dataset.consoleId) {
            const id = btn.dataset.consoleId;
            const wasActive = this.ship.combat.consoleStatus[id] !== false;
            this.ship.combat.consoleStatus[id] = !wasActive;
        } else if (btn.dataset.weaponSlot) {
            const key = btn.dataset.weaponSlot;
            const wasActive = this.ship.combat.weaponStatus[key] !== false;
            this.ship.combat.weaponStatus[key] = !wasActive;
        }
        this.renderSheet();
        this.scheduleSave();
    },

    regenShields() {
        const shield = this.getSelectedShield();
        if (!shield) return;

        const disruption = this.ship.combat.disruption || 0;
        const effectiveRegen = Math.max(0, shield.regeneration - disruption);
        const max = shield.capacity;
        let current = this.ship.combat.shieldCurrent;

        // Shields at 0 or below means collapsed — cannot regenerate during combat
        if (current <= 0) return;

        current = Math.min(current + effectiveRegen, max);
        this.ship.combat.shieldCurrent = current;
        document.getElementById('shield-current').value = current;
        this.scheduleSave();
    },

    rollInitiative() {
        const hull = this.getHull();
        if (!hull) return;

        const sensors = hull.sensors + this.getSensorBonus();
        const acc = hull.acceleration + this.getAccBonus();

        // Use DTD.dice.roll if available, else manual
        let d10;
        if (typeof DTD !== 'undefined' && DTD.dice && DTD.dice.roll) {
            const result = DTD.dice.roll(1, 1);
            d10 = result.total;
        } else {
            d10 = Math.floor(Math.random() * 10) + 1;
        }

        const total = sensors + acc + d10;
        document.getElementById('init-result').classList.remove('hidden');
        document.getElementById('init-value').textContent = `${total} (d10: ${d10})`;
    },

    resetDepartments() {
        this.ship.combat.departments = { maneuver: false, tactical: false, engineering: false, command: false, arcana: false };
        document.querySelectorAll('[data-dept]').forEach(cb => cb.checked = false);
        this.scheduleSave();
    },

    nextTurn() {
        this.ship.combat.turn = (this.ship.combat.turn || 1) + 1;
        this.resetDepartments();
        document.getElementById('turn-counter').textContent = this.ship.combat.turn;
        this.scheduleSave();
    },

    prevTurn() {
        this.ship.combat.turn = Math.max(1, (this.ship.combat.turn || 1) - 1);
        document.getElementById('turn-counter').textContent = this.ship.combat.turn;
        this.scheduleSave();
    },

    rollCritical() {
        const critMod = parseInt(document.getElementById('crit-modifier').value) || 0;

        let d10;
        if (typeof DTD !== 'undefined' && DTD.dice && DTD.dice.roll) {
            const result = DTD.dice.roll(1, 1);
            d10 = result.total;
        } else {
            d10 = Math.floor(Math.random() * 10) + 1;
        }

        const total = d10 + critMod;
        const entry = this.lookupCritical(total);

        this.ship.combat.critLog.push({
            roll: d10,
            modifier: critMod,
            total: total,
            name: entry.name,
            effect: entry.effect,
            turn: this.ship.combat.turn
        });

        this.renderCritLog();
        this.scheduleSave();
    },

    lookupCritical(total) {
        const table = this.data.criticalDamage;
        if (total < 1) return table[0];   // <1: Armor Scuffing
        if (total >= 13) return table[table.length - 1]; // 13+: Secondary Explosion
        // Find exact match
        const entry = table.find(e => e.roll === String(total));
        if (entry) return entry;
        return table[0]; // fallback
    },

    renderCritLog() {
        const container = document.getElementById('crit-log');
        const log = this.ship.combat.critLog || [];
        if (log.length === 0) {
            container.innerHTML = '<span class="text-muted" style="font-size:0.8rem">No critical hits yet</span>';
            return;
        }
        container.innerHTML = log.map((entry, i) => `
            <div class="crit-entry">
                <div class="crit-roll">Turn ${entry.turn} — Roll: ${entry.roll} + ${entry.modifier} = ${entry.total}</div>
                <div class="crit-name">${entry.name}</div>
                <div class="crit-effect">${entry.effect}</div>
            </div>
        `).join('');
    }
};

// =========================================================================
// Bootstrap
// =========================================================================

document.addEventListener('DOMContentLoaded', () => ShipTool.init());
