/**
 * DTD Defense Graph Simulator
 *
 * Visualizes how damage mitigation evolves across the defense pipeline.
 * Uses Monte Carlo simulation (via inline Web Worker) and Chart.js for graphs.
 *
 * Object-literal pattern — no class instantiation needed.
 * Depends on: DTD.derived (core.js), DTD.dice (dice.js), Chart.js
 */
'use strict';

const DefGraph = (() => {

    // =====================================================================
    // Constants
    // =====================================================================

    const TRIALS = 50_000;
    const DEBOUNCE_MS = 300;

    /** Hit location probabilities from d10 table */
    const HIT_LOCATIONS = {
        lleg:     { label: 'L.Leg',     d10: [1],       prob: 0.10 },
        rleg:     { label: 'R.Leg',     d10: [2],       prob: 0.10 },
        body:     { label: 'Body',      d10: [3,4,5,6], prob: 0.40 },
        gizzards: { label: 'Gizzards',  d10: [7],       prob: 0.10 },
        larm:     { label: 'L.Arm',     d10: [8],       prob: 0.10 },
        rarm:     { label: 'R.Arm',     d10: [9],       prob: 0.10 },
        head:     { label: 'Head',      d10: [10],      prob: 0.10 },
    };

    /** Armor weight presets: { maxDex, apRange } */
    const ARMOR_WEIGHTS = {
        none:   { maxDex: 99, apMin: 0,  apMax: 0  },
        light:  { maxDex: 5,  apMin: 2,  apMax: 4  },
        medium: { maxDex: 4,  apMin: 4,  apMax: 6  },
        heavy:  { maxDex: 2,  apMin: 6,  apMax: 8  },
        power:  { maxDex: 2,  apMin: 8,  apMax: 12 },
    };

    /** Defender presets */
    const DEFENDER_PRESETS = {
        unarmored: { dex: 3, wis: 3, size: 4, con: 3, wil: 3, composure: 3, level: 1, ap: 0, weight: 'none', maxDex: 99, aura: 0, cover: 0, halfling: false, dodge: 0, parry: 0 },
        light:     { dex: 4, wis: 3, size: 4, con: 3, wil: 3, composure: 3, level: 2, ap: 3, weight: 'light', maxDex: 5, aura: 0, cover: 0, halfling: false, dodge: 2, parry: 0 },
        heavy:     { dex: 2, wis: 3, size: 4, con: 4, wil: 3, composure: 3, level: 2, ap: 7, weight: 'heavy', maxDex: 2, aura: 0, cover: 0, halfling: false, dodge: 0, parry: 3 },
        power:     { dex: 3, wis: 3, size: 4, con: 4, wil: 4, composure: 3, level: 3, ap: 10, weight: 'power', maxDex: 2, aura: 0, cover: 0, halfling: false, dodge: 0, parry: 0 },
        halfling:  { dex: 5, wis: 3, size: 3, con: 2, wil: 3, composure: 3, level: 1, ap: 2, weight: 'light', maxDex: 5, aura: 0, cover: 0, halfling: true, dodge: 3, parry: 0 },
        sabbat:    { dex: 3, wis: 2, size: 4, con: 4, wil: 3, composure: 2, level: 1, ap: 4, weight: 'medium', maxDex: 4, aura: 0, cover: 0, halfling: false, dodge: 0, parry: 2 },
    };

    /** Attacker presets */
    const ATTACKER_PRESETS = {
        lasgun:      { atkRolled: 5, atkKept: 3, atkLevel: 0, atkMod: 0, dmgRolled: 4, dmgKept: 2, dmgFlat: 0, dmgType: 'E', pen: 0, tearing: false, blast: false, scatter: false, powerField: false },
        chainsword:  { atkRolled: 5, atkKept: 3, atkLevel: 0, atkMod: 0, dmgRolled: 5, dmgKept: 2, dmgFlat: 3, dmgType: 'R', pen: 3, tearing: true, blast: false, scatter: false, powerField: false },
        bolter:      { atkRolled: 5, atkKept: 3, atkLevel: 0, atkMod: 0, dmgRolled: 6, dmgKept: 3, dmgFlat: 0, dmgType: 'X', pen: 4, tearing: true, blast: false, scatter: false, powerField: false },
        greatweapon: { atkRolled: 7, atkKept: 4, atkLevel: 0, atkMod: 0, dmgRolled: 7, dmgKept: 3, dmgFlat: 4, dmgType: 'R', pen: 2, tearing: false, blast: false, scatter: false, powerField: false },
        plasma:      { atkRolled: 5, atkKept: 3, atkLevel: 0, atkMod: 0, dmgRolled: 8, dmgKept: 4, dmgFlat: 0, dmgType: 'E', pen: 8, tearing: false, blast: false, scatter: false, powerField: false },
    };

    /** Chart colors */
    const COLORS = {
        raw:         '#f87171', // red
        penReduced:  '#fbbf24', // amber
        armorSoak:   '#60a5fa', // blue
        auraSoak:    '#818cf8', // indigo
        resilConvert:'#4ade80', // green
        hpLost:      '#d4a84b', // gold
        hitProb:     '#60a5fa', // blue
        expDamage:   '#f87171', // red
        coverSoak:   '#22d3ee', // cyan
    };

    const ARMOR_COMPARE_COLORS = [
        '#d4a84b', // gold
        '#60a5fa', // blue
        '#4ade80', // green
        '#f87171', // red
    ];

    // =====================================================================
    // State
    // =====================================================================

    let debounceTimer = null;

    /** @type {Worker|null} */
    let worker = null;
    let jobId = 0;
    const pendingJobs = new Map();

    /** Chart instances */
    let chartWaterfall = null;
    let chartEffHP = null;
    let chartHitExp = null;
    let chartTradeoff = null;

    // =====================================================================
    // DOM Helpers
    // =====================================================================

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    function numVal(sel) {
        const el = typeof sel === 'string' ? $(sel) : sel;
        return Number(el.value) || 0;
    }

    function setVal(sel, val) {
        const el = typeof sel === 'string' ? $(sel) : sel;
        el.value = val;
    }

    function showToast(msg, duration = 2000) {
        const t = $('#toast');
        t.textContent = msg;
        t.classList.add('visible');
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove('visible'), duration);
    }

    // =====================================================================
    // Config Readers
    // =====================================================================

    function readDefender() {
        const dex = numVal('#def-dex');
        const wis = numVal('#def-wis');
        const size = numVal('#def-size');
        const con = numVal('#def-con');
        const wil = numVal('#def-wil');
        const composure = numVal('#def-composure');
        const level = numVal('#def-level');
        const halfling = $('#def-halfling').checked;

        const sdOverride = $('#sd-override-toggle').checked;
        const sd = sdOverride
            ? numVal('#sd-override')
            : DTD.derived.calculateSD(Math.min(dex, numVal('#def-max-dex')), wis, size, halfling);

        const hp = DTD.derived.calculateHP(con, wil);
        const resilience = DTD.derived.calculateResilience(size, level);
        const mentalDef = DTD.derived.calculateMentalDefense(composure);

        // AP: use single value or per-location
        const singleAP = numVal('#def-ap');
        const locDetails = $('.location-details');
        const useLocations = locDetails.open;
        const locationAP = {};
        if (useLocations) {
            for (const input of $$('.loc-ap')) {
                locationAP[input.dataset.loc] = Number(input.value) || 0;
            }
        } else {
            for (const loc of Object.keys(HIT_LOCATIONS)) {
                locationAP[loc] = singleAP;
            }
        }

        return {
            dex, wis, size, con, wil, composure, level, halfling,
            sd, hp, resilience, mentalDef,
            ap: singleAP,
            locationAP,
            aura: numVal('#def-aura'),
            cover: numVal('#def-cover'),
            maxDex: numVal('#def-max-dex'),
            dodge: numVal('#def-dodge'),
            parry: numVal('#def-parry'),
        };
    }

    function readAttacker() {
        return {
            atkRolled: numVal('#atk-rolled'),
            atkKept: numVal('#atk-kept'),
            atkLevel: numVal('#atk-level'),
            atkMod: numVal('#atk-mod'),
            dmgRolled: numVal('#dmg-rolled'),
            dmgKept: numVal('#dmg-kept'),
            dmgFlat: numVal('#dmg-flat'),
            dmgType: $('#dmg-type').value,
            pen: numVal('#dmg-pen'),
            tearing: $('#prop-tearing').checked,
            blast: $('#prop-blast').checked,
            scatter: $('#prop-scatter').checked,
            powerField: $('#prop-power-field').checked,
        };
    }

    // =====================================================================
    // Analytical Calculations
    // =====================================================================

    /**
     * Compute damage pipeline for a specific raw damage value.
     * @param {number} rawDmg - Incoming raw damage
     * @param {Object} def - Defender config
     * @param {Object} atk - Attacker config
     * @param {number} [locationAP] - AP at hit location (if specific)
     * @returns {{ raw, effectiveAP, armorSoak, auraSoak, coverSoak, afterMitigation, hpLost, penApplied }}
     */
    function computePipeline(rawDmg, def, atk, locationAP) {
        const ap = locationAP != null ? locationAP : def.ap;

        // Penetration reduces AP
        const effectiveAP = Math.max(0, ap - atk.pen);
        const penApplied = ap - effectiveAP;

        // Blast doubles flak/AP if it's blast type (simplified: double AP for blast)
        let armorAP = effectiveAP;
        if (atk.blast) {
            // Flak armor doubles AP vs blast — simplified as doubling effective AP
            armorAP = effectiveAP * 2;
        }

        // Cover adds flat AP
        const coverAP = def.cover;

        // Total physical soak
        const totalPhysicalAP = armorAP + coverAP;

        // Damage type determines armor vs aura
        let armorSoak = 0;
        let auraSoak = 0;
        let coverSoak = 0;
        let remaining = rawDmg;

        // All damage types use armor; "magical" damage would use aura instead,
        // but in standard weapon combat, armor applies. We model aura as separate.
        armorSoak = Math.min(remaining, armorAP);
        remaining -= armorSoak;

        coverSoak = Math.min(remaining, coverAP);
        remaining -= coverSoak;

        auraSoak = Math.min(remaining, def.aura);
        remaining -= auraSoak;

        const afterMitigation = Math.max(0, remaining);

        // Resilience conversion
        let hpLost = def.resilience > 0 ? Math.floor(afterMitigation / def.resilience) : afterMitigation;

        // Tearing: always deals at least 1 wound if any damage got through before resilience
        if (atk.tearing && afterMitigation > 0 && hpLost < 1) {
            hpLost = 1;
        }

        return {
            raw: rawDmg,
            effectiveAP: armorAP,
            armorSoak,
            auraSoak,
            coverSoak,
            afterMitigation,
            hpLost,
            penApplied,
        };
    }

    /**
     * Compute weighted effective AP across all locations.
     */
    function computeWeightedAP(def, pen) {
        let total = 0;
        for (const [loc, info] of Object.entries(HIT_LOCATIONS)) {
            const locAP = def.locationAP[loc] || 0;
            const effAP = Math.max(0, locAP - pen);
            total += effAP * info.prob;
        }
        return total;
    }

    // =====================================================================
    // Web Worker (Inline via Blob URL)
    // =====================================================================

    function getWorkerSource() {
        return `
'use strict';

function rollOneDie() {
    let value = 0;
    let roll;
    do {
        roll = Math.floor(Math.random() * 10) + 1;
        value += roll;
    } while (roll === 10);
    return value;
}

function compressOverflow(numDice, keepDice, modifier) {
    if (numDice > 10) {
        const excess = numDice - 10;
        keepDice += Math.floor(excess / 2);
        numDice = 10;
    }
    if (keepDice > numDice) keepDice = numDice;
    if (keepDice > 10) {
        modifier += (keepDice - 10) * 5;
        keepDice = 10;
    }
    return { numDice, keepDice, modifier };
}

function simulateRoll(numDice, keepDice, modifier) {
    const ov = compressOverflow(numDice, keepDice, modifier);
    numDice = ov.numDice;
    keepDice = ov.keepDice;
    modifier = ov.modifier;

    const rolls = new Array(numDice);
    for (let i = 0; i < numDice; i++) {
        rolls[i] = rollOneDie();
    }
    rolls.sort((a, b) => b - a);
    let sum = 0;
    for (let i = 0; i < keepDice; i++) {
        sum += rolls[i];
    }
    return sum + modifier;
}

/**
 * Run a full attack simulation trial.
 * Returns: { hit, hitLocation, rawDmg, hpLost }
 */
function simulateTrial(cfg) {
    // Attack roll
    let attackTotal = simulateRoll(cfg.atkRolled + cfg.atkLevel, cfg.atkKept, cfg.atkMod);

    // Determine effective SD (with optional dodge/parry)
    let sd = cfg.sd;
    if (cfg.dodgePool > 0) {
        const dodgeRoll = simulateRoll(cfg.dodgeDex + cfg.dodgePool, cfg.dodgePool, 0);
        sd += Math.floor(dodgeRoll / 2);
    } else if (cfg.parryPool > 0) {
        const parryRoll = simulateRoll(cfg.parryPool + cfg.parryLevel, cfg.parryPool, 0);
        sd += Math.floor(parryRoll / 2);
    }

    if (attackTotal < sd) {
        return { hit: false, hitLocation: null, rawDmg: 0, hpLost: 0 };
    }

    // Hit location (d10)
    const locRoll = Math.floor(Math.random() * 10) + 1;
    let hitLocation;
    if (locRoll === 1) hitLocation = 'lleg';
    else if (locRoll === 2) hitLocation = 'rleg';
    else if (locRoll <= 6) hitLocation = 'body';
    else if (locRoll === 7) hitLocation = 'gizzards';
    else if (locRoll === 8) hitLocation = 'larm';
    else if (locRoll === 9) hitLocation = 'rarm';
    else hitLocation = 'head';

    // Damage roll
    const rawDmg = simulateRoll(cfg.dmgRolled, cfg.dmgKept, cfg.dmgFlat);

    // Location AP
    const locAP = cfg.locationAP[hitLocation] || 0;
    let effectiveAP = Math.max(0, locAP - cfg.pen);

    // Blast doubles AP? (simplified flak)
    if (cfg.blast) effectiveAP *= 2;

    // Cover
    const coverAP = cfg.cover || 0;

    // Soak
    let remaining = rawDmg;
    remaining = Math.max(0, remaining - effectiveAP);
    remaining = Math.max(0, remaining - coverAP);
    remaining = Math.max(0, remaining - (cfg.aura || 0));

    // Resilience
    let hpLost = cfg.resilience > 0 ? Math.floor(remaining / cfg.resilience) : remaining;
    if (cfg.tearing && remaining > 0 && hpLost < 1) hpLost = 1;

    return { hit: true, hitLocation, rawDmg, hpLost };
}

self.onmessage = function(e) {
    const { id, cfg, trials } = e.data;

    let hits = 0;
    let totalHPLost = 0;
    let totalRawDmg = 0;
    const hpDistribution = {};       // hpLost -> count
    const rawDmgOnHit = [];
    const locationHits = {};

    for (let i = 0; i < trials; i++) {
        const result = simulateTrial(cfg);
        if (result.hit) {
            hits++;
            totalHPLost += result.hpLost;
            totalRawDmg += result.rawDmg;
            hpDistribution[result.hpLost] = (hpDistribution[result.hpLost] || 0) + 1;
            rawDmgOnHit.push(result.rawDmg);
            locationHits[result.hitLocation] = (locationHits[result.hitLocation] || 0) + 1;
        }
    }

    const hitRate = hits / trials;
    const avgHPLost = trials > 0 ? totalHPLost / trials : 0;
    const avgHPLostOnHit = hits > 0 ? totalHPLost / hits : 0;
    const avgRawDmgOnHit = hits > 0 ? totalRawDmg / hits : 0;

    // Mean raw damage on hit
    let medianRawDmg = 0;
    if (rawDmgOnHit.length > 0) {
        rawDmgOnHit.sort((a, b) => a - b);
        const mid = Math.floor(rawDmgOnHit.length / 2);
        medianRawDmg = rawDmgOnHit.length % 2 ? rawDmgOnHit[mid] : (rawDmgOnHit[mid - 1] + rawDmgOnHit[mid]) / 2;
    }

    self.postMessage({
        id,
        hitRate,
        avgHPLost,
        avgHPLostOnHit,
        avgRawDmgOnHit,
        medianRawDmg,
        hpDistribution,
        locationHits,
        hits,
        trials,
    });
};
`;
    }

    function initWorker() {
        const blob = new Blob([getWorkerSource()], { type: 'application/javascript' });
        worker = new Worker(URL.createObjectURL(blob));
        worker.onmessage = (e) => {
            const { id } = e.data;
            const cb = pendingJobs.get(id);
            if (cb) {
                pendingJobs.delete(id);
                cb(e.data);
            }
        };
    }

    function runSimulation(cfg) {
        return new Promise((resolve) => {
            const id = ++jobId;
            pendingJobs.set(id, resolve);
            worker.postMessage({ id, cfg, trials: TRIALS });
        });
    }

    // =====================================================================
    // Chart Management
    // =====================================================================

    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#e8e6e3', font: { size: 11 } }
            }
        },
        scales: {
            x: {
                ticks: { color: '#94929d' },
                grid: { color: 'rgba(42,42,50,0.6)' },
            },
            y: {
                ticks: { color: '#94929d' },
                grid: { color: 'rgba(42,42,50,0.6)' },
            }
        }
    };

    function deepMerge(base, override) {
        const result = { ...base };
        for (const key of Object.keys(override)) {
            if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key]) && base[key]) {
                result[key] = deepMerge(base[key], override[key]);
            } else {
                result[key] = override[key];
            }
        }
        return result;
    }

    // -----------------------------------------------------------------
    // Graph 1: Waterfall
    // -----------------------------------------------------------------
    function renderWaterfall(def, atk) {
        const rawDmg = numVal('#waterfall-slider');
        const pipeline = computePipeline(rawDmg, def, atk);

        const labels = ['Raw Damage', 'After Pen→AP', 'After Armor', 'After Cover', 'After Aura', 'After Resilience'];
        const values = [
            pipeline.raw,
            pipeline.armorSoak,
            pipeline.coverSoak,
            pipeline.auraSoak,
            pipeline.afterMitigation - pipeline.hpLost * (def.resilience || 1),
            pipeline.hpLost,
        ];

        // Build waterfall-style stacked bar
        // Each segment: transparent spacer + colored block
        const segments = [];
        let running = pipeline.raw;

        // Armor soak segment
        const afterArmor = running - pipeline.armorSoak;
        // Cover soak
        const afterCover = afterArmor - pipeline.coverSoak;
        // Aura soak
        const afterAura = afterCover - pipeline.auraSoak;
        // Resilience waste (damage that doesn't convert to full HP)
        const resWaste = pipeline.afterMitigation - pipeline.hpLost * (def.resilience > 0 ? def.resilience : 1);
        const hpLostDmg = pipeline.hpLost * (def.resilience > 0 ? def.resilience : 1);

        const data = {
            labels: [''],
            datasets: [
                {
                    label: `HP Lost (${pipeline.hpLost})`,
                    data: [pipeline.hpLost > 0 ? hpLostDmg : 0],
                    backgroundColor: COLORS.hpLost,
                    borderWidth: 0,
                },
                {
                    label: `Resilience Remainder (${resWaste > 0 ? resWaste : 0})`,
                    data: [Math.max(0, resWaste)],
                    backgroundColor: COLORS.resilConvert,
                    borderWidth: 0,
                },
                {
                    label: `Aura Soak (${pipeline.auraSoak})`,
                    data: [pipeline.auraSoak],
                    backgroundColor: COLORS.auraSoak,
                    borderWidth: 0,
                },
                {
                    label: `Cover Soak (${pipeline.coverSoak})`,
                    data: [pipeline.coverSoak],
                    backgroundColor: COLORS.coverSoak,
                    borderWidth: 0,
                },
                {
                    label: `Armor Soak (${pipeline.armorSoak})`,
                    data: [pipeline.armorSoak],
                    backgroundColor: COLORS.armorSoak,
                    borderWidth: 0,
                },
            ]
        };

        const opts = deepMerge(chartDefaults, {
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: `Raw ${rawDmg} → ${pipeline.hpLost} HP lost (AP ${def.ap}, Pen ${atk.pen}, Res ${def.resilience})`,
                    color: '#e8e6e3',
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}`
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: 'Damage', color: '#94929d' },
                    ticks: { color: '#94929d' },
                    grid: { color: 'rgba(42,42,50,0.6)' },
                    min: 0,
                },
                y: {
                    stacked: true,
                    display: false,
                }
            }
        });

        if (chartWaterfall) {
            chartWaterfall.data = data;
            chartWaterfall.options = opts;
            chartWaterfall.update();
        } else {
            chartWaterfall = new Chart($('#chart-waterfall'), { type: 'bar', data, options: opts });
        }
    }

    // -----------------------------------------------------------------
    // Graph 2: Effective HP
    // -----------------------------------------------------------------
    function renderEffectiveHP(def, atk) {
        const maxRaw = 40;
        const labels = [];
        const hpLine = [];
        const tearingLine = [];

        for (let raw = 0; raw <= maxRaw; raw++) {
            labels.push(raw);
            const pipeline = computePipeline(raw, def, atk);
            hpLine.push(pipeline.hpLost);
            // Tearing minimum: if tearing and damage > 0 after armor, at least 1
            if (atk.tearing && pipeline.afterMitigation > 0) {
                tearingLine.push(Math.max(1, pipeline.hpLost));
            } else {
                tearingLine.push(pipeline.hpLost);
            }
        }

        const datasets = [
            {
                label: 'HP Lost',
                data: hpLine,
                borderColor: COLORS.hpLost,
                backgroundColor: 'rgba(212,168,75,0.1)',
                fill: true,
                tension: 0.1,
                pointRadius: 0,
            }
        ];

        if (atk.tearing) {
            datasets.push({
                label: 'HP Lost (w/ Tearing)',
                data: tearingLine,
                borderColor: COLORS.raw,
                borderDash: [5, 3],
                fill: false,
                tension: 0.1,
                pointRadius: 0,
            });
        }

        const data = { labels, datasets };
        const opts = deepMerge(chartDefaults, {
            plugins: {
                title: { display: false },
            },
            scales: {
                x: {
                    title: { display: true, text: 'Raw Incoming Damage', color: '#94929d' },
                    ticks: { color: '#94929d' },
                    grid: { color: 'rgba(42,42,50,0.6)' },
                },
                y: {
                    title: { display: true, text: 'HP Lost', color: '#94929d' },
                    ticks: { color: '#94929d', stepSize: 1 },
                    grid: { color: 'rgba(42,42,50,0.6)' },
                    beginAtZero: true,
                }
            }
        });

        if (chartEffHP) {
            chartEffHP.data = data;
            chartEffHP.options = opts;
            chartEffHP.update();
        } else {
            chartEffHP = new Chart($('#chart-effective-hp'), { type: 'line', data, options: opts });
        }
    }

    // -----------------------------------------------------------------
    // Graph 3: Hit Probability + Expected Damage (via Monte Carlo)
    // -----------------------------------------------------------------
    async function renderHitExpected(def, atk) {
        const sdRange = [];
        const hitProbs = [];
        const expDamage = [];

        // Sweep SD from 10 to 40
        const promises = [];
        for (let sd = 10; sd <= 40; sd += 2) {
            sdRange.push(sd);
            const cfg = buildSimConfig(def, atk, sd);
            promises.push(runSimulation(cfg));
        }

        const results = await Promise.all(promises);
        for (const r of results) {
            hitProbs.push(r.hitRate * 100);
            expDamage.push(r.avgHPLost);
        }

        const data = {
            labels: sdRange,
            datasets: [
                {
                    label: 'P(Hit) %',
                    data: hitProbs,
                    borderColor: COLORS.hitProb,
                    backgroundColor: 'rgba(96,165,250,0.1)',
                    fill: false,
                    tension: 0.2,
                    pointRadius: 2,
                    yAxisID: 'y',
                },
                {
                    label: 'Expected HP Lost',
                    data: expDamage,
                    borderColor: COLORS.expDamage,
                    backgroundColor: 'rgba(248,113,113,0.1)',
                    fill: false,
                    tension: 0.2,
                    pointRadius: 2,
                    yAxisID: 'y1',
                }
            ]
        };

        const opts = deepMerge(chartDefaults, {
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: false },
            },
            scales: {
                x: {
                    title: { display: true, text: 'Defender SD', color: '#94929d' },
                    ticks: { color: '#94929d' },
                    grid: { color: 'rgba(42,42,50,0.6)' },
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'P(Hit) %', color: '#60a5fa' },
                    ticks: { color: '#60a5fa' },
                    grid: { color: 'rgba(42,42,50,0.6)' },
                    min: 0,
                    max: 100,
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Expected HP Lost', color: '#f87171' },
                    ticks: { color: '#f87171' },
                    grid: { drawOnChartArea: false },
                    min: 0,
                }
            }
        });

        if (chartHitExp) {
            chartHitExp.data = data;
            chartHitExp.options = opts;
            chartHitExp.update();
        } else {
            chartHitExp = new Chart($('#chart-hit-expected'), { type: 'line', data, options: opts });
        }
    }

    // -----------------------------------------------------------------
    // Graph 4: Armor Weight Trade-off
    // -----------------------------------------------------------------
    function renderArmorTradeoff(def, atk) {
        const maxRaw = 40;
        const labels = [];
        for (let raw = 0; raw <= maxRaw; raw++) labels.push(raw);

        // Compare 4 armor configurations
        const configs = [
            { label: 'No Armor (AP 0, Dex 5)',    ap: 0,  maxDex: 99, sdDex: 5, weight: 'none' },
            { label: 'Light (AP 3, MaxDex 5)',     ap: 3,  maxDex: 5,  sdDex: 4, weight: 'light' },
            { label: 'Heavy (AP 7, MaxDex 2)',     ap: 7,  maxDex: 2,  sdDex: 2, weight: 'heavy' },
            { label: 'Power (AP 10, MaxDex 2)',    ap: 10, maxDex: 2,  sdDex: 2, weight: 'power' },
        ];

        const datasets = configs.map((cfg, i) => {
            const data = [];
            for (let raw = 0; raw <= maxRaw; raw++) {
                const effAP = Math.max(0, cfg.ap - atk.pen);
                const afterArmor = Math.max(0, raw - effAP - def.aura - def.cover);
                const hpLost = def.resilience > 0 ? Math.floor(afterArmor / def.resilience) : afterArmor;
                const finalHP = (atk.tearing && afterArmor > 0 && hpLost < 1) ? 1 : hpLost;
                // Total mitigation = raw - (finalHP * resilience or less)
                data.push(raw - finalHP * (def.resilience > 0 ? def.resilience : 1));
            }
            return {
                label: cfg.label,
                data,
                borderColor: ARMOR_COMPARE_COLORS[i],
                fill: false,
                tension: 0.2,
                pointRadius: 0,
            };
        });

        const data = { labels, datasets };
        const opts = deepMerge(chartDefaults, {
            plugins: {
                title: { display: false },
            },
            scales: {
                x: {
                    title: { display: true, text: 'Raw Incoming Damage', color: '#94929d' },
                    ticks: { color: '#94929d' },
                    grid: { color: 'rgba(42,42,50,0.6)' },
                },
                y: {
                    title: { display: true, text: 'Total Mitigation', color: '#94929d' },
                    ticks: { color: '#94929d' },
                    grid: { color: 'rgba(42,42,50,0.6)' },
                    beginAtZero: true,
                }
            }
        });

        if (chartTradeoff) {
            chartTradeoff.data = data;
            chartTradeoff.options = opts;
            chartTradeoff.update();
        } else {
            chartTradeoff = new Chart($('#chart-armor-tradeoff'), { type: 'line', data, options: opts });
        }
    }

    // -----------------------------------------------------------------
    // Graph 5: Hit Location Heat Map (Canvas API)
    // -----------------------------------------------------------------
    function renderHeatMap(def, atk) {
        const canvas = $('#canvas-heatmap');
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Body regions definitions (x, y, w, h) on a 300×400 canvas
        const regions = {
            head:     { x: 120, y: 10,  w: 60, h: 50  },
            body:     { x: 100, y: 70,  w: 100, h: 120 },
            gizzards: { x: 110, y: 190, w: 80, h: 40  },
            larm:     { x: 30,  y: 80,  w: 60, h: 110 },
            rarm:     { x: 210, y: 80,  w: 60, h: 110 },
            lleg:     { x: 100, y: 240, w: 45, h: 140 },
            rleg:     { x: 155, y: 240, w: 45, h: 140 },
        };

        // Color intensity based on AP (0=dark, 16=bright)
        function apColor(ap, alpha) {
            const t = Math.min(ap / 16, 1);
            const r = Math.round(96 + t * 156);  // 96 → 252
            const g = Math.round(165 - t * 80);   // 165 → 85
            const b = Math.round(250 - t * 180);  // 250 → 70
            return `rgba(${r},${g},${b},${alpha || 0.8})`;
        }

        const legendEl = $('#heatmap-legend');
        legendEl.innerHTML = '';

        for (const [loc, info] of Object.entries(HIT_LOCATIONS)) {
            const region = regions[loc];
            if (!region) continue;

            const locAP = def.locationAP[loc] || 0;
            const effAP = Math.max(0, locAP - atk.pen);

            // Draw region
            ctx.fillStyle = apColor(effAP);
            ctx.fillRect(region.x, region.y, region.w, region.h);

            // Border
            ctx.strokeStyle = '#3a3a44';
            ctx.lineWidth = 1;
            ctx.strokeRect(region.x, region.y, region.w, region.h);

            // Label
            ctx.fillStyle = '#e8e6e3';
            ctx.font = '11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
                `${info.label}`,
                region.x + region.w / 2,
                region.y + region.h / 2 - 6
            );
            ctx.fillStyle = '#d4a84b';
            ctx.font = 'bold 13px system-ui, sans-serif';
            ctx.fillText(
                `AP ${effAP}`,
                region.x + region.w / 2,
                region.y + region.h / 2 + 10
            );
            ctx.fillStyle = '#94929d';
            ctx.font = '10px system-ui, sans-serif';
            ctx.fillText(
                `${(info.prob * 100).toFixed(0)}%`,
                region.x + region.w / 2,
                region.y + region.h / 2 + 24
            );

            // Build legend
            const item = document.createElement('div');
            item.className = 'heatmap-legend-item';
            item.innerHTML = `
                <span class="heatmap-legend-swatch" style="background:${apColor(effAP)}"></span>
                <span>${info.label}: AP ${effAP} (${(info.prob * 100).toFixed(0)}% hit)</span>
            `;
            legendEl.appendChild(item);
        }

        // Weighted AP summary
        const wap = computeWeightedAP(def, atk.pen);
        const summary = document.createElement('div');
        summary.className = 'heatmap-legend-item';
        summary.innerHTML = `<strong style="color:var(--accent)">Weighted AP: ${wap.toFixed(1)}</strong>`;
        legendEl.appendChild(summary);
    }

    // =====================================================================
    // Summary Table
    // =====================================================================

    async function renderSummary(def, atk, simResult) {
        $('#sum-sd').textContent = def.sd;

        // Effective SD with dodge/parry (estimated)
        let effSD = def.sd;
        if (def.dodge > 0) {
            // Rough expected value: dodge pool average / 2
            const dodgePool = def.dex + def.dodge;
            const dodgeKeep = def.dodge;
            effSD += Math.round(dodgeKeep * 5.5 / 2); // ~5.5 avg per kept die, halved
        } else if (def.parry > 0) {
            const parryKeep = def.parry;
            effSD += Math.round(parryKeep * 5.5 / 2);
        }
        $('#sum-eff-sd').textContent = effSD + (effSD !== def.sd ? ` (base ${def.sd})` : '');

        $('#sum-hit-pct').textContent = (simResult.hitRate * 100).toFixed(1) + '%';
        $('#sum-eff-ap').textContent = computeWeightedAP(def, atk.pen).toFixed(1);
        $('#sum-raw-dmg').textContent = simResult.avgRawDmgOnHit.toFixed(1);

        // Expected damage after armor (analytical from avg raw)
        const avgPipeline = computePipeline(Math.round(simResult.avgRawDmgOnHit), def, atk);
        $('#sum-after-armor').textContent = avgPipeline.afterMitigation.toFixed(1);

        $('#sum-hp-lost').textContent = simResult.avgHPLost.toFixed(2);

        // Attacks to down
        const atd = simResult.avgHPLost > 0 ? Math.ceil(def.hp / simResult.avgHPLost) : '∞';
        $('#sum-atk-down').textContent = atd;
    }

    // =====================================================================
    // Simulation Config Builder
    // =====================================================================

    function buildSimConfig(def, atk, sdOverride) {
        return {
            sd: sdOverride != null ? sdOverride : def.sd,
            atkRolled: atk.atkRolled,
            atkKept: atk.atkKept,
            atkLevel: atk.atkLevel,
            atkMod: atk.atkMod,
            dmgRolled: atk.dmgRolled,
            dmgKept: atk.dmgKept,
            dmgFlat: atk.dmgFlat,
            pen: atk.pen,
            tearing: atk.tearing,
            blast: atk.blast,
            aura: def.aura,
            cover: def.cover,
            resilience: def.resilience,
            locationAP: def.locationAP,
            dodgePool: def.dodge,
            dodgeDex: def.dex,
            parryPool: def.parry,
            parryLevel: def.level,
        };
    }

    // =====================================================================
    // Main Update Loop
    // =====================================================================

    async function update() {
        const def = readDefender();
        const atk = readAttacker();

        // Update derived display
        $('#disp-sd').textContent = def.sd;
        $('#disp-hp').textContent = def.hp;
        $('#disp-resilience').textContent = def.resilience;
        $('#disp-mental-def').textContent = def.mentalDef;

        // Render synchronous charts
        renderWaterfall(def, atk);
        renderEffectiveHP(def, atk);
        renderArmorTradeoff(def, atk);
        renderHeatMap(def, atk);

        // Run Monte Carlo for current config
        const simCfg = buildSimConfig(def, atk);
        const simResult = await runSimulation(simCfg);

        // Render async charts
        await renderHitExpected(def, atk);

        // Update summary
        await renderSummary(def, atk, simResult);
    }

    function scheduleUpdate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(update, DEBOUNCE_MS);
    }

    // =====================================================================
    // Preset Loading
    // =====================================================================

    function applyDefenderPreset(key) {
        const p = DEFENDER_PRESETS[key];
        if (!p) return;

        setVal('#def-dex', p.dex);
        setVal('#def-wis', p.wis);
        setVal('#def-size', p.size);
        setVal('#def-con', p.con);
        setVal('#def-wil', p.wil);
        setVal('#def-composure', p.composure);
        setVal('#def-level', p.level);
        setVal('#def-ap', p.ap);
        setVal('#def-max-dex', p.maxDex);
        setVal('#def-aura', p.aura);
        setVal('#def-cover', p.cover);
        setVal('#def-dodge', p.dodge);
        setVal('#def-parry', p.parry);
        $('#def-halfling').checked = p.halfling;
        $('#def-armor-weight').value = p.weight;
        $('#sd-override-toggle').checked = false;
        $('#sd-override').disabled = true;

        // Fill all locations with the single AP value
        for (const input of $$('.loc-ap')) {
            input.value = p.ap;
        }

        showToast(`Loaded: ${key}`);
        scheduleUpdate();
    }

    function applyAttackerPreset(key) {
        const p = ATTACKER_PRESETS[key];
        if (!p) return;

        setVal('#atk-rolled', p.atkRolled);
        setVal('#atk-kept', p.atkKept);
        setVal('#atk-level', p.atkLevel);
        setVal('#atk-mod', p.atkMod);
        setVal('#dmg-rolled', p.dmgRolled);
        setVal('#dmg-kept', p.dmgKept);
        setVal('#dmg-flat', p.dmgFlat);
        setVal('#dmg-pen', p.pen);
        $('#dmg-type').value = p.dmgType;
        $('#prop-tearing').checked = p.tearing;
        $('#prop-blast').checked = p.blast;
        $('#prop-scatter').checked = p.scatter;
        $('#prop-power-field').checked = p.powerField;

        showToast(`Loaded: ${key}`);
        scheduleUpdate();
    }

    // =====================================================================
    // Event Binding
    // =====================================================================

    function bindEvents() {
        // All numeric inputs and selects trigger update
        for (const input of $$('.input-panel input, .input-panel select')) {
            input.addEventListener('input', scheduleUpdate);
            input.addEventListener('change', scheduleUpdate);
        }

        // Waterfall slider
        const waterfallSlider = $('#waterfall-slider');
        waterfallSlider.addEventListener('input', () => {
            $('#waterfall-value').textContent = waterfallSlider.value;
            const def = readDefender();
            const atk = readAttacker();
            renderWaterfall(def, atk);
        });

        // SD override toggle
        $('#sd-override-toggle').addEventListener('change', (e) => {
            const overrideInput = $('#sd-override');
            overrideInput.disabled = !e.target.checked;
            if (e.target.checked) {
                overrideInput.value = $('#disp-sd').textContent;
            }
            scheduleUpdate();
        });

        // Armor weight selector auto-fills max dex
        $('#def-armor-weight').addEventListener('change', (e) => {
            const w = ARMOR_WEIGHTS[e.target.value];
            if (w) {
                setVal('#def-max-dex', w.maxDex);
            }
            scheduleUpdate();
        });

        // Sync location AP from single value
        $('#sync-loc-ap').addEventListener('click', () => {
            const ap = numVal('#def-ap');
            for (const input of $$('.loc-ap')) {
                input.value = ap;
            }
            scheduleUpdate();
        });

        // Defender presets
        for (const btn of $$('.preset-def')) {
            btn.addEventListener('click', () => applyDefenderPreset(btn.dataset.preset));
        }

        // Attacker presets
        for (const btn of $$('.preset-atk')) {
            btn.addEventListener('click', () => applyAttackerPreset(btn.dataset.preset));
        }
    }

    // =====================================================================
    // Init
    // =====================================================================

    function init() {
        initWorker();
        bindEvents();
        // Initial render
        update();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // =====================================================================
    // Public API (for debugging/testing)
    // =====================================================================

    return {
        update,
        computePipeline,
        computeWeightedAP,
        readDefender,
        readAttacker,
        HIT_LOCATIONS,
        DEFENDER_PRESETS,
        ATTACKER_PRESETS,
    };

})();
