/**
 * DTD Defense Graph — Monte Carlo Defense Simulation Worker
 *
 * Runs attack-vs-defense simulations off the main thread.
 * Receives attacker/defender configs, returns hit rates, HP loss distributions,
 * and hit location breakdowns.
 *
 * Message protocol:
 *   IN:  { id, cfg, trials }
 *   OUT: { id, hitRate, avgHPLost, avgHPLostOnHit, avgRawDmgOnHit,
 *          medianRawDmg, hpDistribution, locationHits, hits, trials }
 */

importScripts("./dice-common.js");

// =========================================================================
// Dice Pool Convenience Wrapper
// =========================================================================

/**
 * Roll a compressed dice pool: applies overflow compression then rolls.
 * @param {number} numDice  - Number of dice to roll
 * @param {number} keepDice - Number of dice to keep (highest)
 * @param {number} modifier - Flat modifier added to the total
 * @returns {number} Final total
 */
function simulateRoll(numDice, keepDice, modifier) {
	const ov = compressOverflow(numDice, keepDice, modifier);
	return rollPool(ov.numDice, ov.keepDice, ov.modifier);
}

// =========================================================================
// Trial Simulation
// =========================================================================

function simulateTrial(cfg) {
	const attackTotal = simulateRoll(cfg.atkRolled + cfg.atkLevel, cfg.atkKept, cfg.atkMod);

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

	const locRoll = Math.floor(Math.random() * 10) + 1;
	let hitLocation;
	if (locRoll === 1) hitLocation = "lleg";
	else if (locRoll === 2) hitLocation = "rleg";
	else if (locRoll <= 6) hitLocation = "body";
	else if (locRoll === 7) hitLocation = "gizzards";
	else if (locRoll === 8) hitLocation = "larm";
	else if (locRoll === 9) hitLocation = "rarm";
	else hitLocation = "head";

	const rawDmg = simulateRoll(cfg.dmgRolled, cfg.dmgKept, cfg.dmgFlat);

	const locAP = cfg.locationAP[hitLocation] || 0;
	let effectiveAP = Math.max(0, locAP - cfg.pen);

	if (cfg.blast) effectiveAP *= 2;

	const coverAP = cfg.cover || 0;

	let remaining = rawDmg;
	remaining = Math.max(0, remaining - effectiveAP);
	remaining = Math.max(0, remaining - coverAP);
	remaining = Math.max(0, remaining - (cfg.aura || 0));

	let hpLost = cfg.resilience > 0 ? Math.floor(remaining / cfg.resilience) : remaining;
	if (cfg.tearing && remaining > 0 && hpLost < 1) hpLost = 1;

	return { hit: true, hitLocation, rawDmg, hpLost };
}

// =========================================================================
// Worker Message Handler
// =========================================================================

self.onmessage = function (e) {
	const { id, cfg, trials } = e.data;

	let hits = 0;
	let totalHPLost = 0;
	let totalRawDmg = 0;
	const hpDistribution = {};
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
