// =========================================================================
// Ship Builder — Types, constants, and pure helper functions
// =========================================================================

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface Hull {
	id: string;
	name: string;
	class: string;
	cost: number;
	crew: number;
	hullStrength: number;
	maneuverability: number;
	acceleration: number;
	speed: number;
	sensors: number;
	consoles: Record<string, number>;
	weapons: { forward: number; rear: number };
}

export interface ShipConsole {
	id: string;
	name: string;
	type: string;
	cost: number;
	effect: string;
}

export interface ShipWeapon {
	id: string;
	name: string;
	size: string;
	material: string;
	damage: string;
	disruption: number;
	accuracy: number;
	crit: number;
	range: number;
	cost: number;
	arc: string;
	type: string;
}

export interface Torpedo {
	id: string;
	name: string;
	damage: string;
	disruption: number;
	accuracy: number;
	crit: number;
	arc: string;
	range: number;
	cost: number;
	effect: string;
}

export interface Shield {
	id: string;
	name: string;
	type: string;
	mark: number;
	capacity: number;
	regeneration: number;
	special: string;
	cost: number;
	layers?: number;
}

export interface CritEntry {
	roll: string;
	name: string;
	effect: string;
}

export interface ShipData {
	holdingsBP: number[];
	crewQualityCost: Record<string, number>;
	hulls: Hull[];
	consoles: ShipConsole[];
	weapons: ShipWeapon[];
	torpedoTubeCost: number;
	torpedoes: Torpedo[];
	shields: Shield[];
	criticalDamage: CritEntry[];
}

export interface CombatState {
	shieldCurrent: number;
	hullCurrent: number;
	crewCurrent: number;
	disruption: number;
	turn: number;
	critLog: CritLogEntry[];
	departments: Record<string, boolean>;
	consoleStatus: Record<string, boolean>;
	weaponStatus: Record<string, boolean>;
}

export interface CritLogEntry {
	roll: number;
	modifier: number;
	total: number;
	name: string;
	effect: string;
	turn: number;
}

export interface ShipState {
	id: string;
	name: string;
	hullId: string;
	consoles: Record<string, string>;
	weapons: { forward: string[]; rear: string[] };
	weaponPartials: Record<string, string>;
	hasTorpedoTube: boolean;
	torpedoes: string[];
	shieldId: string;
	crewQuality: number;
	holdings: number;
	customBP: boolean;
	customBPValue: number;
	officers: Record<string, { name: string; skill: number }>;
	mode: "builder" | "sheet";
	combat: CombatState;
}

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

export const STORAGE_PREFIX = "dtd_ship_";
export const STORAGE_LIST_KEY = "dtd_ship_list";
export const AUTOSAVE_DELAY = 400;

export const CONSOLE_TYPES = ["arcana", "command", "engineering", "tactical", "universal"] as const;

export const CONSOLE_LABELS: Record<string, string> = {
	arcana: "Arcana",
	command: "Command",
	engineering: "Engineering",
	tactical: "Tactical",
	universal: "Universal",
};

export const OFFICER_POSITIONS = [
	{ id: "helmsman", title: "Helmsman", skill: "Pilot" },
	{ id: "tactical", title: "Tactical Officer", skill: "Ballistics" },
	{ id: "engineer", title: "Chief Engineer", skill: "Tech-Use" },
	{ id: "captain", title: "Captain", skill: "Command" },
	{ id: "arcana", title: "Chief Arcana Officer", skill: "Arcana" },
] as const;

export const WEAPON_SIZES = ["Light Cannon", "Heavy Cannon", "Light Beam", "Heavy Beam", "Turret"];

export const WEAPON_MATERIALS = ["Las", "Melta", "Plasma", "Orgone", "Mass Driver", "Positron", "Anti-Meson"];

export const HULL_CLASSES = ["Escort", "Destroyer", "Cruiser", "Battleship"];

export const SHIELD_TYPES = ["Standard", "Covariant", "Regenerative", "Resilient", "Multiphasic"];

// -------------------------------------------------------------------------
// Helper functions
// -------------------------------------------------------------------------

export function generateId(): string {
	return `ship_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`;
}

export function createDefaultShip(): ShipState {
	return {
		id: generateId(),
		name: "",
		hullId: "",
		consoles: {},
		weapons: { forward: [], rear: [] },
		weaponPartials: {},
		hasTorpedoTube: false,
		torpedoes: ["", "", "", "", ""],
		shieldId: "",
		crewQuality: 2,
		holdings: 0,
		customBP: false,
		customBPValue: 0,
		officers: {
			helmsman: { name: "", skill: 0 },
			tactical: { name: "", skill: 0 },
			engineer: { name: "", skill: 0 },
			captain: { name: "", skill: 0 },
			arcana: { name: "", skill: 0 },
		},
		mode: "builder",
		combat: {
			shieldCurrent: 0,
			hullCurrent: 0,
			crewCurrent: 0,
			disruption: 0,
			turn: 1,
			critLog: [],
			departments: {
				maneuver: false,
				tactical: false,
				engineering: false,
				command: false,
				arcana: false,
			},
			consoleStatus: {},
			weaponStatus: {},
		},
	};
}

// -------------------------------------------------------------------------
// Console / slot helpers
// -------------------------------------------------------------------------

export function getConsoleOptions(data: ShipData, slotType: string): ShipConsole[] {
	if (slotType === "universal") return data.consoles;
	return data.consoles.filter((c) => c.type === slotType || c.type === "universal");
}

export function getInstalledConsoleIds(ship: ShipState): string[] {
	return Object.values(ship.consoles).filter(Boolean);
}

function hasConsole(ship: ShipState, consoleId: string): boolean {
	return getInstalledConsoleIds(ship).includes(consoleId);
}

// -------------------------------------------------------------------------
// Console bonus helpers
// -------------------------------------------------------------------------

function getManBonus(ship: ShipState): number {
	return hasConsole(ship, "thrust-vectoring") ? 5 : 0;
}

function getSensorBonus(ship: ShipState): number {
	return hasConsole(ship, "enhanced-sensors") ? 5 : 0;
}

function getAccBonus(ship: ShipState): number {
	return hasConsole(ship, "large-engine") ? 5 : 0;
}

function getSpeedBonus(ship: ShipState): number {
	return hasConsole(ship, "large-engine") ? 2 : 0;
}

function getCrewBonus(ship: ShipState): number {
	return getInstalledConsoleIds(ship).filter((id) => id === "rating-quarters").length * 2;
}

function getEffectiveHullStrength(ship: ShipState, hull: Hull): number {
	const base = hull.hullStrength;
	const hardenedCount = getInstalledConsoleIds(ship).filter((id) => id === "hardened-armor").length;
	return Math.floor(base * (1 + hardenedCount * 0.1));
}

// -------------------------------------------------------------------------
// Computed ship stats
// -------------------------------------------------------------------------

interface ShipStats {
	man: number;
	sensors: number;
	acc: number;
	speed: number;
	hullHP: number;
	crew: number;
	tn: number;
	cq: number;
}

export function getShipStats(ship: ShipState, hull: Hull): ShipStats {
	const cq = ship.crewQuality;
	const man = hull.maneuverability + getManBonus(ship);
	const sensors = hull.sensors + getSensorBonus(ship);
	const acc = hull.acceleration + getAccBonus(ship);
	const speed = hull.speed + getSpeedBonus(ship);
	const hullHP = getEffectiveHullStrength(ship, hull);
	const crew = hull.crew + getCrewBonus(ship);
	const tn = 3 * cq + man;
	return { man, sensors, acc, speed, hullHP, crew, tn, cq };
}

// -------------------------------------------------------------------------
// Budget calculation
// -------------------------------------------------------------------------

interface BPBreakdown {
	hull: number;
	consoles: number;
	weapons: number;
	torpedoes: number;
	shields: number;
	crew: number;
}

export function calculateBPSpent(ship: ShipState, data: ShipData): BPBreakdown {
	const breakdown: BPBreakdown = {
		hull: 0,
		consoles: 0,
		weapons: 0,
		torpedoes: 0,
		shields: 0,
		crew: 0,
	};

	// Hull
	const hull = data.hulls.find((h) => h.id === ship.hullId);
	if (hull) breakdown.hull = hull.cost;

	// Consoles
	for (const consoleId of getInstalledConsoleIds(ship)) {
		const c = data.consoles.find((x) => x.id === consoleId);
		if (c) breakdown.consoles += c.cost;
	}

	// Weapons
	for (const pos of ["forward", "rear"] as const) {
		for (const wid of ship.weapons[pos] || []) {
			if (!wid) continue;
			const w = data.weapons.find((x) => x.id === wid);
			if (w) breakdown.weapons += w.cost;
		}
	}

	// Torpedo tube + torpedoes
	if (ship.hasTorpedoTube) {
		breakdown.torpedoes += data.torpedoTubeCost;
		for (const tid of ship.torpedoes || []) {
			if (!tid) continue;
			const t = data.torpedoes.find((x) => x.id === tid);
			if (t) breakdown.torpedoes += t.cost;
		}
	}

	// Shields
	const shield = data.shields.find((s) => s.id === ship.shieldId);
	if (shield) breakdown.shields = shield.cost;

	// Crew quality
	breakdown.crew = data.crewQualityCost[String(ship.crewQuality)] || 0;

	return breakdown;
}

export function getBPBudget(ship: ShipState, data: ShipData): number {
	if (ship.customBP) return ship.customBPValue;
	return data.holdingsBP[ship.holdings] || 0;
}

// -------------------------------------------------------------------------
// Critical damage lookup
// -------------------------------------------------------------------------

export function lookupCritical(data: ShipData, total: number): CritEntry {
	const table = data.criticalDamage;
	if (total < 1) return table[0];
	if (total >= 13) return table[table.length - 1];
	return table.find((e) => e.roll === String(total)) || table[0];
}

// -------------------------------------------------------------------------
// Formatting helpers
// -------------------------------------------------------------------------

export function signedNum(n: number): string {
	return n >= 0 ? `+${n}` : String(n);
}
