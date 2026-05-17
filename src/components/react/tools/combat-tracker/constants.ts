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

export interface ConditionDef {
	effect: string;
	id: string;
	leveled: boolean;
	name: string;
}

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

export function defaultEncounterState(): EncounterState {
	return {
		combatants: [],
		round: 0,
		activeTurnIndex: -1,
		encounterStarted: false,
		encounterId: null,
	};
}
