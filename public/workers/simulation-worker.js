/**
 * DTD Success Curve Analyzer — Monte Carlo Simulation Worker
 *
 * Runs XkY dice simulations off the main thread. Receives pool configs,
 * returns statistical summaries and histogram data.
 *
 * Message protocol:
 *   IN:  { id, numDice, keepDice, modifier, trials, tnMin, tnMax, tnStep, selectedTN }
 *   OUT: { id, mean, median, stdDev, min, max, histogram, successRates, raiseChecks }
 */
'use strict';

// =========================================================================
// Dice Primitives (self-contained — no DOM dependencies)
// =========================================================================

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

function simulateOnce(numDice, keepDice, modifier) {
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

// =========================================================================
// Statistics Helpers
// =========================================================================

function computeStats(totals) {
    const n = totals.length;
    if (n === 0) return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };

    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
        const v = totals[i];
        sum += v;
        if (v < min) min = v;
        if (v > max) max = v;
    }
    const mean = sum / n;

    let varianceSum = 0;
    for (let i = 0; i < n; i++) {
        const d = totals[i] - mean;
        varianceSum += d * d;
    }
    const stdDev = Math.sqrt(varianceSum / n);

    const sorted = Float64Array.from(totals);
    sorted.sort();
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    return { mean, median, stdDev, min, max };
}

function buildHistogram(totals, maxBin) {
    const bins = new Uint32Array(maxBin + 1);
    const n = totals.length;
    for (let i = 0; i < n; i++) {
        const v = Math.round(totals[i]);
        const idx = Math.max(0, Math.min(v, maxBin));
        bins[idx]++;
    }
    const histogram = new Array(maxBin + 1);
    for (let i = 0; i <= maxBin; i++) {
        histogram[i] = (bins[i] / n) * 100;
    }
    return histogram;
}

function computeSuccessRates(totals, tnMin, tnMax, tnStep) {
    const rates = {};
    const n = totals.length;
    for (let tn = tnMin; tn <= tnMax; tn += tnStep) {
        let successes = 0;
        for (let i = 0; i < n; i++) {
            if (totals[i] >= tn) successes++;
        }
        rates[tn] = (successes / n) * 100;
    }
    return rates;
}

function computeRaiseCheckDistribution(totals, tn) {
    const buckets = new Float64Array(7);
    const n = totals.length;
    for (let i = 0; i < n; i++) {
        const diff = totals[i] - tn;
        if (diff < 0) {
            const checks = Math.floor(Math.abs(diff) / 5);
            if (checks >= 3) buckets[0]++;
            else if (checks === 2) buckets[1]++;
            else buckets[2]++;
        } else {
            const raises = Math.floor(diff / 5);
            if (raises === 0) buckets[3]++;
            else if (raises === 1) buckets[4]++;
            else if (raises === 2) buckets[5]++;
            else buckets[6]++;
        }
    }
    const result = new Array(7);
    for (let i = 0; i < 7; i++) {
        result[i] = (buckets[i] / n) * 100;
    }
    return result;
}

// =========================================================================
// Worker Message Handler
// =========================================================================

self.onmessage = function (e) {
    const {
        id,
        numDice: rawNum,
        keepDice: rawKeep,
        modifier: rawMod,
        trials = 100000,
        tnMin = 5,
        tnMax = 50,
        tnStep = 1,
        selectedTN = 15
    } = e.data;

    const { numDice, keepDice, modifier } = compressOverflow(rawNum, rawKeep, rawMod || 0);

    const totals = new Float64Array(trials);
    for (let i = 0; i < trials; i++) {
        totals[i] = simulateOnce(numDice, keepDice, modifier);
    }

    const stats = computeStats(totals);
    const histogramMax = Math.min(Math.ceil(stats.max) + 5, 120);
    const histogram = buildHistogram(totals, histogramMax);
    const successRates = computeSuccessRates(totals, tnMin, tnMax, tnStep);
    const raiseChecks = computeRaiseCheckDistribution(totals, selectedTN);

    self.postMessage({
        id,
        mean: Math.round(stats.mean * 100) / 100,
        median: Math.round(stats.median * 100) / 100,
        stdDev: Math.round(stats.stdDev * 100) / 100,
        min: stats.min,
        max: stats.max,
        histogram,
        successRates,
        raiseChecks
    });
};
