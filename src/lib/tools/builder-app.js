/**
 * DTD Character Builder — Revised (Phase 1.2)
 *
 * Guided character creation wizard outputting canonical Character Sheet JSON.
 * Uses object literal pattern with delegated event handling.
 * Depends on: core.js for data loading, derived stat formulas,
 *             character persistence, and XP cost tables.
 */

import { loadAllData, escapeHtml, character, derived, debounce } from '@/lib/dtd/core.js';

const Builder = {

    // =========================================================================
    // Constants
    // =========================================================================

    TOTAL_XP: 600,

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

    BASE_CHAR_DOT: 1,
    CHAR_PRIORITY_DOTS: { primary: 6, secondary: 4, tertiary: 2 },
    SKILL_PRIORITY_DOTS: { primary: 8, secondary: 6, tertiary: 4 },
    MAX_CHAR_DOT: 6,
    CREATION_CHAR_CAP: 4,   // "You may not bring any Characteristic to 5 in this step"
    MAX_SKILL_DOT: 6,
    CREATION_SKILL_CAP: 3,  // "No skill can be raised above 3 dots during this step"
    BG_BUDGET: 7,
    MAX_BG_DOT: 5,
    MAX_BG_FREE_DOT: 3,     // Free dots capped at 3; dots 4-5 require XP

    STEP_LABELS: [
        'Identity', 'Race', 'Exaltation', 'Characteristics', 'Skills',
        'Backgrounds', 'Alignment', 'Classes', 'Feats', 'Equipment', 'Review'
    ],

    // =========================================================================
    // State
    // =========================================================================

    /** Game data loaded from JSON files */
    data: {},

    /** The canonical character object (always in Sheet format) */
    char: null,

    /** Builder-only tracking (not exported) */
    meta: {
        step: 1,
        stepsCompleted: new Array(11).fill(false),
        charPriority: { physical: null, social: null, mental: null },
        skillPriority: { physical: null, social: null, mental: null },
        charDotsSpent: { physical: 0, social: 0, mental: 0 },
        skillDotsSpent: { physical: 0, social: 0, mental: 0 },
        /** Equipment package ID + resolved choices */
        equipmentPkg: null,
        equipmentChoices: {}
    },

    // =========================================================================
    // Initialization
    // =========================================================================

    async init() {
        try {
            this.data = await loadAllData([
                'races.json', 'exaltations.json', 'skills.json', 'classes.json',
                'feats.json', 'backgrounds.json', 'alignments.json',
                'equipment.json', 'weapons.json'
            ]);
        } catch (e) {
            console.error('Builder: failed to load data', e);
        }

        this.char = character.createDefault();
        // Builder starts chars at 1; creation dots raise them (free, no XP)
        for (const c of Object.keys(this.char.characteristics)) {
            this.char.characteristics[c] = this.BASE_CHAR_DOT;
        }
        this.populateTrackFilter();
        this.bindEvents();
        this.renderAll();
        this.openStep(1);
    },

    // =========================================================================
    // Event Binding (delegated)
    // =========================================================================

    bindEvents() {
        const wizard = document.getElementById('wizard');

        // Accordion headers (delegated)
        wizard.addEventListener('click', (e) => {
            const header = e.target.closest('.accordion-header');
            if (header) {
                const step = parseInt(header.closest('.accordion-item').dataset.step);
                this.openStep(step);
                return;
            }

            // Selection cards (race, exaltation, alignment, class, feat, equipment)
            const card = e.target.closest('.sel-card');
            if (card) {
                const grid = card.closest('.selection-grid');
                if (!grid) return;
                const id = card.dataset.id;
                if (grid.id === 'race-grid')        this.selectRace(id);
                if (grid.id === 'exaltation-grid')   this.selectExaltation(id);
                if (grid.id === 'alignment-grid')    this.selectAlignment(id);
                if (grid.id === 'class-grid')        this.showClassDetail(id);
                if (grid.id === 'feat-grid')         this.showFeatDetail(id);
                if (grid.id === 'ah-grid')           this.showAHDetail(id);
                if (grid.id === 'equipment-grid')    this.selectEquipment(id);
                return;
            }

            // Dot +/- buttons
            const dotBtn = e.target.closest('.d-btn');
            if (dotBtn) {
                const delta = parseInt(dotBtn.dataset.delta);
                if (dotBtn.dataset.char) this.adjustChar(dotBtn.dataset.char, delta);
                if (dotBtn.dataset.skill) this.adjustSkill(dotBtn.dataset.skill, delta);
                if (dotBtn.dataset.bg) this.adjustBackground(dotBtn.dataset.bg, delta);
                return;
            }

            // Tag pill remove buttons
            const removeTag = e.target.closest('.remove-tag');
            if (removeTag) {
                if (removeTag.dataset.classId) this.removeClass(removeTag.dataset.classId);
                if (removeTag.dataset.featId) this.removeFeat(removeTag.dataset.featId);
                if (removeTag.dataset.ahId) this.removeAH(removeTag.dataset.ahId);
                return;
            }
        });

        // Delegated change events (filters, priority selects, choice selects)
        wizard.addEventListener('change', (e) => {
            if (e.target.id === 'filter-race-source')    this.renderRaces();
            if (e.target.id === 'filter-pantheon')        this.renderAlignments();
            if (e.target.id === 'filter-class-track') this.renderClasses();
            if (e.target.id === 'filter-feat-cat')        this.renderFeats();
            if (e.target.id === 'filter-ah-cat')          this.renderAH();

            // Char priority
            if (e.target.classList.contains('char-priority-sel')) {
                this.setCharPriority(e.target.dataset.group, e.target.value);
            }
            // Skill priority
            if (e.target.classList.contains('skill-priority-sel')) {
                this.setSkillPriority(e.target.dataset.group, e.target.value);
            }
            // Race char bonus choice
            if (e.target.id === 'race-char-choice') {
                this.char.raceCharBonus = e.target.value || '';
                this.updateSidebar();
            }
            // Devotion slider
            // Equipment choice selects
            if (e.target.classList.contains('equip-choice-sel')) {
                this.meta.equipmentChoices[e.target.dataset.idx] = e.target.value || null;
            }
        });

        // Feat search (debounced)
        const featSearch = document.getElementById('filter-feat-search');
        if (featSearch) {
            featSearch.addEventListener('input', debounce(() => this.renderFeats(), 250));
        }

        // Identity fields
        document.getElementById('field-name')?.addEventListener('input', (e) => {
            this.char.name = e.target.value;
            this.updateStepCompletion(1, !!this.char.name.trim());
            this.updateSidebar();
        });
        document.getElementById('field-player')?.addEventListener('input', (e) => {
            this.char.player = e.target.value;
        });
        document.getElementById('field-concept')?.addEventListener('input', (e) => {
            this.char.concept = e.target.value;
        });

        // Sidebar buttons
        document.getElementById('btn-open-sheet')?.addEventListener('click', () => this.openInSheet());
        document.getElementById('btn-export')?.addEventListener('click', () => this.exportJSON());
        document.getElementById('btn-start-over')?.addEventListener('click', () => this.startOver());

        // Step checklist clicks
        document.getElementById('step-checklist')?.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (li?.dataset.step) this.openStep(parseInt(li.dataset.step));
        });
    },

    // =========================================================================
    // Accordion Navigation
    // =========================================================================

    openStep(n) {
        this.meta.step = n;
        document.querySelectorAll('#wizard .accordion-item').forEach(item => {
            const s = parseInt(item.dataset.step);
            item.classList.toggle('open', s === n);
        });
        // Update checklist active state
        document.querySelectorAll('#step-checklist li').forEach(li => {
            li.classList.toggle('active', parseInt(li.dataset.step) === n);
        });
        // Lazy render step content when opened
        if (n === 11) this.renderReview();
    },

    // =========================================================================
    // Track filter population
    // =========================================================================

    populateTrackFilter() {
        const sel = document.getElementById('filter-class-track');
        if (!sel || !this.data.classes?.tracks) return;
        const tracks = this.data.classes.tracks;
        for (const [id, track] of Object.entries(tracks)) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = track.name;
            sel.appendChild(opt);
        }
    },

    // =========================================================================
    // Render All
    // =========================================================================

    renderAll() {
        this.renderSidebar();
        this.renderRaces();
        this.renderExaltations();
        this.renderCharPriorities();
        this.renderCharAllocation();
        this.renderSkillPriorities();
        this.renderSkillAllocation();
        this.renderBackgrounds();
        this.renderAlignments();
        this.renderClasses();
        this.renderFeats();
        this.renderAH();
        this.renderEquipment();
        this.updateAllSummaries();
    },

    // =========================================================================
    // Helpers
    // =========================================================================

    esc(str) {
        return escapeHtml(String(str ?? ''));
    },

    capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    },

    /** Look up race object by ID */
    getRace(id) {
        return (this.data.races?.races || []).find(r => r.id === id);
    },

    /** Look up exaltation object by ID */
    getExaltation(id) {
        return (this.data.exaltations?.exaltations || []).find(e => e.id === id);
    },

    /** Get total characteristic values (base + racial bonus) */
    getTotalChars() {
        const base = this.char.characteristics;
        const result = {};
        for (const c of Object.keys(base)) {
            result[c] = base[c] || this.BASE_CHAR_DOT;
        }
        // Racial bonus
        if (this.char.raceCharBonus && result[this.char.raceCharBonus] !== undefined) {
            result[this.char.raceCharBonus] += 1;
        }
        return result;
    },

    /** Calculate character level (total completed class levels) */
    getLevel() {
        return (this.char.classes || []).reduce((sum, c) => sum + (c.level || 1), 0);
    },

    /** Get race size */
    getSize() {
        const race = this.getRace(this.char.race);
        return race?.size ?? 4;
    },

    // =========================================================================
    // XP Calculations
    // =========================================================================

    calcXP() {
        const breakdown = {
            classes: 0,
            feats: 0,
            assets: 0,
            hindrances: 0,
            backgrounds: 0
        };

        // Characteristics: FREE during creation (covered by priority dots)
        // Skills: FREE during creation (covered by priority dots)

        // Classes: 100 XP per class purchased, first one is free
        const classCount = (this.char.classes || []).length;
        if (classCount > 1) {
            breakdown.classes = (classCount - 1) * 100;
        }

        // Feats: 100 XP each
        breakdown.feats = (this.char.feats || []).length * 100;

        // Assets: 100 XP each
        breakdown.assets = (this.char.assets || []).length * 100;

        // Hindrances: refund XP
        const allFeats = this.data.feats?.feats || [];
        for (const h of (this.char.hindrances || [])) {
            const feat = allFeats.find(f => f.id === (h.name || h));
            breakdown.hindrances -= (feat?.bonusXP || 100);
        }

        // Backgrounds: dots 4-5 cost 100 XP each (dots 1-3 are free from budget)
        for (const b of (this.char.backgrounds || [])) {
            const d = b.dots || 0;
            if (d >= 4) breakdown.backgrounds += 100;  // 4th dot
            if (d >= 5) breakdown.backgrounds += 100;  // 5th dot
        }

        const spent = Object.values(breakdown).reduce((a, b) => a + b, 0);
        return { breakdown, spent, remaining: this.TOTAL_XP - spent };
    },

    // =========================================================================
    // Sidebar
    // =========================================================================

    renderSidebar() {
        this.renderStepChecklist();
        this.updateSidebar();
    },

    renderStepChecklist() {
        const ol = document.getElementById('step-checklist');
        if (!ol) return;
        ol.innerHTML = this.STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = this.meta.stepsCompleted[i];
            const active = this.meta.step === n;
            return `<li data-step="${n}" class="${done ? 'done' : ''} ${active ? 'active' : ''}">
                <span class="step-check">${done ? '✓' : '○'}</span> ${label}
            </li>`;
        }).join('');
    },

    updateSidebar() {
        // Name
        const nameEl = document.getElementById('sidebar-name');
        if (nameEl) nameEl.textContent = this.char.name || 'New Character';

        // Badges
        const raceEl = document.getElementById('sidebar-race');
        const exEl = document.getElementById('sidebar-exaltation');
        const race = this.getRace(this.char.race);
        const ex = this.getExaltation(this.char.exaltation);
        if (raceEl) {
            raceEl.textContent = race?.name || '—';
            raceEl.classList.toggle('active', !!race);
        }
        if (exEl) {
            exEl.textContent = ex?.name || '—';
            exEl.classList.toggle('active', !!ex);
        }

        // Derived stats
        const chars = this.getTotalChars();
        const size = this.getSize();
        const level = this.getLevel();
        const isHalfling = this.char.race === 'halfling';

        this._setStat('sidebar-sd', derived.calculateSD(chars.dexterity, chars.wisdom, size, isHalfling));
        this._setStat('sidebar-hp', derived.calculateHP(chars.constitution, chars.willpower));
        this._setStat('sidebar-md', derived.calculateMentalDefense(chars.composure));
        this._setStat('sidebar-resolve', derived.calculateResolve(chars.willpower, chars.composure));
        this._setStat('sidebar-speed', derived.calculateSpeed(chars.strength, chars.dexterity));
        this._setStat('sidebar-resilience', derived.calculateResilience(size, level));
        this._setStat('sidebar-initiative', derived.calculateInitiativeBase(chars.dexterity, chars.composure));

        // XP
        const xp = this.calcXP();
        const remEl = document.getElementById('xp-remaining');
        if (remEl) {
            remEl.textContent = xp.remaining;
            remEl.classList.toggle('over', xp.remaining < 0);
        }

        // XP breakdown
        const bdEl = document.getElementById('xp-breakdown');
        if (bdEl) {
            const rows = [];
            const bd = xp.breakdown;
            if (bd.characteristics) rows.push(['Characteristics', bd.characteristics]);
            if (bd.skills) rows.push(['Skills', bd.skills]);
            if (bd.classes) rows.push(['Classes', bd.classes]);
            if (bd.feats) rows.push(['Feats', bd.feats]);
            if (bd.assets) rows.push(['Assets', bd.assets]);
            if (bd.hindrances) rows.push(['Hindrances', bd.hindrances]);
            bdEl.innerHTML = rows.map(([l, v]) =>
                `<div class="xp-row"><span>${l}</span><span>${v > 0 ? '' : ''}${v}</span></div>`
            ).join('');
        }

        this.renderStepChecklist();
    },

    _setStat(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    },

    // =========================================================================
    // Step Completion Tracking
    // =========================================================================

    updateStepCompletion(stepNum, isDone) {
        this.meta.stepsCompleted[stepNum - 1] = isDone;
        const item = document.querySelector(`.accordion-item[data-step="${stepNum}"]`);
        if (item) item.classList.toggle('done', isDone);
        this.renderStepChecklist();
    },

    updateAllSummaries() {
        // Step 1: Identity
        this._setStepSummary(1, this.char.name || '');
        this.updateStepCompletion(1, !!this.char.name?.trim());

        // Step 2: Race
        const race = this.getRace(this.char.race);
        this._setStepSummary(2, race?.name || '');
        this.updateStepCompletion(2, !!race);

        // Step 3: Exaltation
        const ex = this.getExaltation(this.char.exaltation);
        this._setStepSummary(3, ex?.name || '');
        this.updateStepCompletion(3, !!ex);

        // Step 4: Characteristics
        this.updateCharSummary();

        // Step 5: Skills
        this.updateSkillSummary();

        // Step 6: Backgrounds
        this.updateBgSummary();

        // Step 7: Alignment
        this._setStepSummary(7, this.char.alignment ?
            (this.data.alignments?.alignments?.find(a => a.id === this.char.alignment)?.name || this.char.alignment) : '');
        this.updateStepCompletion(7, !!this.char.alignment);

        // Step 8: Classes
        const classCount = (this.char.classes || []).length;
        this._setStepSummary(8, classCount ? `${classCount} class${classCount > 1 ? 'es' : ''}` : '');
        this.updateStepCompletion(8, classCount > 0);

        // Step 9: Feats
        const featTotal = (this.char.feats?.length || 0) + (this.char.assets?.length || 0) + (this.char.hindrances?.length || 0);
        this._setStepSummary(9, featTotal ? `${featTotal} selected` : '');
        // Feats are optional — mark complete if any feats OR step was visited
        this.updateStepCompletion(9, featTotal > 0);

        // Step 10: Equipment
        this._setStepSummary(10, this.meta.equipmentPkg || '');
        this.updateStepCompletion(10, !!this.meta.equipmentPkg);

        // Step 11: Review
        this._setStepSummary(11, '');
    },

    _setStepSummary(n, text) {
        const el = document.getElementById(`step-summary-${n}`);
        if (el) el.textContent = text;
    },

    // =========================================================================
    // Step 2: Race
    // =========================================================================

    renderRaces() {
        const grid = document.getElementById('race-grid');
        if (!grid) return;
        const filter = document.getElementById('filter-race-source')?.value || 'all';
        let races = this.data.races?.races || [];
        if (filter !== 'all') races = races.filter(r => r.source === filter);

        grid.innerHTML = races.map(r => {
            const bonusText = r.charBonus?.description || '';
            return `<div class="sel-card ${this.char.race === r.id ? 'selected' : ''}" data-id="${r.id}">
                <h4>${this.esc(r.name)}</h4>
                <div class="card-sub">Size ${r.size} · ${r.source === 'book2' ? 'Book 2' : 'Core'}</div>
                <div class="card-preview">${this.esc(bonusText)}</div>
            </div>`;
        }).join('');
    },

    selectRace(id) {
        const race = this.getRace(id);
        if (!race) return;
        this.char.race = id;
        this.char.raceCharBonus = '';
        // Auto-set single-option char bonus
        if (race.charBonus?.options?.length === 1 && race.charBonus.options[0] !== 'any') {
            this.char.raceCharBonus = race.charBonus.options[0];
        }
        this.renderRaces();
        this.showRaceDetail(race);
        this.updateStepCompletion(2, true);
        this._setStepSummary(2, race.name);
        this.renderCharAllocation();
        this.renderFeats();
        this.updateSidebar();
    },

    showRaceDetail(race) {
        const el = document.getElementById('race-detail');
        if (!el) return;

        // Char bonus UI
        let charBonusHtml = '';
        const opts = race.charBonus?.options || [];
        if (opts.length > 1 || (opts.length === 1 && opts[0] === 'any')) {
            const list = opts[0] === 'any'
                ? Object.keys(this.char.characteristics)
                : opts;
            charBonusHtml = `<select id="race-char-choice" class="choice-select">
                <option value="">Choose +1…</option>
                ${list.map(c => `<option value="${c}" ${this.char.raceCharBonus === c ? 'selected' : ''}>${this.capitalize(c)}</option>`).join('')}
            </select>`;
        } else if (opts.length === 1) {
            charBonusHtml = `<span>+1 ${this.capitalize(opts[0])}</span>`;
        }

        const skillBonuses = (race.skillBonus || [])
            .map(s => `+${s.value} ${this.capitalize(s.skill)}`).join(', ') || 'None';

        const powerHtml = race.power
            ? `<p><strong>${this.esc(race.power.name)}:</strong> ${this.esc(race.power.description)}</p>`
            : '<p>None</p>';

        el.innerHTML = `
            <h3>${this.esc(race.name)}</h3>
            <div class="detail-section">
                <h4>Base Stats</h4>
                <ul class="detail-list">
                    <li><strong>Size:</strong> ${race.size}</li>
                    <li><strong>Languages:</strong> ${(race.languages || ['Trade']).join(', ')}</li>
                    <li><strong>Characteristic Bonus:</strong> ${charBonusHtml}</li>
                    <li><strong>Skill Bonuses:</strong> ${skillBonuses}</li>
                </ul>
            </div>
            <div class="detail-section">
                <h4>Racial Power</h4>
                ${powerHtml}
            </div>`;
    },

    // =========================================================================
    // Step 3: Exaltation
    // =========================================================================

    renderExaltations() {
        const grid = document.getElementById('exaltation-grid');
        if (!grid) return;
        const exaltations = this.data.exaltations?.exaltations || [];
        grid.innerHTML = exaltations.map(ex => {
            const psName = ex.powerStat?.name || 'No Power Stat';
            return `<div class="sel-card ${this.char.exaltation === ex.id ? 'selected' : ''}" data-id="${ex.id}">
                <h4>${this.esc(ex.name)}</h4>
                <div class="card-sub">${this.esc(psName)}</div>
                <div class="card-preview">${this.esc((ex.description || '').slice(0, 90))}…</div>
            </div>`;
        }).join('');
    },

    selectExaltation(id) {
        const ex = this.getExaltation(id);
        if (!ex) return;
        this.char.exaltation = id;
        this.char.powerStat = 1;
        this.renderExaltations();
        this.showExaltationDetail(ex);
        this.updateStepCompletion(3, true);
        this._setStepSummary(3, ex.name);
        this.renderFeats();
        this.updateSidebar();
    },

    showExaltationDetail(ex) {
        const el = document.getElementById('exaltation-detail');
        if (!el) return;

        const powersHtml = (ex.staticPowers || []).map(p =>
            `<li><strong>${this.esc(p.name)}:</strong> ${this.esc(p.description)}</li>`
        ).join('') || '<li>None</li>';

        const progHtml = (ex.progression || []).map(p =>
            `<li class="${p.dots <= 1 ? 'power-unlocked' : 'power-locked'}">
                <span class="unlock-icon">${p.dots <= 1 ? '✓' : '○'}</span>
                <strong>${p.dots} dot${p.dots > 1 ? 's' : ''} — ${this.esc(p.name)}:</strong> ${this.esc(p.description)}
            </li>`
        ).join('');

        el.innerHTML = `
            <h3>${this.esc(ex.name)}</h3>
            <div class="detail-section"><h4>Description</h4><p>${this.esc(ex.description || '')}</p></div>
            <div class="detail-section"><h4>Power Stat</h4>
                <p><strong>${this.esc(ex.powerStat?.name || 'None')}:</strong> ${this.esc(ex.powerStat?.description || 'N/A')}</p></div>
            <div class="detail-section"><h4>Resource</h4>
                <p><strong>${this.esc(ex.resourceStat?.name || 'None')}:</strong> ${this.esc(ex.resourceStat?.formula || 'N/A')}</p>
                ${ex.resourceStat?.recovery ? `<p><em>Recovery:</em> ${this.esc(ex.resourceStat.recovery)}</p>` : ''}</div>
            <div class="detail-section"><h4>Static Powers</h4><ul class="detail-list">${powersHtml}</ul></div>
            ${progHtml ? `<div class="detail-section"><h4>Progression</h4><ul class="detail-list progression-list">${progHtml}</ul></div>` : ''}
            ${ex.tell ? `<div class="detail-section"><h4>Tell</h4><p>${this.esc(ex.tell)}</p></div>` : ''}`;
    },

    // =========================================================================
    // Step 4: Characteristics
    // =========================================================================

    renderCharPriorities() {
        const cont = document.getElementById('char-priorities');
        if (!cont) return;
        cont.innerHTML = Object.entries(this.CHAR_GROUPS).map(([gk, g]) => {
            const pri = this.meta.charPriority[gk];
            const cls = pri ? `assigned-${pri}` : '';
            return `<div class="priority-card ${cls}">
                <h4>${g.label}</h4>
                <p>${g.chars.map(c => this.CHAR_NAMES[c]).join(', ')}</p>
                <select class="char-priority-sel" data-group="${gk}">
                    <option value="">Select Priority</option>
                    <option value="primary" ${pri === 'primary' ? 'selected' : ''}>Primary (6 dots)</option>
                    <option value="secondary" ${pri === 'secondary' ? 'selected' : ''}>Secondary (4 dots)</option>
                    <option value="tertiary" ${pri === 'tertiary' ? 'selected' : ''}>Tertiary (2 dots)</option>
                </select>
            </div>`;
        }).join('');
    },

    setCharPriority(group, priority) {
        if (!priority) {
            this.meta.charPriority[group] = null;
        } else {
            // Remove same priority from other group
            for (const g in this.meta.charPriority) {
                if (g !== group && this.meta.charPriority[g] === priority) {
                    this.meta.charPriority[g] = null;
                    // Reset dots for that group
                    this.CHAR_GROUPS[g].chars.forEach(c => this.char.characteristics[c] = this.BASE_CHAR_DOT);
                    this.meta.charDotsSpent[g] = 0;
                }
            }
            this.meta.charPriority[group] = priority;
        }
        this.renderCharPriorities();
        this.renderCharAllocation();
        this.updateCharSummary();
        this.updateSidebar();
    },

    renderCharAllocation() {
        const cont = document.getElementById('char-allocation');
        if (!cont) return;

        cont.innerHTML = Object.entries(this.CHAR_GROUPS).map(([gk, g]) => {
            const pri = this.meta.charPriority[gk];
            const maxDots = pri ? this.CHAR_PRIORITY_DOTS[pri] : 0;
            const spent = this.meta.charDotsSpent[gk];
            const remaining = maxDots - spent;
            const race = this.getRace(this.char.race);

            return `<div class="alloc-group">
                <h4>${g.label}</h4>
                <div class="alloc-budget">${pri ? `<strong>${remaining}</strong> / ${maxDots} dots remaining` : 'Set priority above'}</div>
                ${g.chars.map(c => {
                    const val = this.char.characteristics[c];
                    const hasRacialBonus = this.char.raceCharBonus === c;
                    const raceSkillBonus = race?.skillBonus || [];
                    const canUp = pri && val < this.CREATION_CHAR_CAP && spent < maxDots;
                    const canDown = val > this.BASE_CHAR_DOT;
                    const total = val + (hasRacialBonus ? 1 : 0);
                    return `<div class="alloc-row">
                        <span class="alloc-label">${this.CHAR_NAMES[c]}${hasRacialBonus ? ' <span class="bonus-tag">+1 racial</span>' : ''}</span>
                        <div class="dot-ctrl">
                            <button class="d-btn" data-char="${c}" data-delta="-1" ${!canDown ? 'disabled' : ''}>−</button>
                            <div class="dot-display">
                                ${Array.from({length: 5}, (_, i) => {
                                    if (i < val) return `<span class="dot filled"></span>`;
                                    if (i === val && hasRacialBonus) return `<span class="dot racial"></span>`;
                                    return `<span class="dot"></span>`;
                                }).join('')}
                            </div>
                            <button class="d-btn" data-char="${c}" data-delta="1" ${!canUp ? 'disabled' : ''}>+</button>
                            <span style="font-size:0.75rem;color:var(--text-dim);min-width:1.5em;text-align:right">${total}</span>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        }).join('');
    },

    adjustChar(charId, delta) {
        const group = Object.keys(this.CHAR_GROUPS).find(g => this.CHAR_GROUPS[g].chars.includes(charId));
        if (!group) return;
        const pri = this.meta.charPriority[group];
        if (!pri) return;

        const cur = this.char.characteristics[charId];
        const newVal = cur + delta;
        if (newVal < this.BASE_CHAR_DOT || newVal > this.CREATION_CHAR_CAP) return;

        const newSpent = this.meta.charDotsSpent[group] + delta;
        if (newSpent < 0 || newSpent > this.CHAR_PRIORITY_DOTS[pri]) return;

        this.char.characteristics[charId] = newVal;
        this.meta.charDotsSpent[group] = newSpent;

        this.renderCharAllocation();
        this.updateCharSummary();
        this.updateSidebar();
    },

    updateCharSummary() {
        const total = Object.values(this.meta.charDotsSpent).reduce((a, b) => a + b, 0);
        const maxTotal = Object.values(this.meta.charPriority).reduce((sum, p) => sum + (p ? this.CHAR_PRIORITY_DOTS[p] : 0), 0);
        this._setStepSummary(4, total ? `${total}/${maxTotal} dots allocated` : '');
        const allPriSet = Object.values(this.meta.charPriority).every(v => v);
        this.updateStepCompletion(4, allPriSet);
    },

    // =========================================================================
    // Step 5: Skills
    // =========================================================================

    renderSkillPriorities() {
        const cont = document.getElementById('skill-priorities');
        if (!cont) return;
        const groups = ['physical', 'social', 'mental'];
        const labels = { physical: 'Physical', social: 'Social', mental: 'Mental' };

        cont.innerHTML = groups.map(gk => {
            const pri = this.meta.skillPriority[gk];
            const cls = pri ? `assigned-${pri}` : '';
            const skills = this.data.skills?.skills?.[gk] || [];
            const names = skills.slice(0, 4).map(s => s.name).join(', ') + (skills.length > 4 ? '…' : '');
            return `<div class="priority-card ${cls}">
                <h4>${labels[gk]}</h4>
                <p>${names}</p>
                <select class="skill-priority-sel" data-group="${gk}">
                    <option value="">Select Priority</option>
                    <option value="primary" ${pri === 'primary' ? 'selected' : ''}>Primary (8 dots)</option>
                    <option value="secondary" ${pri === 'secondary' ? 'selected' : ''}>Secondary (6 dots)</option>
                    <option value="tertiary" ${pri === 'tertiary' ? 'selected' : ''}>Tertiary (4 dots)</option>
                </select>
            </div>`;
        }).join('');
    },

    setSkillPriority(group, priority) {
        if (!priority) {
            this.meta.skillPriority[group] = null;
        } else {
            for (const g in this.meta.skillPriority) {
                if (g !== group && this.meta.skillPriority[g] === priority) {
                    this.meta.skillPriority[g] = null;
                    // Reset dots for that group
                    const skills = this.data.skills?.skills?.[g] || [];
                    skills.forEach(s => { if (this.char.skills[s.id] !== undefined) this.char.skills[s.id] = 0; });
                    this.meta.skillDotsSpent[g] = 0;
                }
            }
            this.meta.skillPriority[group] = priority;
        }
        this.renderSkillPriorities();
        this.renderSkillAllocation();
        this.updateSkillSummary();
        this.updateSidebar();
    },

    renderSkillAllocation() {
        const cont = document.getElementById('skill-allocation');
        if (!cont) return;
        const groups = ['physical', 'social', 'mental'];
        const labels = { physical: 'Physical', social: 'Social', mental: 'Mental' };
        const race = this.getRace(this.char.race);
        const racialBonuses = {};
        (race?.skillBonus || []).forEach(sb => { racialBonuses[sb.skill] = sb.value; });

        cont.innerHTML = groups.map(gk => {
            const pri = this.meta.skillPriority[gk];
            const maxDots = pri ? this.SKILL_PRIORITY_DOTS[pri] : 0;
            const spent = this.meta.skillDotsSpent[gk];
            const remaining = maxDots - spent;
            const skills = this.data.skills?.skills?.[gk] || [];

            return `<div class="alloc-group">
                <h4>${labels[gk]}</h4>
                <div class="alloc-budget">${pri ? `<strong>${remaining}</strong> / ${maxDots} dots remaining` : 'Set priority above'}</div>
                ${skills.map(s => {
                    const val = this.char.skills[s.id] || 0;
                    const rb = racialBonuses[s.id] || 0;
                    const canUp = pri && val < this.CREATION_SKILL_CAP && spent < maxDots;
                    const canDown = val > 0;
                    return `<div class="alloc-row">
                        <span class="alloc-label${s.advanced ? ' advanced' : ''}">${this.esc(s.name)}${rb ? ` <span class="bonus-tag">+${rb}</span>` : ''}</span>
                        <div class="dot-ctrl">
                            <button class="d-btn" data-skill="${s.id}" data-delta="-1" ${!canDown ? 'disabled' : ''}>−</button>
                            <div class="dot-display">
                                ${Array.from({length: 5}, (_, i) => `<span class="dot ${i < val ? 'filled' : ''}"></span>`).join('')}
                            </div>
                            <button class="d-btn" data-skill="${s.id}" data-delta="1" ${!canUp ? 'disabled' : ''}>+</button>
                            <span style="font-size:0.75rem;color:var(--text-dim);min-width:1.5em;text-align:right">${val + rb}</span>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        }).join('');
    },

    adjustSkill(skillId, delta) {
        let group = null;
        for (const g of ['physical', 'social', 'mental']) {
            if ((this.data.skills?.skills?.[g] || []).some(s => s.id === skillId)) { group = g; break; }
        }
        if (!group) return;
        const pri = this.meta.skillPriority[group];
        if (!pri) return;

        const cur = this.char.skills[skillId] || 0;
        const newVal = cur + delta;
        if (newVal < 0 || newVal > this.CREATION_SKILL_CAP) return;

        const newSpent = this.meta.skillDotsSpent[group] + delta;
        if (newSpent < 0 || newSpent > this.SKILL_PRIORITY_DOTS[pri]) return;

        this.char.skills[skillId] = newVal;
        this.meta.skillDotsSpent[group] = newSpent;

        this.renderSkillAllocation();
        this.updateSkillSummary();
        this.updateSidebar();
    },

    updateSkillSummary() {
        const total = Object.values(this.meta.skillDotsSpent).reduce((a, b) => a + b, 0);
        const maxTotal = Object.values(this.meta.skillPriority).reduce((sum, p) => sum + (p ? this.SKILL_PRIORITY_DOTS[p] : 0), 0);
        this._setStepSummary(5, total ? `${total}/${maxTotal} dots allocated` : '');
        const allPriSet = Object.values(this.meta.skillPriority).every(v => v);
        this.updateStepCompletion(5, allPriSet);
    },

    // =========================================================================
    // Step 6: Backgrounds
    // =========================================================================

    renderBackgrounds() {
        const grid = document.getElementById('bg-grid');
        if (!grid) return;
        const bgs = this.data.backgrounds?.backgrounds || [];
        const spent = this.calcBgSpent();
        const remaining = this.BG_BUDGET - spent;

        const remEl = document.getElementById('bg-remaining');
        if (remEl) remEl.textContent = remaining;

        const { remaining: xpRemaining } = this.calcXP();

        grid.innerHTML = bgs.map(bg => {
            const dots = this.getBgDots(bg.id);
            // Free dots: 1-3 from budget.  Dots 4-5: XP (100 each)
            const inFreeRange = dots < this.MAX_BG_FREE_DOT;
            const canUpFree = inFreeRange && remaining >= 1;
            const canUpXP = !inFreeRange && dots < this.MAX_BG_DOT && xpRemaining >= 100;
            const canUp = canUpFree || canUpXP;
            const canDown = dots > 0;
            const effect = dots > 0 && bg.ratings?.[dots - 1] ? bg.ratings[dots - 1].effect : '';

            let costNote = '';
            if (dots >= this.MAX_BG_FREE_DOT && dots < this.MAX_BG_DOT) {
                costNote = `Dot ${dots + 1} costs 100 XP`;
            } else if (dots < this.MAX_BG_FREE_DOT) {
                costNote = '';
            }

            // Show which dots are free vs XP-bought
            const dotHtml = Array.from({length: 5}, (_, i) => {
                const cls = i < dots ? (i >= this.MAX_BG_FREE_DOT ? 'filled xp-dot' : 'filled') : '';
                return `<span class="dot ${cls}"></span>`;
            }).join('');

            return `<div class="bg-card">
                <h4>${this.esc(bg.name)}</h4>
                <div class="bg-desc">${this.esc(bg.description)}</div>
                <div class="dot-ctrl">
                    <button class="d-btn" data-bg="${bg.id}" data-delta="-1" ${!canDown ? 'disabled' : ''}>−</button>
                    <div class="dot-display">${dotHtml}</div>
                    <button class="d-btn" data-bg="${bg.id}" data-delta="1" ${!canUp ? 'disabled' : ''}>+</button>
                </div>
                ${costNote ? `<div class="cost-warning">${costNote}</div>` : ''}
                <div class="bg-effect">${this.esc(effect)}</div>
            </div>`;
        }).join('');

        this.updateBgSummary();
    },

    getBgDots(bgId) {
        const entry = (this.char.backgrounds || []).find(b => b.name?.toLowerCase() === bgId.toLowerCase() || b.id === bgId);
        return entry?.dots || 0;
    },

    setBgDots(bgId, dots) {
        if (!this.char.backgrounds) this.char.backgrounds = [];
        const bgs = this.data.backgrounds?.backgrounds || [];
        const bgDef = bgs.find(b => b.id === bgId);
        const name = bgDef?.name || this.capitalize(bgId);

        let entry = this.char.backgrounds.find(b => b.id === bgId);
        if (dots <= 0) {
            this.char.backgrounds = this.char.backgrounds.filter(b => b.id !== bgId);
            return;
        }
        if (entry) {
            entry.dots = dots;
        } else {
            this.char.backgrounds.push({ id: bgId, name, dots, notes: '' });
        }
    },

    calcBgSpent() {
        // Only dots 1-3 consume the free budget; dots 4-5 cost XP
        return (this.char.backgrounds || []).reduce((total, b) => {
            const d = b.dots || 0;
            return total + Math.min(d, this.MAX_BG_FREE_DOT);
        }, 0);
    },

    adjustBackground(bgId, delta) {
        const curDots = this.getBgDots(bgId);
        const newDots = curDots + delta;
        if (newDots < 0 || newDots > this.MAX_BG_DOT) return;

        if (delta > 0) {
            if (newDots <= this.MAX_BG_FREE_DOT) {
                // Going into free range — check budget
                const spent = this.calcBgSpent();
                if (spent + 1 > this.BG_BUDGET) return;
            } else {
                // Dots 4-5 require XP (100 each) — check XP remaining
                const { remaining } = this.calcXP();
                if (remaining < 100) return;
            }
        }

        this.setBgDots(bgId, newDots);
        this.renderBackgrounds();
        this.updateSidebar();
    },

    updateBgSummary() {
        const spent = this.calcBgSpent();
        this._setStepSummary(6, spent ? `${spent}/${this.BG_BUDGET} dots` : '');
        this.updateStepCompletion(6, spent > 0);
    },

    // =========================================================================
    // Step 7: Alignment
    // =========================================================================

    renderAlignments() {
        const grid = document.getElementById('alignment-grid');
        if (!grid) return;
        const filter = document.getElementById('filter-pantheon')?.value || 'all';
        let alignments = this.data.alignments?.alignments || [];
        if (filter !== 'all') alignments = alignments.filter(a => a.pantheon === filter);
        const pantheons = this.data.alignments?.pantheons || {};

        grid.innerHTML = alignments.map(al => `
            <div class="sel-card ${this.char.alignment === al.id ? 'selected' : ''}" data-id="${al.id}">
                <h4>${this.esc(al.name)}</h4>
                <div class="card-sub">${this.esc(pantheons[al.pantheon]?.name || al.pantheon)}</div>
                <div class="card-preview">${this.esc((al.concepts || []).slice(0, 3).join(', '))}</div>
            </div>`).join('');
    },

    selectAlignment(id) {
        const al = (this.data.alignments?.alignments || []).find(a => a.id === id);
        if (!al) return;
        this.char.alignment = id;
        this.char.devotion = 6;
        this.renderAlignments();
        this.showAlignmentDetail(al);
        this.updateStepCompletion(7, true);
        this._setStepSummary(7, al.name);
        this.updateSidebar();
    },

    showAlignmentDetail(al) {
        const el = document.getElementById('alignment-detail');
        if (!el) return;

        const commandmentsHtml = (al.commandments || []).length
            ? `<ul class="detail-list">${al.commandments.map(c => `<li>${this.esc(c)}</li>`).join('')}</ul>`
            : '<p>No commandments.</p>';

        const sinsHtml = (al.sins || []).map(s =>
            `<div class="sin-row"><span class="sin-devotion">${s.devotion}</span><span>${this.esc(s.sin)}</span></div>`
        ).join('');

        el.innerHTML = `
            <h3>${this.esc(al.name)}</h3>
            <div class="detail-section"><h4>Description</h4><p>${this.esc(al.description)}</p></div>
            <div class="detail-section"><h4>Commandments</h4>${commandmentsHtml}</div>
            ${al.restriction ? `<div class="detail-section"><h4>Restriction</h4><p>${this.esc(al.restriction)}</p></div>` : ''}
            <div class="detail-section"><h4>Sins</h4><div class="sin-chart">${sinsHtml}</div></div>
            <div class="devotion-control">
                <span>Starting Devotion: <strong>6</strong></span>
            </div>`;
    },

    // =========================================================================
    // Step 8: Classes
    // =========================================================================

    renderClasses() {
        const grid = document.getElementById('class-grid');
        if (!grid) return;
        const trackFilter = document.getElementById('filter-class-track')?.value || 'all';
        // During creation characters are level 1 — only Tier 1 classes available
        let classes = (this.data.classes?.classes || []).filter(c => c.level === 1);

        if (trackFilter !== 'all') {
            classes = classes.filter(c => c.track === trackFilter);
        }

        grid.innerHTML = classes.map(cls => {
            const purchased = (this.char.classes || []).some(c => c.classId === cls.id);
            const trackName = cls.track ? this.capitalize(cls.track) : 'Standalone';
            return `<div class="sel-card ${purchased ? 'selected' : ''}" data-id="${cls.id}">
                <h4>${this.esc(cls.name)}</h4>
                <div class="card-sub">Tier ${cls.level} · ${trackName}</div>
                <div class="card-preview">${this.esc(cls.completionBonus || '')}</div>
            </div>`;
        }).join('');

        // Render purchased class pills
        const pills = document.getElementById('purchased-classes');
        if (pills) {
            pills.innerHTML = (this.char.classes || []).map(c => {
                const cls = (this.data.classes?.classes || []).find(cl => cl.id === c.classId);
                return cls ? `<span class="tag-pill">${this.esc(cls.name)} (Tier ${cls.level})
                    <span class="remove-tag" data-class-id="${cls.id}">×</span></span>` : '';
            }).join('');
        }
    },

    showClassDetail(classId) {
        const el = document.getElementById('class-detail');
        if (!el) return;
        const cls = (this.data.classes?.classes || []).find(c => c.id === classId);
        if (!cls) return;

        const purchased = (this.char.classes || []).some(c => c.classId === cls.id);
        const classCount = (this.char.classes || []).length;
        const isFirstFree = !purchased && classCount === 0;
        const prereqHtml = cls.prerequisites && cls.prerequisites !== 'None'
            ? `<div class="detail-section"><h4>Prerequisites</h4><p>${this.esc(cls.prerequisites)}</p></div>` : '';

        const schools = [];
        if (cls.swordSchools?.length) schools.push(`<strong>Sword:</strong> ${cls.swordSchools.join(', ')}`);
        if (cls.magicSchools?.length) schools.push(`<strong>Magic:</strong> ${cls.magicSchools.join(', ')}`);
        if (cls.gunKata?.length) schools.push(`<strong>Gun Kata:</strong> ${cls.gunKata.join(', ')}`);

        const featsHtml = (cls.feats || []).map(f =>
            `<li>${this.esc(f.name)} <span style="color:var(--text-dim)">(${f.type})</span></li>`
        ).join('');

        el.innerHTML = `
            <h3>${this.esc(cls.name)}</h3>
            ${prereqHtml}
            ${cls.characteristics?.length ? `<div class="detail-section"><h4>Characteristics</h4><p>${cls.characteristics.join(', ')}</p></div>` : ''}
            ${cls.skills?.length ? `<div class="detail-section"><h4>Skills</h4><p>${cls.skills.join(', ')}</p></div>` : ''}
            ${featsHtml ? `<div class="detail-section"><h4>Feats</h4><ul class="detail-list">${featsHtml}</ul></div>` : ''}
            ${schools.length ? `<div class="detail-section"><h4>Schools</h4><p>${schools.join('<br>')}</p></div>` : ''}
            <div class="detail-section"><h4>Completion Bonus</h4><p>${this.esc(cls.completionBonus || 'None')}</p></div>
            <div class="detail-actions">
                <button class="btn ${purchased ? 'btn-danger' : 'btn-primary'}" id="btn-toggle-class" data-class-id="${cls.id}">
                    ${purchased ? (classCount === 1 ? 'Remove (free)' : 'Remove (−100 XP)') : (isFirstFree ? 'Add (free)' : 'Add (+100 XP)')}
                </button>
            </div>`;

        // Bind button (direct, since it's freshly rendered)
        document.getElementById('btn-toggle-class')?.addEventListener('click', () => {
            this.toggleClass(cls.id);
        });
    },

    toggleClass(classId) {
        if (!this.char.classes) this.char.classes = [];
        const idx = this.char.classes.findIndex(c => c.classId === classId);
        if (idx >= 0) {
            this.char.classes.splice(idx, 1);
        } else {
            const cls = (this.data.classes?.classes || []).find(c => c.id === classId);
            // Guard: only Tier 1 classes allowed at character creation
            if (cls && cls.level > 1) return;
            this.char.classes.push({ classId, level: cls?.level || 1 });
        }
        this.renderClasses();
        this.showClassDetail(classId);
        const count = this.char.classes.length;
        this._setStepSummary(8, count ? `${count} class${count > 1 ? 'es' : ''}` : '');
        this.updateStepCompletion(8, count > 0);
        this.updateSidebar();
    },

    removeClass(classId) {
        this.char.classes = (this.char.classes || []).filter(c => c.classId !== classId);
        this.renderClasses();
        document.getElementById('class-detail').innerHTML = '';
        const count = this.char.classes.length;
        this._setStepSummary(8, count ? `${count} class${count > 1 ? 'es' : ''}` : '');
        this.updateStepCompletion(8, count > 0);
        this.updateSidebar();
    },

    // =========================================================================
    // Step 9: Feats
    // =========================================================================

    /** Filter applicable feats (race/exaltation restrictions) */
    _filterByRestrictions(feats) {
        const race = this.getRace(this.char.race);
        const ex = this.getExaltation(this.char.exaltation);
        return feats.filter(f => {
            if (f.raceRestriction && (!race || f.raceRestriction !== race.name)) return false;
            if (f.exaltationRestriction) {
                if (!ex) return false;
                const norm = s => s.replace(/\s+/g, '').toLowerCase();
                if (norm(f.exaltationRestriction) !== norm(ex.name)) return false;
            }
            return true;
        });
    },

    /** IDs of everything selected across feats + assets + hindrances */
    _getSelectedFeatIds() {
        const ids = new Set();
        for (const f of (this.char.feats || [])) ids.add(typeof f === 'object' ? f.name : f);
        for (const a of (this.char.assets || [])) ids.add(typeof a === 'object' ? a.name : a);
        for (const h of (this.char.hindrances || [])) ids.add(typeof h === 'object' ? h.name : h);
        return ids;
    },

    _updateStep9Summary() {
        const total = (this.char.feats?.length || 0) + (this.char.assets?.length || 0) + (this.char.hindrances?.length || 0);
        this._setStepSummary(9, total ? `${total} selected` : '');
        this.updateStepCompletion(9, total > 0);
    },

    // --- Feats sub-section ---

    renderFeats() {
        const grid = document.getElementById('feat-grid');
        if (!grid) return;
        const catFilter = document.getElementById('filter-feat-cat')?.value || 'all';
        const searchTerm = (document.getElementById('filter-feat-search')?.value || '').toLowerCase();
        const FEAT_CATS = ['general', 'racial', 'supplementary'];
        let feats = (this.data.feats?.feats || []).filter(f => FEAT_CATS.includes(f.category));

        if (catFilter !== 'all') feats = feats.filter(f => f.category === catFilter);
        if (searchTerm) feats = feats.filter(f => f.name.toLowerCase().includes(searchTerm) || (f.effect || '').toLowerCase().includes(searchTerm));
        feats = this._filterByRestrictions(feats);

        const selectedIds = this._getSelectedFeatIds();
        const catLabels = { general: 'General', racial: 'Racial', supplementary: 'Supplementary' };

        grid.innerHTML = feats.map(f => `
            <div class="sel-card ${selectedIds.has(f.id) ? 'selected' : ''}" data-id="${f.id}">
                <h4>${this.esc(f.name)}</h4>
                <div class="card-sub">${catLabels[f.category] || f.category}</div>
                <div class="card-preview">${this.esc((f.effect || '').slice(0, 80))}</div>
            </div>`).join('');

        // Render selected feat pills (feats only)
        const pills = document.getElementById('selected-feats');
        if (pills) {
            const allFeats = this.data.feats?.feats || [];
            pills.innerHTML = (this.char.feats || []).map(f => {
                const id = typeof f === 'object' ? f.name : f;
                const feat = allFeats.find(fd => fd.id === id);
                return `<span class="tag-pill">${this.esc(feat?.name || id)}
                    <span class="remove-tag" data-feat-id="${id}">×</span></span>`;
            }).join('');
        }
    },

    showFeatDetail(featId) {
        const el = document.getElementById('feat-detail');
        if (!el) return;
        const feat = (this.data.feats?.feats || []).find(f => f.id === featId);
        if (!feat) return;

        const selected = this._getSelectedFeatIds().has(featId);
        const btnText = selected ? 'Remove' : 'Add (100 XP)';
        const btnClass = selected ? 'btn-danger' : 'btn-primary';
        const prereqs = (feat.prerequisites || []).map(p => `<li>${this.esc(p)}</li>`).join('');

        el.innerHTML = `
            <h3>${this.esc(feat.name)}</h3>
            ${prereqs ? `<div class="detail-section"><h4>Prerequisites</h4><ul class="detail-list">${prereqs}</ul></div>` : ''}
            <div class="detail-section"><h4>Effect</h4><p>${this.esc(feat.details || feat.effect || '')}</p></div>
            <div class="detail-actions">
                <button class="btn ${btnClass}" id="btn-toggle-feat" data-feat-id="${featId}">${btnText}</button>
            </div>`;

        document.getElementById('btn-toggle-feat')?.addEventListener('click', () => {
            this.toggleFeat(featId);
        });
    },

    toggleFeat(featId) {
        if (!this.char.feats) this.char.feats = [];
        const idx = this.char.feats.findIndex(e => (typeof e === 'object' ? e.name : e) === featId);
        if (idx >= 0) {
            this.char.feats.splice(idx, 1);
        } else {
            this.char.feats.push({ name: featId, notes: '' });
        }
        this.renderFeats();
        this.showFeatDetail(featId);
        this._updateStep9Summary();
        this.updateSidebar();
    },

    removeFeat(featId) {
        if (this.char.feats) {
            const idx = this.char.feats.findIndex(e => (typeof e === 'object' ? e.name : e) === featId);
            if (idx >= 0) this.char.feats.splice(idx, 1);
        }
        this.renderFeats();
        document.getElementById('feat-detail').innerHTML = '';
        this._updateStep9Summary();
        this.updateSidebar();
    },

    // --- Assets & Hindrances sub-section ---

    renderAH() {
        const grid = document.getElementById('ah-grid');
        if (!grid) return;
        const catFilter = document.getElementById('filter-ah-cat')?.value || 'all';
        const AH_CATS = ['asset', 'exaltedAsset', 'hindrance'];
        let items = (this.data.feats?.feats || []).filter(f => AH_CATS.includes(f.category));

        if (catFilter !== 'all') items = items.filter(f => f.category === catFilter);
        items = this._filterByRestrictions(items);

        const selectedIds = this._getSelectedFeatIds();
        const catLabels = { asset: 'Asset', exaltedAsset: 'Exalted Asset', hindrance: 'Hindrance' };

        grid.innerHTML = items.map(f => {
            const xpNote = f.category === 'hindrance' ? `+${f.bonusXP || 100} XP` : '100 XP';
            return `<div class="sel-card ${selectedIds.has(f.id) ? 'selected' : ''}" data-id="${f.id}">
                <h4>${this.esc(f.name)}</h4>
                <div class="card-sub">${catLabels[f.category]} · ${xpNote}</div>
                <div class="card-preview">${this.esc((f.effect || '').slice(0, 80))}</div>
            </div>`;
        }).join('');

        // Render selected A/H pills
        const pills = document.getElementById('selected-ah');
        if (pills) {
            const allFeats = this.data.feats?.feats || [];
            const entries = [
                ...(this.char.assets || []).map(a => ({ id: typeof a === 'object' ? a.name : a, type: 'asset' })),
                ...(this.char.hindrances || []).map(h => ({ id: typeof h === 'object' ? h.name : h, type: 'hindrance' }))
            ];
            pills.innerHTML = entries.map(e => {
                const feat = allFeats.find(f => f.id === e.id);
                const cls = e.type === 'hindrance' ? 'hindrance' : 'asset';
                return `<span class="tag-pill ${cls}">${this.esc(feat?.name || e.id)}
                    <span class="remove-tag" data-ah-id="${e.id}">×</span></span>`;
            }).join('');
        }
    },

    showAHDetail(itemId) {
        const el = document.getElementById('ah-detail');
        if (!el) return;
        const feat = (this.data.feats?.feats || []).find(f => f.id === itemId);
        if (!feat) return;

        const selected = this._getSelectedFeatIds().has(itemId);
        const isHindrance = feat.category === 'hindrance';
        const xpText = isHindrance ? `+${feat.bonusXP || 100} XP` : '100 XP';
        const btnText = selected ? 'Remove' : `Add (${xpText})`;
        const btnClass = selected ? 'btn-danger' : 'btn-primary';
        const prereqs = (feat.prerequisites || []).map(p => `<li>${this.esc(p)}</li>`).join('');

        el.innerHTML = `
            <h3>${this.esc(feat.name)}</h3>
            <div class="card-sub">${isHindrance ? 'Hindrance' : 'Asset'}</div>
            ${prereqs ? `<div class="detail-section"><h4>Prerequisites</h4><ul class="detail-list">${prereqs}</ul></div>` : ''}
            <div class="detail-section"><h4>Effect</h4><p>${this.esc(feat.details || feat.effect || '')}</p></div>
            <div class="detail-actions">
                <button class="btn ${btnClass}" id="btn-toggle-ah">${btnText}</button>
            </div>`;

        document.getElementById('btn-toggle-ah')?.addEventListener('click', () => {
            this.toggleAH(itemId);
        });
    },

    toggleAH(itemId) {
        const feat = (this.data.feats?.feats || []).find(f => f.id === itemId);
        if (!feat) return;

        const isHindrance = feat.category === 'hindrance';
        const arr = isHindrance
            ? (this.char.hindrances || (this.char.hindrances = []))
            : (this.char.assets || (this.char.assets = []));

        const idx = arr.findIndex(e => (typeof e === 'object' ? e.name : e) === itemId);
        if (idx >= 0) {
            arr.splice(idx, 1);
        } else {
            arr.push({ name: itemId, notes: '' });
        }

        this.renderAH();
        this.showAHDetail(itemId);
        this._updateStep9Summary();
        this.updateSidebar();
    },

    removeAH(itemId) {
        for (const arr of [this.char.assets, this.char.hindrances]) {
            if (!arr) continue;
            const idx = arr.findIndex(e => (typeof e === 'object' ? e.name : e) === itemId);
            if (idx >= 0) { arr.splice(idx, 1); break; }
        }
        this.renderAH();
        document.getElementById('ah-detail').innerHTML = '';
        this._updateStep9Summary();
        this.updateSidebar();
    },

    // =========================================================================
    // Step 10: Equipment
    // =========================================================================

    renderEquipment() {
        const grid = document.getElementById('equipment-grid');
        if (!grid) return;
        const packages = this.data.equipment?.packages || [];

        grid.innerHTML = packages.map(pkg => {
            const preview = (pkg.items || []).slice(0, 3).map(i => i.name).join(', ');
            return `<div class="sel-card ${this.meta.equipmentPkg === pkg.id ? 'selected' : ''}" data-id="${pkg.id}">
                <h4>${this.esc(pkg.name)}</h4>
                <div class="card-sub">${this.esc(pkg.description || '')}</div>
                <div class="card-preview">${this.esc(preview)}…</div>
            </div>`;
        }).join('');
    },

    selectEquipment(pkgId) {
        const pkg = (this.data.equipment?.packages || []).find(p => p.id === pkgId);
        if (!pkg) return;
        this.meta.equipmentPkg = pkgId;
        this.meta.equipmentChoices = {};
        this.renderEquipment();
        this.showEquipmentDetail(pkg);
        this._setStepSummary(10, pkg.name);
        this.updateStepCompletion(10, true);
        this.resolveEquipment();
        this.updateSidebar();
    },

    showEquipmentDetail(pkg) {
        const el = document.getElementById('equipment-detail');
        if (!el) return;

        const standard = (pkg.items || []).filter(i => !i.choice);
        const choices = (pkg.items || []).filter(i => i.choice);

        const standardHtml = standard.map(i => `<li>${this.esc(i.name)}</li>`).join('');
        const choicesHtml = choices.map((item, idx) => {
            const cur = this.meta.equipmentChoices[idx] || '';
            return `<li><select class="choice-select equip-choice-sel" data-idx="${idx}">
                <option value="">Choose…</option>
                ${item.options.map(o => `<option value="${o}" ${cur === o ? 'selected' : ''}>${this.esc(o)}</option>`).join('')}
            </select></li>`;
        }).join('');

        el.innerHTML = `
            <h3>${this.esc(pkg.name)}</h3>
            <div class="detail-section"><h4>Description</h4><p>${this.esc(pkg.description || '')}</p></div>
            <div class="detail-section"><h4>Items</h4><ul class="detail-list">${standardHtml}</ul></div>
            ${choicesHtml ? `<div class="detail-section"><h4>Choices</h4><ul class="detail-list">${choicesHtml}</ul></div>` : ''}`;
    },

    /** Resolve equipment choices into char.equipment text */
    resolveEquipment() {
        const pkg = (this.data.equipment?.packages || []).find(p => p.id === this.meta.equipmentPkg);
        if (!pkg) { this.char.equipment = ''; return; }
        const items = (pkg.items || []);
        let choiceIdx = 0;
        const resolved = [];
        for (const item of items) {
            if (item.choice) {
                const chosen = this.meta.equipmentChoices[choiceIdx] || item.options[0] || item.name;
                resolved.push(chosen);
                choiceIdx++;
            } else {
                resolved.push(item.name);
            }
        }
        this.char.equipment = resolved.join(', ');
    },

    // =========================================================================
    // Step 11: Review
    // =========================================================================

    renderReview() {
        const el = document.getElementById('review-panel');
        if (!el) return;

        const race = this.getRace(this.char.race);
        const ex = this.getExaltation(this.char.exaltation);
        const chars = this.getTotalChars();
        const size = this.getSize();
        const level = this.getLevel();
        const isHalfling = this.char.race === 'halfling';
        const xp = this.calcXP();

        // Derived stats
        const sd = derived.calculateSD(chars.dexterity, chars.wisdom, size, isHalfling);
        const hp = derived.calculateHP(chars.constitution, chars.willpower);
        const md = derived.calculateMentalDefense(chars.composure);
        const resolve = derived.calculateResolve(chars.willpower, chars.composure);
        const speed = derived.calculateSpeed(chars.strength, chars.dexterity);
        const resilience = derived.calculateResilience(size, level);
        const init = derived.calculateInitiativeBase(chars.dexterity, chars.composure);

        // Warnings
        const warnings = [];
        if (xp.remaining < 0) warnings.push(`Over budget by ${Math.abs(xp.remaining)} XP!`);
        if (!this.char.name?.trim()) warnings.push('Character has no name.');
        if (!this.char.race) warnings.push('No race selected.');
        if (!this.char.exaltation) warnings.push('No exaltation selected.');

        // Classes
        const classesHtml = (this.char.classes || []).map(c => {
            const cls = (this.data.classes?.classes || []).find(cl => cl.id === c.classId);
            return cls ? `<li><strong>${this.esc(cls.name)}</strong> (Tier ${cls.level})</li>` : '';
        }).join('') || '<li>None</li>';

        // Feats
        const allFeats = this.data.feats?.feats || [];
        const featsHtml = (this.char.feats || []).map(f => {
            const feat = allFeats.find(fd => fd.id === (typeof f === 'object' ? f.name : f));
            return feat ? `<li>${this.esc(feat.name)}</li>` : '';
        }).join('') || '<li>None</li>';

        const assetsHtml = (this.char.assets || []).map(a => {
            const feat = allFeats.find(fd => fd.id === (typeof a === 'object' ? a.name : a));
            return feat ? `<li>${this.esc(feat.name)}</li>` : '';
        }).join('') || '<li>None</li>';

        const hindrancesHtml = (this.char.hindrances || []).map(h => {
            const feat = allFeats.find(fd => fd.id === (typeof h === 'object' ? h.name : h));
            return feat ? `<li>${this.esc(feat.name)}</li>` : '';
        }).join('') || '<li>None</li>';

        // Backgrounds
        const bgsHtml = (this.char.backgrounds || []).filter(b => b.dots > 0).map(b =>
            `<li>${this.esc(b.name)}: ${b.dots} dot${b.dots > 1 ? 's' : ''}</li>`
        ).join('') || '<li>None</li>';

        // Alignment
        const alObj = (this.data.alignments?.alignments || []).find(a => a.id === this.char.alignment);

        el.innerHTML = `
            ${warnings.length ? `<div class="review-warning">${warnings.join(' · ')}</div>` : ''}

            <div class="review-section">
                <h3>Identity</h3>
                <div class="stat-row"><span>Name</span><span>${this.esc(this.char.name || '—')}</span></div>
                <div class="stat-row"><span>Race</span><span>${this.esc(race?.name || '—')}${this.char.raceCharBonus ? ` (+1 ${this.capitalize(this.char.raceCharBonus)})` : ''}</span></div>
                <div class="stat-row"><span>Exaltation</span><span>${this.esc(ex?.name || '—')}</span></div>
                <div class="stat-row"><span>Alignment</span><span>${this.esc(alObj?.name || '—')} (Devotion ${this.char.devotion})</span></div>
                <div class="stat-row"><span>Size</span><span>${size}</span></div>
                <div class="stat-row"><span>Level</span><span>${level}</span></div>
            </div>

            <div class="review-section">
                <h3>Derived Stats</h3>
                <div class="review-derived">
                    <div class="review-stat"><span class="label">SD</span><span class="value">${sd}</span></div>
                    <div class="review-stat"><span class="label">HP</span><span class="value">${hp}</span></div>
                    <div class="review-stat"><span class="label">Mental Def</span><span class="value">${md}</span></div>
                    <div class="review-stat"><span class="label">Resolve</span><span class="value">${resolve}</span></div>
                    <div class="review-stat"><span class="label">Speed</span><span class="value">${speed}</span></div>
                    <div class="review-stat"><span class="label">Resilience</span><span class="value">${resilience}</span></div>
                    <div class="review-stat"><span class="label">Initiative</span><span class="value">${init}</span></div>
                </div>
            </div>

            <div class="review-section">
                <h3>Characteristics</h3>
                <div class="review-chars">
                    ${Object.entries(this.CHAR_GROUPS).map(([gk, g]) => `
                        <div class="group-col">
                            <h4>${g.label}</h4>
                            ${g.chars.map(c => `<div class="stat-row"><span>${this.CHAR_NAMES[c]}</span><span>${chars[c]}</span></div>`).join('')}
                        </div>`).join('')}
                </div>
            </div>

            <div class="review-section">
                <h3>Skills</h3>
                <ul class="review-list">
                    ${Object.entries(this.char.skills || {}).filter(([, v]) => v > 0).map(([id, v]) => {
                        const sk = ['physical', 'social', 'mental'].flatMap(g => this.data.skills?.skills?.[g] || []).find(s => s.id === id);
                        return `<li>${this.esc(sk?.name || id)}: ${v}</li>`;
                    }).join('') || '<li>None</li>'}
                </ul>
            </div>

            <div class="review-section">
                <h3>Backgrounds</h3>
                <ul class="review-list">${bgsHtml}</ul>
            </div>

            <div class="review-section">
                <h3>Classes</h3>
                <ul class="review-list">${classesHtml}</ul>
            </div>

            <div class="review-section">
                <h3>Feats</h3>
                <ul class="review-list">${featsHtml}</ul>
                <h4 style="margin-top:var(--space-sm)">Assets</h4>
                <ul class="review-list">${assetsHtml}</ul>
                <h4 style="margin-top:var(--space-sm)">Hindrances</h4>
                <ul class="review-list">${hindrancesHtml}</ul>
            </div>

            <div class="review-section">
                <h3>Equipment</h3>
                <p>${this.esc(this.char.equipment || 'None selected')}</p>
            </div>

            <div class="review-section">
                <h3>XP Budget</h3>
                <div class="stat-row"><span>Total XP</span><span>${this.TOTAL_XP}</span></div>
                ${Object.entries(xp.breakdown).map(([k, v]) => v ? `<div class="stat-row"><span>${this.capitalize(k)}</span><span>${v}</span></div>` : '').join('')}
                <div class="stat-row" style="border-top:1px solid var(--border);margin-top:var(--space-xs);padding-top:var(--space-xs)">
                    <span><strong>Remaining</strong></span><span style="color:${xp.remaining < 0 ? 'var(--error)' : 'var(--success)'}"><strong>${xp.remaining}</strong></span>
                </div>
            </div>

            <div class="review-actions">
                <button class="btn btn-primary" id="review-open-sheet">Open in Sheet</button>
                <button class="btn btn-secondary" id="review-export">Export JSON</button>
                <button class="btn btn-ghost" id="review-start-over">Start Over</button>
            </div>`;

        // Bind review buttons
        document.getElementById('review-open-sheet')?.addEventListener('click', () => this.openInSheet());
        document.getElementById('review-export')?.addEventListener('click', () => this.exportJSON());
        document.getElementById('review-start-over')?.addEventListener('click', () => this.startOver());
    },

    // =========================================================================
    // Actions: Export / Open in Sheet / Start Over
    // =========================================================================

    /** Build final canonical character data for export */
    buildExportData() {
        this.resolveEquipment();
        // Sync xpSpent
        this.char.xpSpent = this.calcXP().spent;
        this.char.totalXP = this.TOTAL_XP;
        return character.validate(this.char);
    },

    exportJSON() {
        const data = this.buildExportData();
        character.exportJSON(data);
    },

    openInSheet() {
        const data = this.buildExportData();
        // Save to shared storage so the Sheet can pick it up
        const list = character.list();
        if (!list.find(c => c.id === data.id)) {
            list.push({ id: data.id, name: data.name || 'Builder Character' });
            localStorage.setItem(character.STORAGE_LIST_KEY, JSON.stringify(list));
        }
        character.save(data.id, data);
        // Navigate to Sheet
        window.location.href = '/tools/character-sheet/';
    },

    startOver() {
        if (!confirm('Reset all progress? This cannot be undone.')) return;
        this.char = character.createDefault();
        for (const c of Object.keys(this.char.characteristics)) {
            this.char.characteristics[c] = this.BASE_CHAR_DOT;
        }
        this.meta = {
            step: 1,
            stepsCompleted: new Array(11).fill(false),
            charPriority: { physical: null, social: null, mental: null },
            skillPriority: { physical: null, social: null, mental: null },
            charDotsSpent: { physical: 0, social: 0, mental: 0 },
            skillDotsSpent: { physical: 0, social: 0, mental: 0 },
            equipmentPkg: null,
            equipmentChoices: {}
        };
        document.getElementById('field-name').value = '';
        document.getElementById('field-player').value = '';
        document.getElementById('field-concept').value = '';
        // Clear detail panels
        ['race-detail', 'exaltation-detail', 'alignment-detail', 'class-detail', 'feat-detail', 'ah-detail', 'equipment-detail'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
        this.renderAll();
        this.openStep(1);
    }
};

// =========================================================================
// Bootstrap
// =========================================================================

document.addEventListener('DOMContentLoaded', () => Builder.init());
