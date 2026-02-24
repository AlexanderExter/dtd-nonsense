/**
 * DTD Combat Tracker
 * Initiative, turn tracking, HP/conditions, and reference sidebar
 * for Dungeons the Dragoning 40,000: 7th Edition
 */

const Tracker = {

    // =========================================================================
    // Constants
    // =========================================================================

    CONDITIONS: [
        { id: 'amputation', name: 'Amputation', effect: 'Lose a limb permanently', leveled: false },
        { id: 'blinded', name: 'Blinded', effect: '-4k0 to physical Tests requiring sight', leveled: false },
        { id: 'bloodLoss', name: 'Blood Loss', effect: 'Con Test each round or take damage equal to level', leveled: true },
        { id: 'burning', name: 'Burning', effect: '1d10 Energy damage per round', leveled: false },
        { id: 'crippledArm', name: 'Crippled (Arm)', effect: 'Cannot use that arm', leveled: false },
        { id: 'crippledLeg', name: 'Crippled (Leg)', effect: 'Move at half speed, -2k0 to movement Tests', leveled: false },
        { id: 'dazzled', name: 'Dazzled', effect: '-1k0 sight Tests, -2k0 if directly looking at source', leveled: false },
        { id: 'deafened', name: 'Deafened', effect: '-2k0 to hearing-based Tests', leveled: false },
        { id: 'fatigue', name: 'Fatigue', effect: '-1k0 per level to all Tests', leveled: true },
        { id: 'frightened', name: 'Frightened', effect: 'Must flee or suffer -2k0 to all Tests', leveled: false },
        { id: 'helpless', name: 'Helpless', effect: 'Auto-hit in melee, double damage from melee', leveled: false },
        { id: 'pinned', name: 'Pinned', effect: 'Cannot move or take actions except to break free', leveled: false },
        { id: 'prone', name: 'Prone', effect: '+2k0 melee attacks against, -2k0 ranged against, -2k0 own attacks', leveled: false },
        { id: 'stunned', name: 'Stunned', effect: 'No Reactions, half move only', leveled: false },
        { id: 'toxic', name: 'Toxic', effect: 'Take damage equal to level each round', leveled: true }
    ],

    ACTIONS: [
        // Half Actions
        { name: 'Aim', type: 'H', desc: '+1k0 to next attack (cumulative to +3k0 for Full Aim)' },
        { name: 'Brace', type: 'H', desc: 'Brace a heavy weapon for firing' },
        { name: 'Called Shot', type: 'H', desc: 'Attack a specific location at -2k0', note: 'Must follow Aim or replace Attack' },
        { name: 'Cast Spell', type: 'H', desc: 'Cast a spell with casting time of Half Action' },
        { name: 'Delay', type: 'H', desc: 'Hold your turn to act later in initiative' },
        { name: 'Disengage', type: 'H', desc: 'Move safely out of melee without provoking' },
        { name: 'Draw/Holster', type: 'H', desc: 'Ready or put away a weapon' },
        { name: 'Feint', type: 'H', desc: 'Opposed Deceive vs Scrutiny to deny SD' },
        { name: 'Focus Power', type: 'H', desc: 'Activate a psychic/exaltation power' },
        { name: 'Grapple', type: 'H', desc: 'Attempt to grab opponent (opposed Weaponry Test)' },
        { name: 'Guarded Attack', type: 'H', desc: 'Attack at -1k0, gain +2 SD until next turn' },
        { name: 'Knock Down', type: 'H', desc: 'Opposed Strength Test to knock Prone' },
        { name: 'Maneuver', type: 'H', desc: 'Move up to your Speed in meters' },
        { name: 'Overwatch', type: 'H', desc: 'Wait to shoot anyone entering a kill zone' },
        { name: 'Ready', type: 'H', desc: 'Prepare an action triggered by a condition' },
        { name: 'Reload', type: 'H', desc: 'Reload a ranged weapon' },
        { name: 'Stand/Mount', type: 'H', desc: 'Stand from Prone or mount/dismount a vehicle' },
        { name: 'Standard Attack', type: 'H', desc: 'Make one melee or ranged attack' },
        { name: 'Tactical Advance', type: 'H', desc: 'Move from cover to cover without losing cover bonus' },
        { name: 'Use Skill', type: 'H', desc: 'Perform a Skill Test as a Half Action' },
        // Full Actions
        { name: 'All-Out Attack', type: 'F', desc: '+2k0 to attack, cannot Dodge/Parry until next turn' },
        { name: 'Charge', type: 'F', desc: 'Move up to 2\u00d7 Speed and attack at +1k0' },
        { name: 'Coup de Grace', type: 'F', desc: 'Instantly kill a Helpless target' },
        { name: 'Full Auto', type: 'F', desc: 'Fire in full auto, hit once +1 per 2 Raises' },
        { name: 'Full Aim', type: 'F', desc: '+2k0 (+3k0 with scope) to next attack' },
        { name: 'Lightning Attack', type: 'F', desc: 'Make multiple melee attacks (requires feat)' },
        { name: 'Run', type: 'F', desc: 'Move up to 3\u00d7 Speed, -2k0 to attacks against you' },
        { name: 'Semi-Auto Burst', type: 'F', desc: 'Fire semi-auto, hit +1 per 2 Raises' },
        { name: 'Stunt', type: 'F', desc: 'Perform a dramatic combat maneuver (SM adjudicated)' },
        { name: 'Swift Attack', type: 'F', desc: 'Make two melee attacks (requires feat)' },
        { name: 'Total Defense', type: 'F', desc: '+4k0 to all Parry/Dodge until next turn, cannot attack' },
        // Reactions
        { name: 'Dodge', type: 'R', desc: 'Roll Dexterity + Acrobatics vs attacker\'s roll to avoid' },
        { name: 'Parry', type: 'R', desc: 'Roll Weaponry Test vs attacker\'s roll to deflect' },
        // Free Actions
        { name: 'Drop Prone', type: 'Fr', desc: 'Fall Prone immediately' },
        { name: 'Speak', type: 'Fr', desc: 'Say a few words' }
    ],

    HIT_LOCATIONS: [
        { roll: 1, location: 'Head' },
        { roll: 2, location: 'Left Arm' },
        { roll: 3, location: 'Right Arm' },
        { roll: 4, location: 'Left Arm' },
        { roll: 5, location: 'Body' },
        { roll: 6, location: 'Body' },
        { roll: 7, location: 'Body' },
        { roll: 8, location: 'Right Leg' },
        { roll: 9, location: 'Left Leg' },
        { roll: 10, location: 'Right Leg' }
    ],

    SITUATIONAL_MODIFIERS: [
        { name: 'Combat Advantage', effect: '+1k0 to attack' },
        { name: 'Higher Ground', effect: '+1k0 to melee attacks' },
        { name: 'Ganging Up', effect: '+1k0 per ally in melee (max +3k0)' },
        { name: 'Off-Hand Attack', effect: '-2k0 to attack with off hand' },
        { name: 'Two-Weapon Fighting', effect: '-2k0 to both attacks (negate with Ambidextrous or feat)' },
        { name: 'Cover (Light)', effect: 'AP 4 against ranged attacks' },
        { name: 'Cover (Heavy)', effect: 'AP 8 against ranged attacks' },
        { name: 'Concealment', effect: 'Attacker suffers -1k0' },
        { name: 'Darkness', effect: '-2k0 to sight-based Tests' },
        { name: 'Point Blank (\u22642m)', effect: '+2k0 to ranged attacks' },
        { name: 'Short Range', effect: 'Normal (no modifier)' },
        { name: 'Long Range', effect: '-2k0 to ranged attacks' },
        { name: 'Extreme Range', effect: '-4k0 to ranged attacks' }
    ],

    ENCOUNTER_PREFIX: 'dtd_encounter_',
    ENCOUNTER_LIST_KEY: 'dtd_encounter_list',
    AUTOSAVE_DELAY: 500,

    // =========================================================================
    // State
    // =========================================================================

    state: {
        combatants: [],
        round: 0,
        activeTurnIndex: -1,
        encounterStarted: false,
        encounterId: null
    },

    _autoSave: null,
    _conditionPickerTarget: null,

    // =========================================================================
    // Initialization
    // =========================================================================

    init() {
        this._autoSave = DTD.debounce(() => this.saveEncounter(), this.AUTOSAVE_DELAY);
        this.bindEvents();
        this.renderSidebar();
        this.loadEncounterList();
        this.renderCombatants();
    },

    // =========================================================================
    // Event Binding
    // =========================================================================

    bindEvents() {
        // Delegated click handler
        document.body.addEventListener('click', e => {
            // Close condition picker if clicking elsewhere
            if (this._conditionPickerTarget && !e.target.closest('.condition-picker') && !e.target.closest('[data-action="add-condition"]')) {
                this.closeConditionPicker();
            }

            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const cardEl = btn.closest('[data-combatant-id]');
            const id = cardEl?.dataset.combatantId;

            switch (action) {
                case 'add-combatant': this.handleAddCombatant(); break;
                case 'quick-add': this.handleQuickAdd(); break;
                case 'roll-all': this.rollAllInitiative(); break;
                case 'next-turn': this.nextTurn(); break;
                case 'prev-turn': this.previousTurn(); break;
                case 'end-round': this.endRound(); break;
                case 'hp-plus': this.modifyHP(id, 1); break;
                case 'hp-minus': this.modifyHP(id, -1); break;
                case 'hp-plus5': this.modifyHP(id, 5); break;
                case 'hp-minus5': this.modifyHP(id, -5); break;
                case 'res-plus': this.modifyResource(id, 1); break;
                case 'res-minus': this.modifyResource(id, -1); break;
                case 'remove-combatant':
                    if (confirm('Remove this combatant?')) this.removeCombatant(id);
                    break;
                case 'remove-condition': {
                    const condId = btn.dataset.conditionId;
                    this.removeCondition(id, condId);
                    break;
                }
                case 'add-condition': {
                    this.openConditionPicker(id, btn);
                    break;
                }
                case 'pick-condition': {
                    const condId = btn.dataset.conditionId;
                    this.addCondition(this._conditionPickerTarget, condId);
                    this.closeConditionPicker();
                    break;
                }
                case 'toggle-expand': {
                    const details = cardEl?.querySelector('.card-details');
                    if (details) details.classList.toggle('open');
                    break;
                }
                case 'toggle-action': {
                    const tokenType = btn.dataset.tokenType;
                    this.toggleActionToken(id, tokenType);
                    break;
                }
                case 'roll-single-init': this.rollSingleInitiative(id); break;
                case 'import-sheet': this.importFromSheet(); break;
                case 'close-modal': this.closeModal(); break;
                case 'import-char': {
                    const charId = btn.dataset.charId;
                    this.handleImportChar(charId);
                    break;
                }
                case 'roll-location': this.rollHitLocation(); break;
                case 'calc-damage': this.handleCalcDamage(); break;
                case 'save-encounter': this.saveEncounter(); break;
                case 'load-encounter': this.handleLoadEncounter(); break;
                case 'export-encounter': this.exportEncounter(); break;
                case 'clear-encounter': this.clearEncounter(); break;
                case 'toggle-sidebar': this.toggleSidebar(); break;
                case 'toggle-add-form': this.toggleAddForm(); break;
            }
        });

        // Action filter input
        const filterInput = document.getElementById('action-filter');
        if (filterInput) {
            filterInput.addEventListener('input', DTD.debounce(e => {
                this.renderActionList(e.target.value);
            }, 150));
        }

        // Notes change handler (delegated)
        document.body.addEventListener('change', e => {
            if (e.target.matches('.combatant-notes')) {
                const cardEl = e.target.closest('[data-combatant-id]');
                if (cardEl) {
                    const c = this.getCombatant(cardEl.dataset.combatantId);
                    if (c) {
                        c.notes = e.target.value;
                        this._autoSave();
                    }
                }
            }
        });
    },

    // =========================================================================
    // Combatant Management
    // =========================================================================

    _genId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    createCombatant(data) {
        return {
            id: this._genId(),
            name: data.name || 'Unknown',
            dexterity: Number(data.dexterity) || 2,
            composure: Number(data.composure) || 2,
            modifier: Number(data.modifier) || 0,
            heroPoint: !!data.heroPoint,
            surprised: !!data.surprised,
            initiativeRoll: null,
            initiativeTotal: null,
            hpMax: Number(data.hpMax) || 8,
            hpCurrent: Number(data.hpMax) || 8,
            willpower: Number(data.willpower) || 2,
            sd: Number(data.sd) || 20,
            resilience: Number(data.resilience) || 3,
            resourceMax: Number(data.resourceMax) || 0,
            resourceCurrent: Number(data.resourceMax) || 0,
            resourceLabel: data.resourceLabel || '',
            conditions: [],
            actionBudget: { half1: false, half2: false, fullAction: false, reaction: false },
            notes: data.notes || '',
            imported: !!data.imported,
            importedData: data.importedData || null,
            isNpc: !!data.isNpc
        };
    },

    addCombatant(data) {
        const c = this.createCombatant(data);
        this.state.combatants.push(c);
        this.renderCombatants();
        this._autoSave();
        return c;
    },

    removeCombatant(id) {
        const idx = this.state.combatants.findIndex(c => c.id === id);
        if (idx === -1) return;

        this.state.combatants.splice(idx, 1);

        // Adjust active turn index
        if (this.state.activeTurnIndex >= this.state.combatants.length) {
            this.state.activeTurnIndex = Math.max(0, this.state.combatants.length - 1);
        }

        this.renderCombatants();
        this._autoSave();
    },

    getCombatant(id) {
        return this.state.combatants.find(c => c.id === id) || null;
    },

    // =========================================================================
    // Initiative
    // =========================================================================

    rollAllInitiative() {
        for (const c of this.state.combatants) {
            this._rollInitiativeFor(c);
        }
        this.sortByInitiative();
        this.state.round = 1;
        this.state.activeTurnIndex = 0;
        this.state.encounterStarted = true;
        this.updateRoundDisplay();
        this.renderCombatants();
        this._autoSave();

        // Skip surprised combatants at start
        this._skipSurprisedIfNeeded();
    },

    rollSingleInitiative(id) {
        const c = this.getCombatant(id);
        if (!c) return;
        this._rollInitiativeFor(c);
        this.sortByInitiative();
        this.renderCombatants();
        this._autoSave();
    },

    _rollInitiativeFor(c) {
        if (c.heroPoint) {
            c.initiativeRoll = 10;
        } else {
            // Roll 1d10 (single die, keep 1, no modifier on the die roll itself)
            const result = DTD.dice.roll(1, 1, 0);
            c.initiativeRoll = result.total;
        }
        c.initiativeTotal = c.initiativeRoll + c.dexterity + c.composure + c.modifier;
    },

    sortByInitiative() {
        this.state.combatants.sort((a, b) => {
            if (a.initiativeTotal === null && b.initiativeTotal === null) return 0;
            if (a.initiativeTotal === null) return 1;
            if (b.initiativeTotal === null) return -1;
            // Descending
            if (b.initiativeTotal !== a.initiativeTotal) return b.initiativeTotal - a.initiativeTotal;
            // Tie-break by Dex, then Composure
            if (b.dexterity !== a.dexterity) return b.dexterity - a.dexterity;
            return b.composure - a.composure;
        });
    },

    // =========================================================================
    // Turn Management
    // =========================================================================

    nextTurn() {
        if (this.state.combatants.length === 0) return;
        if (!this.state.encounterStarted) return;

        if (this.state.activeTurnIndex < this.state.combatants.length - 1) {
            this.state.activeTurnIndex++;
            this._skipSurprisedIfNeeded();
        }
        // If at end, do NOT auto-advance. User must click End Round.

        this.renderCombatants();
        this._autoSave();
    },

    previousTurn() {
        if (this.state.combatants.length === 0) return;
        if (!this.state.encounterStarted) return;

        if (this.state.activeTurnIndex > 0) {
            this.state.activeTurnIndex--;
        }

        this.renderCombatants();
        this._autoSave();
    },

    endRound() {
        if (!this.state.encounterStarted && this.state.combatants.length > 0) {
            // If encounter hasn't started, start it
            this.rollAllInitiative();
            return;
        }
        if (this.state.combatants.length === 0) return;

        // Process end-of-round effects
        this._processEndOfRound();

        // Advance round
        this.state.round++;
        this.state.activeTurnIndex = 0;

        // Reset action budgets
        for (const c of this.state.combatants) {
            c.actionBudget = { half1: false, half2: false, fullAction: false, reaction: false };
            // Clear surprised after round 1
            if (c.surprised && this.state.round > 1) {
                c.surprised = false;
            }
        }

        this.updateRoundDisplay();
        this.renderCombatants();
        this._autoSave();

        // Skip surprised on round 1
        if (this.state.round === 1) {
            this._skipSurprisedIfNeeded();
        }
    },

    _skipSurprisedIfNeeded() {
        if (this.state.round !== 1) return;
        const c = this.state.combatants[this.state.activeTurnIndex];
        if (c && c.surprised && this.state.activeTurnIndex < this.state.combatants.length - 1) {
            this.state.activeTurnIndex++;
            this.renderCombatants();
            // Recurse in case next is also surprised
            this._skipSurprisedIfNeeded();
        }
    },

    _processEndOfRound() {
        const alerts = [];
        const esc = s => DTD.escapeHtml(s);

        for (const c of this.state.combatants) {
            if (c.hpCurrent <= 0) continue; // Skip downed combatants

            for (const cond of c.conditions) {
                const def = this.CONDITIONS.find(d => d.id === cond.conditionId);
                if (!def) continue;

                switch (cond.conditionId) {
                    case 'burning':
                        alerts.push(`<strong>${esc(c.name)}</strong>: Burning \u2014 takes 1d10 Energy damage`);
                        break;
                    case 'bloodLoss':
                        alerts.push(`<strong>${esc(c.name)}</strong>: Blood Loss (${cond.level || 1}) \u2014 Constitution Test or take ${cond.level || 1} damage`);
                        break;
                    case 'toxic':
                        alerts.push(`<strong>${esc(c.name)}</strong>: Toxic (${cond.level || 1}) \u2014 takes ${cond.level || 1} damage`);
                        break;
                    case 'fatigue':
                        alerts.push(`<strong>${esc(c.name)}</strong>: Fatigue (${cond.level || 1}) \u2014 -${cond.level || 1}k0 to all Tests`);
                        break;
                }
            }
        }

        const alertsEl = document.getElementById('round-alerts');
        if (alerts.length > 0) {
            alertsEl.innerHTML = '<strong>End-of-Round Effects:</strong><ul>' +
                alerts.map(a => `<li>${a}</li>`).join('') + '</ul>';
            alertsEl.hidden = false;
        } else {
            alertsEl.hidden = true;
        }
    },

    updateRoundDisplay() {
        const el = document.getElementById('round-number');
        if (el) el.textContent = this.state.round;
    },

    // =========================================================================
    // HP & Resources
    // =========================================================================

    modifyHP(id, delta) {
        const c = this.getCombatant(id);
        if (!c) return;
        c.hpCurrent = Math.max(0, Math.min(c.hpMax, c.hpCurrent + delta));
        this.renderCombatants();
        this._autoSave();
    },

    modifyResource(id, delta) {
        const c = this.getCombatant(id);
        if (!c) return;
        c.resourceCurrent = Math.max(0, Math.min(c.resourceMax, c.resourceCurrent + delta));
        this.renderCombatants();
        this._autoSave();
    },

    getWoundStatus(c) {
        if (c.hpCurrent <= 0) return 'down';
        const lost = c.hpMax - c.hpCurrent;
        if (lost === 0) return 'healthy';
        if (lost <= c.willpower) return 'light';
        if (lost <= c.hpMax) return 'heavy';
        return 'critical';
    },

    // =========================================================================
    // Conditions
    // =========================================================================

    addCondition(id, conditionId, level) {
        const c = this.getCombatant(id);
        if (!c) return;

        const def = this.CONDITIONS.find(d => d.id === conditionId);
        if (!def) return;

        // Check if already has this condition
        const existing = c.conditions.find(x => x.conditionId === conditionId);
        if (existing) {
            if (def.leveled) {
                existing.level = (existing.level || 1) + 1;
            }
            // Non-leveled: already present, ignore
        } else {
            c.conditions.push({ conditionId, level: def.leveled ? (level || 1) : undefined });
        }

        this.renderCombatants();
        this._autoSave();
    },

    removeCondition(id, conditionId) {
        const c = this.getCombatant(id);
        if (!c) return;
        c.conditions = c.conditions.filter(x => x.conditionId !== conditionId);
        this.renderCombatants();
        this._autoSave();
    },

    openConditionPicker(combatantId, anchorEl) {
        this.closeConditionPicker();
        this._conditionPickerTarget = combatantId;

        const picker = document.createElement('div');
        picker.className = 'condition-picker';

        const c = this.getCombatant(combatantId);
        const existingIds = c ? c.conditions.map(x => x.conditionId) : [];

        for (const cond of this.CONDITIONS) {
            const btn = document.createElement('button');
            btn.className = 'condition-picker-item';
            btn.dataset.action = 'pick-condition';
            btn.dataset.conditionId = cond.id;
            btn.textContent = cond.name;
            if (existingIds.includes(cond.id)) {
                const def = this.CONDITIONS.find(d => d.id === cond.id);
                if (def && def.leveled) {
                    btn.textContent += ' (+1 level)';
                } else {
                    btn.style.opacity = '0.4';
                }
            }
            picker.appendChild(btn);
        }

        // Position near the anchor
        const rect = anchorEl.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.left = rect.left + 'px';
        picker.style.top = (rect.bottom + 4) + 'px';

        document.body.appendChild(picker);
    },

    closeConditionPicker() {
        this._conditionPickerTarget = null;
        const existing = document.querySelector('.condition-picker');
        if (existing) existing.remove();
    },

    // =========================================================================
    // Action Budget
    // =========================================================================

    toggleActionToken(id, tokenType) {
        const c = this.getCombatant(id);
        if (!c) return;

        const budget = c.actionBudget;

        if (tokenType === 'fullAction') {
            budget.fullAction = !budget.fullAction;
            if (budget.fullAction) {
                budget.half1 = false;
                budget.half2 = false;
            }
        } else if (tokenType === 'half1' || tokenType === 'half2') {
            budget[tokenType] = !budget[tokenType];
            if (budget[tokenType]) {
                budget.fullAction = false;
            }
        } else if (tokenType === 'reaction') {
            budget.reaction = !budget.reaction;
        }

        this.renderCombatants();
        this._autoSave();
    },

    // =========================================================================
    // Character Import
    // =========================================================================

    importFromSheet() {
        const chars = DTD.character.list();

        if (chars.length === 0) {
            this._showToast('No saved characters. Create one in the Character Sheet first.');
            return;
        }

        const listEl = document.getElementById('import-char-list');
        const esc = s => DTD.escapeHtml(s);

        listEl.innerHTML = chars.map(ch =>
            `<div class="import-char-item" data-action="import-char" data-char-id="${esc(ch.id)}">` +
                `<span class="import-char-name">${esc(ch.name || 'Unnamed')}</span>` +
                `<span class="btn btn-secondary btn-sm">Import</span>` +
            `</div>`
        ).join('');

        document.getElementById('import-modal').classList.add('open');
    },

    _showToast(message) {
        const existing = document.querySelector('.toast-msg');
        if (existing) existing.remove();

        const el = document.createElement('div');
        el.className = 'toast-msg';
        el.textContent = message;
        document.body.appendChild(el);

        // Trigger reflow then animate in
        requestAnimationFrame(() => el.classList.add('visible'));
        setTimeout(() => {
            el.classList.remove('visible');
            setTimeout(() => el.remove(), 300);
        }, 3000);
    },

    handleImportChar(charId) {
        const charData = DTD.character.load(charId);
        if (!charData) return;

        const chars = charData.characteristics || {};
        const dex = chars.dexterity || 2;
        const com = chars.composure || 2;
        const wil = chars.willpower || 2;
        const con = chars.constitution || 2;

        const hpMax = DTD.derived.calculateHP(con, wil);
        const sd = DTD.derived.calculateSD(dex, chars.wisdom || 2, 4); // Default size 4

        this.addCombatant({
            name: charData.name || 'Imported Character',
            dexterity: dex,
            composure: com,
            modifier: charData.modifiers?.initiative || 0,
            heroPoint: false,
            surprised: false,
            hpMax: hpMax,
            willpower: wil,
            sd: sd,
            resilience: DTD.derived.calculateResilience(4, charData.level || 1),
            resourceMax: charData.resourceCurrent || 0,
            resourceLabel: '',
            imported: true,
            importedData: charData,
            isNpc: false
        });

        this.closeModal();
    },

    closeModal() {
        document.getElementById('import-modal').classList.remove('open');
    },

    // =========================================================================
    // Form Handlers
    // =========================================================================

    handleAddCombatant() {
        const name = document.getElementById('add-name').value.trim();
        if (!name) { alert('Enter a name.'); return; }

        this.addCombatant({
            name,
            dexterity: document.getElementById('add-dex').value,
            composure: document.getElementById('add-composure').value,
            modifier: document.getElementById('add-modifier').value,
            heroPoint: document.getElementById('add-hero-point').checked,
            surprised: document.getElementById('add-surprised').checked,
            hpMax: document.getElementById('add-hp').value,
            willpower: document.getElementById('add-willpower').value,
            sd: document.getElementById('add-sd').value,
            resilience: document.getElementById('add-resilience').value,
            resourceMax: document.getElementById('add-resource-max').value,
            resourceLabel: document.getElementById('add-resource-label').value.trim(),
            isNpc: document.getElementById('add-is-npc').checked
        });

        // Reset name field
        document.getElementById('add-name').value = '';
    },

    handleQuickAdd() {
        const name = document.getElementById('quick-name').value.trim();
        const init = Number(document.getElementById('quick-init').value);
        if (!name) { alert('Enter a name.'); return; }

        const c = this.createCombatant({ name });
        c.initiativeTotal = init || 0;
        c.initiativeRoll = init || 0;
        this.state.combatants.push(c);
        this.sortByInitiative();
        this.renderCombatants();
        this._autoSave();

        document.getElementById('quick-name').value = '';
        document.getElementById('quick-init').value = '';
    },

    toggleAddForm() {
        const form = document.getElementById('add-form');
        const toggle = document.querySelector('.add-form-toggle');
        if (form.hidden) {
            form.hidden = false;
            toggle.classList.add('open');
        } else {
            form.hidden = true;
            toggle.classList.remove('open');
        }
    },

    toggleSidebar() {
        const sidebar = document.getElementById('reference-sidebar');
        sidebar.classList.toggle('open');
    },

    // =========================================================================
    // Damage Calculator
    // =========================================================================

    handleCalcDamage() {
        const raw = Number(document.getElementById('calc-raw').value) || 0;
        const ap = Number(document.getElementById('calc-ap').value) || 0;
        const pen = Number(document.getElementById('calc-pen').value) || 0;
        const resilience = Number(document.getElementById('calc-resilience').value) || 1;

        const result = this.calculateDamage(raw, ap, pen, resilience);
        const el = document.getElementById('calc-result');
        const effectiveAP = Math.max(0, ap - pen);
        const afterArmor = Math.max(0, raw - effectiveAP);

        el.innerHTML =
            `<div class="damage-label">Effective AP: ${effectiveAP} | After Armor: ${afterArmor}</div>` +
            `<div class="damage-value">${result} HP lost</div>`;
    },

    calculateDamage(raw, ap, pen, resilience) {
        const effectiveAP = Math.max(0, ap - pen);
        const afterArmor = Math.max(0, raw - effectiveAP);
        return Math.ceil(afterArmor / Math.max(1, resilience));
    },

    // =========================================================================
    // Hit Location
    // =========================================================================

    rollHitLocation() {
        const result = DTD.dice.roll(1, 1, 0);
        const rollVal = ((result.total - 1) % 10) + 1; // Clamp 1-10
        const loc = this.HIT_LOCATIONS.find(l => l.roll === rollVal);
        const el = document.getElementById('hit-location-result');
        el.innerHTML = `<span class="roll-value">${rollVal}</span> \u2014 <span class="location-name">${loc ? loc.location : '???'}</span>`;
    },

    // =========================================================================
    // Encounter Persistence
    // =========================================================================

    saveEncounter() {
        if (!this.state.encounterId) {
            this.state.encounterId = this._genId();
        }

        const key = this.ENCOUNTER_PREFIX + this.state.encounterId;
        const payload = {
            id: this.state.encounterId,
            name: this._getEncounterName(),
            savedAt: new Date().toISOString(),
            state: JSON.parse(JSON.stringify(this.state))
        };

        try {
            localStorage.setItem(key, JSON.stringify(payload));
            this._updateEncounterList(payload.id, payload.name);
            this.loadEncounterList();
        } catch (e) {
            console.error('Failed to save encounter:', e);
        }
    },

    _getEncounterName() {
        const names = this.state.combatants.slice(0, 3).map(c => c.name);
        if (this.state.combatants.length > 3) names.push('...');
        return names.join(', ') || 'Empty Encounter';
    },

    _updateEncounterList(id, name) {
        let list = [];
        try {
            const raw = localStorage.getItem(this.ENCOUNTER_LIST_KEY);
            list = raw ? JSON.parse(raw) : [];
        } catch (_) { /* ignore */ }

        const existing = list.find(e => e.id === id);
        if (existing) {
            existing.name = name;
        } else {
            list.push({ id, name });
        }
        localStorage.setItem(this.ENCOUNTER_LIST_KEY, JSON.stringify(list));
    },

    loadEncounterList() {
        const select = document.getElementById('encounter-load-select');
        if (!select) return;

        let list = [];
        try {
            const raw = localStorage.getItem(this.ENCOUNTER_LIST_KEY);
            list = raw ? JSON.parse(raw) : [];
        } catch (_) { /* ignore */ }

        select.innerHTML = '<option value="">Load encounter\u2026</option>';
        for (const item of list) {
            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = item.name;
            select.appendChild(opt);
        }
    },

    handleLoadEncounter() {
        const select = document.getElementById('encounter-load-select');
        const id = select?.value;
        if (!id) return;
        this.loadEncounter(id);
    },

    loadEncounter(id) {
        const key = this.ENCOUNTER_PREFIX + id;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const payload = JSON.parse(raw);
            this.state = payload.state;
            this.updateRoundDisplay();
            this.renderCombatants();
        } catch (e) {
            console.error('Failed to load encounter:', e);
        }
    },

    exportEncounter() {
        const payload = {
            id: this.state.encounterId || this._genId(),
            name: this._getEncounterName(),
            exportedAt: new Date().toISOString(),
            state: JSON.parse(JSON.stringify(this.state))
        };

        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'encounter_' + (payload.name || 'export').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
        a.click();
        URL.revokeObjectURL(url);
    },

    clearEncounter() {
        if (!confirm('Clear all combatants and reset the encounter?')) return;
        this.state = {
            combatants: [],
            round: 0,
            activeTurnIndex: -1,
            encounterStarted: false,
            encounterId: null
        };
        document.getElementById('round-alerts').hidden = true;
        this.updateRoundDisplay();
        this.renderCombatants();
    },

    // =========================================================================
    // Rendering — Combatant List
    // =========================================================================

    renderCombatants() {
        const container = document.getElementById('combatant-list');
        if (!container) return;

        if (this.state.combatants.length === 0) {
            container.innerHTML =
                '<div class="empty-state">' +
                    '<div class="empty-state-icon">\u2694\uFE0F</div>' +
                    '<p>No combatants yet. Add some above to begin.</p>' +
                '</div>';
            return;
        }

        // Detect ties
        const tieSet = new Set();
        for (let i = 0; i < this.state.combatants.length; i++) {
            for (let j = i + 1; j < this.state.combatants.length; j++) {
                const a = this.state.combatants[i];
                const b = this.state.combatants[j];
                if (a.initiativeTotal !== null && a.initiativeTotal === b.initiativeTotal) {
                    tieSet.add(a.id);
                    tieSet.add(b.id);
                }
            }
        }

        container.innerHTML = this.state.combatants.map((c, i) =>
            this.renderCard(c, i, tieSet.has(c.id))
        ).join('');

        // Init accordion in sidebar (in case not done)
        const sidebarAcc = document.getElementById('sidebar-accordion');
        if (sidebarAcc && !sidebarAcc._bound) {
            DTD.initAccordion(sidebarAcc);
            sidebarAcc._bound = true;
        }
    },

    renderCard(c, index, hasTie) {
        const esc = s => DTD.escapeHtml(String(s));
        const isActive = this.state.encounterStarted && index === this.state.activeTurnIndex;
        const isDown = c.hpCurrent <= 0;
        const woundStatus = this.getWoundStatus(c);

        let classes = 'combatant-card';
        if (isActive) classes += ' active';
        if (isDown) classes += ' defeated';

        const initDisplay = c.initiativeTotal !== null ? c.initiativeTotal : '\u2014';

        // Action budget
        const budget = c.actionBudget;
        const halfDisabled = budget.fullAction ? ' disabled' : '';
        const fullDisabled = (budget.half1 || budget.half2) ? ' disabled' : '';

        // Conditions
        const conditionChips = c.conditions.map(cond => {
            const def = this.CONDITIONS.find(d => d.id === cond.conditionId);
            const label = def ? def.name : cond.conditionId;
            const levelText = cond.level ? ` (${cond.level})` : '';
            return `<span class="condition-chip" title="${esc(def?.effect || '')}">` +
                `${esc(label)}${levelText} ` +
                `<button class="remove-condition" data-action="remove-condition" data-condition-id="${esc(cond.conditionId)}">\u00d7</button>` +
            `</span>`;
        }).join('');

        // HP bar
        const hpPct = c.hpMax > 0 ? Math.round((c.hpCurrent / c.hpMax) * 100) : 0;

        // Resource bar (only if resourceMax > 0)
        const resPct = c.resourceMax > 0 ? Math.round((c.resourceCurrent / c.resourceMax) * 100) : 0;
        const resourceHtml = c.resourceMax > 0 ? `
            <div class="resource-bar-wrapper">
                <div class="resource-bar-header">
                    <span class="resource-bar-label">${esc(c.resourceLabel || 'Resource')}</span>
                    <div class="resource-controls">
                        <button class="hp-btn" data-action="res-minus">\u2212</button>
                        <span class="resource-bar-value">${c.resourceCurrent}/${c.resourceMax}</span>
                        <button class="hp-btn" data-action="res-plus">+</button>
                    </div>
                </div>
                <div class="resource-bar"><div class="resource-bar-fill" style="width:${resPct}%"></div></div>
            </div>` : '';

        // Badges
        let badges = '';
        if (c.surprised && this.state.round <= 1) badges += '<span class="surprised-badge">Surprised</span>';
        if (hasTie) badges += '<span class="tie-badge">TIE</span>';
        if (c.isNpc) badges += '<span class="npc-badge">NPC</span>';

        return `
        <div class="${classes}" data-combatant-id="${esc(c.id)}">
            <div class="card-top">
                <span class="drag-handle">\u2261</span>
                <div class="initiative-display">${initDisplay}</div>
                <span class="combatant-name">${esc(c.name)}${badges}</span>
                <span class="wound-badge ${woundStatus}">${woundStatus}</span>
                <div class="card-top-actions">
                    <button data-action="roll-single-init" title="Re-roll initiative">\uD83C\uDFB2</button>
                    <button data-action="toggle-expand" title="Details">\u2026</button>
                    <button data-action="remove-combatant" title="Remove">\u00d7</button>
                </div>
            </div>

            <div class="stat-row">
                <div class="stat-item"><span class="stat-label">SD</span> <span class="stat-value">${c.sd}</span></div>
                <div class="stat-item"><span class="stat-label">Dex</span> <span class="stat-value">${c.dexterity}</span></div>
                <div class="stat-item"><span class="stat-label">Com</span> <span class="stat-value">${c.composure}</span></div>
                <div class="stat-item"><span class="stat-label">Wil</span> <span class="stat-value">${c.willpower}</span></div>
                <div class="stat-item"><span class="stat-label">Res</span> <span class="stat-value">${c.resilience}</span></div>
            </div>

            <div class="hp-bar-wrapper">
                <div class="hp-bar-header">
                    <span class="hp-bar-label">Hit Points</span>
                    <div class="hp-bar-controls">
                        <button class="hp-btn" data-action="hp-minus5">-5</button>
                        <button class="hp-btn" data-action="hp-minus">\u22121</button>
                        <span class="hp-bar-value">${c.hpCurrent} / ${c.hpMax}</span>
                        <button class="hp-btn" data-action="hp-plus">+1</button>
                        <button class="hp-btn" data-action="hp-plus5">+5</button>
                    </div>
                </div>
                <div class="hp-bar"><div class="hp-bar-fill ${woundStatus}" style="width:${hpPct}%"></div></div>
            </div>

            ${resourceHtml}

            <div class="action-budget">
                <span class="stat-label">Actions:</span>
                <button class="action-token${budget.half1 ? ' used' : ''}${halfDisabled}" data-action="toggle-action" data-token-type="half1">
                    <span class="action-token-check"></span> Half 1
                </button>
                <button class="action-token${budget.half2 ? ' used' : ''}${halfDisabled}" data-action="toggle-action" data-token-type="half2">
                    <span class="action-token-check"></span> Half 2
                </button>
                <button class="action-token${budget.fullAction ? ' used' : ''}${fullDisabled}" data-action="toggle-action" data-token-type="fullAction">
                    <span class="action-token-check"></span> Full
                </button>
                <button class="action-token${budget.reaction ? ' used' : ''}" data-action="toggle-action" data-token-type="reaction">
                    <span class="action-token-check"></span> Reaction
                </button>
            </div>

            <div class="conditions-area">
                ${conditionChips}
                <button class="add-condition-btn" data-action="add-condition" title="Add condition">+</button>
            </div>

            <div class="card-details">
                <label class="stat-label">Notes</label>
                <textarea class="combatant-notes" placeholder="Notes\u2026">${esc(c.notes)}</textarea>
            </div>
        </div>`;
    },

    // =========================================================================
    // Rendering — Sidebar
    // =========================================================================

    renderSidebar() {
        this.renderActionList('');
        this.renderConditionsRef();
        this.renderModifiersRef();
        this.renderHitLocationTable();
    },

    renderActionList(filter) {
        const container = document.getElementById('action-list');
        if (!container) return;
        const esc = s => DTD.escapeHtml(s);

        const lowerFilter = (filter || '').toLowerCase();
        const filtered = lowerFilter
            ? this.ACTIONS.filter(a =>
                a.name.toLowerCase().includes(lowerFilter) ||
                a.desc.toLowerCase().includes(lowerFilter) ||
                a.type.toLowerCase().includes(lowerFilter))
            : this.ACTIONS;

        const typeLabels = { H: 'Half', F: 'Full', R: 'React', Fr: 'Free' };

        container.innerHTML = filtered.map(a =>
            `<div class="action-item">` +
                `<span class="action-type-badge type-${a.type}">${a.type}</span>` +
                `<span class="action-name">${esc(a.name)}</span>` +
                `<span class="action-desc">${esc(a.desc)}</span>` +
            `</div>`
        ).join('');
    },

    renderConditionsRef() {
        const container = document.getElementById('conditions-ref');
        if (!container) return;
        const esc = s => DTD.escapeHtml(s);

        container.innerHTML = this.CONDITIONS.map(c => {
            const leveled = c.leveled ? '<span class="condition-ref-leveled"> (leveled)</span>' : '';
            return `<div class="condition-ref-item">` +
                `<span class="condition-ref-name">${esc(c.name)}</span>${leveled}<br>` +
                `<span class="condition-ref-effect">${esc(c.effect)}</span>` +
            `</div>`;
        }).join('');
    },

    renderModifiersRef() {
        const container = document.getElementById('modifiers-ref');
        if (!container) return;
        const esc = s => DTD.escapeHtml(s);

        container.innerHTML = this.SITUATIONAL_MODIFIERS.map(m =>
            `<div class="modifier-item">` +
                `<span class="modifier-name">${esc(m.name)}</span>` +
                `<span class="modifier-effect">${esc(m.effect)}</span>` +
            `</div>`
        ).join('');
    },

    renderHitLocationTable() {
        const container = document.getElementById('hit-location-ref');
        if (!container) return;

        container.innerHTML =
            '<table class="hit-location-table">' +
            '<thead><tr><th>d10</th><th>Location</th></tr></thead>' +
            '<tbody>' +
            this.HIT_LOCATIONS.map(l =>
                `<tr><td>${l.roll}</td><td>${DTD.escapeHtml(l.location)}</td></tr>`
            ).join('') +
            '</tbody></table>';
    }
};

// =========================================================================
// Bootstrap
// =========================================================================

document.addEventListener('DOMContentLoaded', () => Tracker.init());
