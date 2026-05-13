// =========================================================================
// Combat Tracker — Types, constants, and helpers
// =========================================================================

export interface Combatant {
	actionBudget: ActionBudget;
	composure: number;
	conditions: CombatantCondition[];
	dexterity: number;
	heroPoint: boolean;
	hpCurrent: number;
	hpMax: number;
	id: string;
	imported: boolean;
	importedData: unknown;
	initiativeRoll: number | null;
	initiativeTotal: number | null;
	isNpc: boolean;
	modifier: number;
	name: string;
	notes: string;
	resilience: number;
	resourceCurrent: number;
	resourceLabel: string;
	resourceMax: number;
	sd: number;
	surprised: boolean;
	willpower: number;
}

export interface CombatantCondition {
	conditionId: string;
	level?: number;
}

interface ActionBudget {
	fullAction: boolean;
	half1: boolean;
	half2: boolean;
	reaction: boolean;
}

export interface EncounterState {
	activeTurnIndex: number;
	combatants: Combatant[];
	encounterId: string | null;
	encounterStarted: boolean;
	round: number;
}

interface ConditionDef {
	effect: string;
	id: string;
	leveled: boolean;
	name: string;
}

export interface ActionDef {
	desc: string;
	name: string;
	note?: string;
	type: "H" | "F" | "R" | "Fr";
}

interface HitLocationDef {
	location: string;
	roll: number;
}

interface SituationalModifier {
	effect: string;
	name: string;
}

// =========================================================================
// Data arrays
// =========================================================================

export const CONDITIONS: ConditionDef[] = [
	{
		id: "amputation",
		name: "Amputation",
		effect: "Lose a limb permanently",
		leveled: false,
	},
	{
		id: "blinded",
		name: "Blinded",
		effect: "-4k0 to physical Tests requiring sight",
		leveled: false,
	},
	{
		id: "bloodLoss",
		name: "Blood Loss",
		effect: "Con Test each round or take damage equal to level",
		leveled: true,
	},
	{
		id: "burning",
		name: "Burning",
		effect: "1d10 Energy damage per round",
		leveled: false,
	},
	{
		id: "crippledArm",
		name: "Crippled (Arm)",
		effect: "Cannot use that arm",
		leveled: false,
	},
	{
		id: "crippledLeg",
		name: "Crippled (Leg)",
		effect: "Move at half speed, -2k0 to movement Tests",
		leveled: false,
	},
	{
		id: "dazzled",
		name: "Dazzled",
		effect: "-1k0 sight Tests, -2k0 if directly looking at source",
		leveled: false,
	},
	{
		id: "deafened",
		name: "Deafened",
		effect: "-2k0 to hearing-based Tests",
		leveled: false,
	},
	{
		id: "fatigue",
		name: "Fatigue",
		effect: "-1k0 per level to all Tests",
		leveled: true,
	},
	{
		id: "frightened",
		name: "Frightened",
		effect: "Must flee or suffer -2k0 to all Tests",
		leveled: false,
	},
	{
		id: "helpless",
		name: "Helpless",
		effect: "Auto-hit in melee, double damage from melee",
		leveled: false,
	},
	{
		id: "pinned",
		name: "Pinned",
		effect: "Cannot move or take actions except to break free",
		leveled: false,
	},
	{
		id: "prone",
		name: "Prone",
		effect: "+2k0 melee attacks against, -2k0 ranged against, -2k0 own attacks",
		leveled: false,
	},
	{
		id: "stunned",
		name: "Stunned",
		effect: "No Reactions, half move only",
		leveled: false,
	},
	{
		id: "toxic",
		name: "Toxic",
		effect: "Take damage equal to level each round",
		leveled: true,
	},
];

export const ACTIONS: ActionDef[] = [
	// Half Actions
	{
		name: "Aim",
		type: "H",
		desc: "+1k0 to next attack (cumulative to +3k0 for Full Aim)",
	},
	{ name: "Brace", type: "H", desc: "Brace a heavy weapon for firing" },
	{
		name: "Called Shot",
		type: "H",
		desc: "Attack a specific location at -2k0",
	},
	{
		name: "Cast Spell",
		type: "H",
		desc: "Cast a spell with casting time of Half Action",
	},
	{
		name: "Delay",
		type: "H",
		desc: "Hold your turn to act later in initiative",
	},
	{
		name: "Disengage",
		type: "H",
		desc: "Move safely out of melee without provoking",
	},
	{ name: "Draw/Holster", type: "H", desc: "Ready or put away a weapon" },
	{ name: "Feint", type: "H", desc: "Opposed Deceive vs Scrutiny to deny SD" },
	{
		name: "Focus Power",
		type: "H",
		desc: "Activate a psychic/exaltation power",
	},
	{
		name: "Grapple",
		type: "H",
		desc: "Attempt to grab opponent (opposed Weaponry Test)",
	},
	{
		name: "Guarded Attack",
		type: "H",
		desc: "Attack at -1k0, gain +2 SD until next turn",
	},
	{
		name: "Knock Down",
		type: "H",
		desc: "Opposed Strength Test to knock Prone",
	},
	{ name: "Maneuver", type: "H", desc: "Move up to your Speed in meters" },
	{
		name: "Overwatch",
		type: "H",
		desc: "Wait to shoot anyone entering a kill zone",
	},
	{
		name: "Ready",
		type: "H",
		desc: "Prepare an action triggered by a condition",
	},
	{ name: "Reload", type: "H", desc: "Reload a ranged weapon" },
	{
		name: "Stand/Mount",
		type: "H",
		desc: "Stand from Prone or mount/dismount a vehicle",
	},
	{
		name: "Standard Attack",
		type: "H",
		desc: "Make one melee or ranged attack",
	},
	{
		name: "Tactical Advance",
		type: "H",
		desc: "Move from cover to cover without losing cover bonus",
	},
	{
		name: "Use Skill",
		type: "H",
		desc: "Perform a Skill Test as a Half Action",
	},
	// Full Actions
	{
		name: "All-Out Attack",
		type: "F",
		desc: "+2k0 to attack, cannot Dodge/Parry until next turn",
	},
	{
		name: "Charge",
		type: "F",
		desc: "Move up to 2\u00d7 Speed and attack at +1k0",
	},
	{
		name: "Coup de Grace",
		type: "F",
		desc: "Instantly kill a Helpless target",
	},
	{
		name: "Full Auto",
		type: "F",
		desc: "Fire in full auto, hit once +1 per 2 Raises",
	},
	{
		name: "Full Aim",
		type: "F",
		desc: "+2k0 (+3k0 with scope) to next attack",
	},
	{
		name: "Lightning Attack",
		type: "F",
		desc: "Make multiple melee attacks (requires feat)",
	},
	{
		name: "Run",
		type: "F",
		desc: "Move up to 3\u00d7 Speed, -2k0 to attacks against you",
	},
	{
		name: "Semi-Auto Burst",
		type: "F",
		desc: "Fire semi-auto, hit +1 per 2 Raises",
	},
	{
		name: "Stunt",
		type: "F",
		desc: "Perform a dramatic combat maneuver (SM adjudicated)",
	},
	{
		name: "Swift Attack",
		type: "F",
		desc: "Make two melee attacks (requires feat)",
	},
	{
		name: "Total Defense",
		type: "F",
		desc: "+4k0 to all Parry/Dodge until next turn, cannot attack",
	},
	// Reactions
	{
		name: "Dodge",
		type: "R",
		desc: "Roll Dexterity + Acrobatics vs attacker's roll to avoid",
	},
	{
		name: "Parry",
		type: "R",
		desc: "Roll Weaponry Test vs attacker's roll to deflect",
	},
	// Free Actions
	{ name: "Drop Prone", type: "Fr", desc: "Fall Prone immediately" },
	{ name: "Speak", type: "Fr", desc: "Say a few words" },
];

export const HIT_LOCATIONS: HitLocationDef[] = [
	{ roll: 1, location: "Head" },
	{ roll: 2, location: "Left Arm" },
	{ roll: 3, location: "Right Arm" },
	{ roll: 4, location: "Left Arm" },
	{ roll: 5, location: "Body" },
	{ roll: 6, location: "Body" },
	{ roll: 7, location: "Body" },
	{ roll: 8, location: "Right Leg" },
	{ roll: 9, location: "Left Leg" },
	{ roll: 10, location: "Right Leg" },
];

export const SITUATIONAL_MODIFIERS: SituationalModifier[] = [
	{ name: "Combat Advantage", effect: "+1k0 to attack" },
	{ name: "Higher Ground", effect: "+1k0 to melee attacks" },
	{ name: "Ganging Up", effect: "+1k0 per ally in melee (max +3k0)" },
	{ name: "Off-Hand Attack", effect: "-2k0 to attack with off hand" },
	{
		name: "Two-Weapon Fighting",
		effect: "-2k0 to both attacks (negate with Ambidextrous or feat)",
	},
	{ name: "Cover (Light)", effect: "AP 4 against ranged attacks" },
	{ name: "Cover (Heavy)", effect: "AP 8 against ranged attacks" },
	{ name: "Concealment", effect: "Attacker suffers -1k0" },
	{ name: "Darkness", effect: "-2k0 to sight-based Tests" },
	{ name: "Point Blank (\u22642m)", effect: "+2k0 to ranged attacks" },
	{ name: "Short Range", effect: "Normal (no modifier)" },
	{ name: "Long Range", effect: "-2k0 to ranged attacks" },
	{ name: "Extreme Range", effect: "-4k0 to ranged attacks" },
];

// =========================================================================
// Storage keys
// =========================================================================

export const ENCOUNTER_PREFIX = "dtd_encounter_";
export const ENCOUNTER_LIST_KEY = "dtd_encounter_list";
export const AUTOSAVE_DELAY = 500;

// =========================================================================
// Helpers
// =========================================================================

export function genId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function createCombatant(data: Partial<Combatant>): Combatant {
	return {
		id: genId(),
		name: data.name || "Unknown",
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
		resourceLabel: data.resourceLabel || "",
		conditions: [],
		actionBudget: {
			half1: false,
			half2: false,
			fullAction: false,
			reaction: false,
		},
		notes: data.notes || "",
		imported: !!data.imported,
		importedData: data.importedData || null,
		isNpc: !!data.isNpc,
	};
}

export function getWoundStatus(c: Combatant): string {
	if (c.hpCurrent <= 0) return "down";
	const lost = c.hpMax - c.hpCurrent;
	if (lost === 0) return "healthy";
	if (lost <= c.willpower) return "light";
	if (lost <= c.hpMax) return "heavy";
	return "critical";
}

export function calculateDamage(raw: number, ap: number, pen: number, resilience: number): number {
	const effectiveAP = Math.max(0, ap - pen);
	const afterArmor = Math.max(0, raw - effectiveAP);
	return Math.ceil(afterArmor / Math.max(1, resilience));
}

export function defaultEncounterState(): EncounterState {
	return {
		combatants: [],
		round: 0,
		activeTurnIndex: -1,
		encounterStarted: false,
		encounterId: null,
	};
}
