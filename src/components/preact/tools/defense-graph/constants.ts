// =========================================================================
// Hit location probabilities from d10 table
// =========================================================================

export const HIT_LOCATIONS: Record<string, { label: string; d10: number[]; prob: number }> = {
	lleg: { label: "L.Leg", d10: [1], prob: 0.1 },
	rleg: { label: "R.Leg", d10: [2], prob: 0.1 },
	body: { label: "Body", d10: [3, 4, 5, 6], prob: 0.4 },
	gizzards: { label: "Gizzards", d10: [7], prob: 0.1 },
	larm: { label: "L.Arm", d10: [8], prob: 0.1 },
	rarm: { label: "R.Arm", d10: [9], prob: 0.1 },
	head: { label: "Head", d10: [10], prob: 0.1 },
};

// =========================================================================
// Armor weight definitions
// =========================================================================

export const ARMOR_WEIGHTS: Record<string, { maxDex: number; apMin: number; apMax: number }> = {
	none: { maxDex: 99, apMin: 0, apMax: 0 },
	light: { maxDex: 5, apMin: 2, apMax: 4 },
	medium: { maxDex: 4, apMin: 4, apMax: 6 },
	heavy: { maxDex: 2, apMin: 6, apMax: 8 },
	power: { maxDex: 2, apMin: 8, apMax: 12 },
};

// =========================================================================
// Presets
// =========================================================================

export const DEFENDER_PRESETS: Record<string, DefenderPreset> = {
	unarmored: {
		dex: 3,
		wis: 3,
		size: 4,
		con: 3,
		wil: 3,
		composure: 3,
		level: 1,
		ap: 0,
		weight: "none",
		maxDex: 99,
		aura: 0,
		cover: 0,
		halfling: false,
		dodge: 0,
		parry: 0,
	},
	light: {
		dex: 4,
		wis: 3,
		size: 4,
		con: 3,
		wil: 3,
		composure: 3,
		level: 2,
		ap: 3,
		weight: "light",
		maxDex: 5,
		aura: 0,
		cover: 0,
		halfling: false,
		dodge: 2,
		parry: 0,
	},
	heavy: {
		dex: 2,
		wis: 3,
		size: 4,
		con: 4,
		wil: 3,
		composure: 3,
		level: 2,
		ap: 7,
		weight: "heavy",
		maxDex: 2,
		aura: 0,
		cover: 0,
		halfling: false,
		dodge: 0,
		parry: 3,
	},
	power: {
		dex: 3,
		wis: 3,
		size: 4,
		con: 4,
		wil: 4,
		composure: 3,
		level: 3,
		ap: 10,
		weight: "power",
		maxDex: 2,
		aura: 0,
		cover: 0,
		halfling: false,
		dodge: 0,
		parry: 0,
	},
	halfling: {
		dex: 5,
		wis: 3,
		size: 3,
		con: 2,
		wil: 3,
		composure: 3,
		level: 1,
		ap: 2,
		weight: "light",
		maxDex: 5,
		aura: 0,
		cover: 0,
		halfling: true,
		dodge: 3,
		parry: 0,
	},
	sabbat: {
		dex: 3,
		wis: 2,
		size: 4,
		con: 4,
		wil: 3,
		composure: 2,
		level: 1,
		ap: 4,
		weight: "medium",
		maxDex: 4,
		aura: 0,
		cover: 0,
		halfling: false,
		dodge: 0,
		parry: 2,
	},
};

export const ATTACKER_PRESETS: Record<string, AttackerConfig> = {
	lasgun: {
		atkRolled: 5,
		atkKept: 3,
		atkLevel: 0,
		atkMod: 0,
		dmgRolled: 4,
		dmgKept: 2,
		dmgFlat: 0,
		dmgType: "E",
		pen: 0,
		tearing: false,
		blast: false,
		scatter: false,
		powerField: false,
	},
	chainsword: {
		atkRolled: 5,
		atkKept: 3,
		atkLevel: 0,
		atkMod: 0,
		dmgRolled: 5,
		dmgKept: 2,
		dmgFlat: 3,
		dmgType: "R",
		pen: 3,
		tearing: true,
		blast: false,
		scatter: false,
		powerField: false,
	},
	bolter: {
		atkRolled: 5,
		atkKept: 3,
		atkLevel: 0,
		atkMod: 0,
		dmgRolled: 6,
		dmgKept: 3,
		dmgFlat: 0,
		dmgType: "X",
		pen: 4,
		tearing: true,
		blast: false,
		scatter: false,
		powerField: false,
	},
	greatweapon: {
		atkRolled: 7,
		atkKept: 4,
		atkLevel: 0,
		atkMod: 0,
		dmgRolled: 7,
		dmgKept: 3,
		dmgFlat: 4,
		dmgType: "R",
		pen: 2,
		tearing: false,
		blast: false,
		scatter: false,
		powerField: false,
	},
	plasma: {
		atkRolled: 5,
		atkKept: 3,
		atkLevel: 0,
		atkMod: 0,
		dmgRolled: 8,
		dmgKept: 4,
		dmgFlat: 0,
		dmgType: "E",
		pen: 8,
		tearing: false,
		blast: false,
		scatter: false,
		powerField: false,
	},
};

// =========================================================================
// Colors
// =========================================================================

export const COLORS = {
	raw: "#f87171",
	penReduced: "#fbbf24",
	armorSoak: "#60a5fa",
	auraSoak: "#818cf8",
	resilConvert: "#4ade80",
	hpLost: "#d4a84b",
	hitProb: "#60a5fa",
	expDamage: "#f87171",
	coverSoak: "#22d3ee",
};

export const ARMOR_COMPARE_COLORS = ["#d4a84b", "#60a5fa", "#4ade80", "#f87171"];

// =========================================================================
// Simulation constants
// =========================================================================

export const TRIALS = 50_000;
export const DEBOUNCE_MS = 300;

// =========================================================================
// Types
// =========================================================================

export interface DefenderPreset {
	dex: number;
	wis: number;
	size: number;
	con: number;
	wil: number;
	composure: number;
	level: number;
	ap: number;
	weight: string;
	maxDex: number;
	aura: number;
	cover: number;
	halfling: boolean;
	dodge: number;
	parry: number;
}

export interface DefenderConfig extends DefenderPreset {
	sd: number;
	hp: number;
	resilience: number;
	mentalDef: number;
	locationAP: Record<string, number>;
}

export interface AttackerConfig {
	atkRolled: number;
	atkKept: number;
	atkLevel: number;
	atkMod: number;
	dmgRolled: number;
	dmgKept: number;
	dmgFlat: number;
	dmgType: string;
	pen: number;
	tearing: boolean;
	blast: boolean;
	scatter: boolean;
	powerField: boolean;
}

export interface SimulationResult {
	hitRate: number;
	avgHPLost: number;
	avgHPLostOnHit: number;
	avgRawDmgOnHit: number;
	medianRawDmg: number;
	hpDistribution: Record<number, number>;
	locationHits: Record<string, number>;
	hits: number;
	trials: number;
}

export interface PipelineResult {
	raw: number;
	effectiveAP: number;
	armorSoak: number;
	auraSoak: number;
	coverSoak: number;
	afterMitigation: number;
	hpLost: number;
	penApplied: number;
}

// =========================================================================
// Computation helpers
// =========================================================================

export function computePipeline(
	rawDmg: number,
	def: DefenderConfig,
	atk: AttackerConfig,
	locationAP?: number,
): PipelineResult {
	const ap = locationAP != null ? locationAP : def.ap;
	const effectiveAP = Math.max(0, ap - atk.pen);
	const penApplied = ap - effectiveAP;

	let armorAP = effectiveAP;
	if (atk.blast) armorAP = effectiveAP * 2;

	const coverAP = def.cover;

	let remaining = rawDmg;
	const armorSoak = Math.min(remaining, armorAP);
	remaining -= armorSoak;
	const coverSoak = Math.min(remaining, coverAP);
	remaining -= coverSoak;
	const auraSoak = Math.min(remaining, def.aura);
	remaining -= auraSoak;

	const afterMitigation = Math.max(0, remaining);
	let hpLost = def.resilience > 0 ? Math.floor(afterMitigation / def.resilience) : afterMitigation;
	if (atk.tearing && afterMitigation > 0 && hpLost < 1) hpLost = 1;

	return { raw: rawDmg, effectiveAP: armorAP, armorSoak, auraSoak, coverSoak, afterMitigation, hpLost, penApplied };
}

export function computeWeightedAP(def: DefenderConfig, pen: number): number {
	let total = 0;
	for (const [loc, info] of Object.entries(HIT_LOCATIONS)) {
		const locAP = def.locationAP[loc] || 0;
		const effAP = Math.max(0, locAP - pen);
		total += effAP * info.prob;
	}
	return total;
}

export function buildSimConfig(def: DefenderConfig, atk: AttackerConfig, sdOverride?: number) {
	return {
		cfg: {
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
		},
		trials: TRIALS,
	};
}
