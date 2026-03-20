// =========================================================================
// Ship Builder — Types, constants, and pure helper functions
// =========================================================================

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface Hull {
	acceleration: number;
	class: string;
	consoles: Record<string, number>;
	cost: number;
	crew: number;
	hullStrength: number;
	id: string;
	maneuverability: number;
	name: string;
	sensors: number;
	speed: number;
	weapons: { forward: number; rear: number };
}

export interface ShipConsole {
	cost: number;
	effect: string;
	id: string;
	name: string;
	type: string;
}

export interface ShipWeapon {
	accuracy: number;
	arc: string;
	cost: number;
	crit: number;
	damage: string;
	disruption: number;
	id: string;
	material: string;
	name: string;
	range: number;
	size: string;
	type: string;
}

export interface Torpedo {
	accuracy: number;
	arc: string;
	cost: number;
	crit: number;
	damage: string;
	disruption: number;
	effect: string;
	id: string;
	name: string;
	range: number;
}

export interface Shield {
	capacity: number;
	cost: number;
	id: string;
	layers?: number;
	mark: number;
	name: string;
	regeneration: number;
	special: string;
	type: string;
}

export interface CritEntry {
	effect: string;
	name: string;
	roll: string;
}

export interface ShipData {
	consoles: ShipConsole[];
	crewQualityCost: Record<string, number>;
	criticalDamage: CritEntry[];
	holdingsBP: number[];
	hulls: Hull[];
	shields: Shield[];
	torpedoes: Torpedo[];
	torpedoTubeCost: number;
	weapons: ShipWeapon[];
}

export interface CombatState {
	consoleStatus: Record<string, boolean>;
	crewCurrent: number;
	critLog: CritLogEntry[];
	departments: Record<string, boolean>;
	disruption: number;
	hullCurrent: number;
	shieldCurrent: number;
	turn: number;
	weaponStatus: Record<string, boolean>;
}

export interface CritLogEntry {
	effect: string;
	modifier: number;
	name: string;
	roll: number;
	total: number;
	turn: number;
}

export interface ShipState {
	combat: CombatState;
	consoles: Record<string, string>;
	crewQuality: number;
	customBP: boolean;
	customBPValue: number;
	hasTorpedoTube: boolean;
	holdings: number;
	hullId: string;
	id: string;
	mode: "builder" | "sheet";
	name: string;
	officers: Record<string, { name: string; skill: number }>;
	shieldId: string;
	torpedoes: string[];
	weaponPartials: Record<string, string>;
	weapons: { forward: string[]; rear: string[] };
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
	acc: number;
	cq: number;
	crew: number;
	hullHP: number;
	man: number;
	sensors: number;
	speed: number;
	tn: number;
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
	consoles: number;
	crew: number;
	hull: number;
	shields: number;
	torpedoes: number;
	weapons: number;
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
	if (total >= 13) return table.at(-1);
	return table.find((e) => e.roll === String(total)) || table[0];
}

// -------------------------------------------------------------------------
// Formatting helpers
// -------------------------------------------------------------------------

export function signedNum(n: number): string {
	return n >= 0 ? `+${n}` : String(n);
}
