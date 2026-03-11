import { signal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import { roll } from "@/lib/dtd/dice.ts";
import { type CritLogEntry, getShipStats, lookupCritical, signedNum } from "./constants";
import { mode, ship, shipData, updateShip } from "./ShipBuilderApp";

// =========================================================================
// Local signals for transient UI state
// =========================================================================

const initResult = signal<{ total: number; d10: number } | null>(null);
const critModifier = signal(0);

// =========================================================================
// Component
// =========================================================================

export function CombatSidebar() {
	const data = shipData.value;
	const currentShip = ship.value;

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);
	if (!hull) return null;

	const stats = getShipStats(currentShip, hull);
	const shield = data.shields.find((s) => s.id === currentShip.shieldId);
	const combat = currentShip.combat;

	// Initialize combat state if needed (first time entering sheet)
	if (combat.hullCurrent === 0 && combat.shieldCurrent === 0) {
		updateShip((s) => ({
			...s,
			combat: {
				...s.combat,
				hullCurrent: stats.hullHP,
				crewCurrent: stats.crew,
				shieldCurrent: shield ? shield.capacity : 0,
			},
		}));
	}

	// -----------------------------------------------------------------------
	// HP handlers
	// -----------------------------------------------------------------------

	const adjustHP = useCallback(
		(field: "shieldCurrent" | "hullCurrent" | "crewCurrent", delta: number, max: number) => {
			updateShip((s) => {
				const current = Math.max(0, Math.min(s.combat[field] + delta, max));
				return {
					...s,
					combat: { ...s.combat, [field]: current },
				};
			});
		},
		[],
	);

	const setHP = useCallback((field: "shieldCurrent" | "hullCurrent" | "crewCurrent", value: number) => {
		updateShip((s) => ({
			...s,
			combat: {
				...s.combat,
				[field]: Math.max(0, value),
			},
		}));
	}, []);

	// -----------------------------------------------------------------------
	// Shield regen
	// -----------------------------------------------------------------------

	const regenShields = useCallback(() => {
		if (!shield) return;
		updateShip((s) => {
			if (s.combat.shieldCurrent <= 0) return s;
			const effectiveRegen = Math.max(0, shield.regeneration - s.combat.disruption);
			const newShield = Math.min(s.combat.shieldCurrent + effectiveRegen, shield.capacity);
			return {
				...s,
				combat: { ...s.combat, shieldCurrent: newShield },
			};
		});
	}, [shield]);

	const handleDisruptionChange = useCallback((e: Event) => {
		const val = Number.parseInt((e.target as HTMLInputElement).value, 10) || 0;
		updateShip((s) => ({
			...s,
			combat: { ...s.combat, disruption: val },
		}));
	}, []);

	const resetDisruption = useCallback(() => {
		updateShip((s) => ({
			...s,
			combat: { ...s.combat, disruption: 0 },
		}));
	}, []);

	// -----------------------------------------------------------------------
	// Initiative
	// -----------------------------------------------------------------------

	const rollInitiative = useCallback(() => {
		const result = roll(1, 1, 0);
		const d10 = result.total;
		const total = stats.sensors + stats.acc + d10;
		initResult.value = { total, d10 };
	}, [stats]);

	// -----------------------------------------------------------------------
	// Departments
	// -----------------------------------------------------------------------

	const toggleDept = useCallback((dept: string, checked: boolean) => {
		updateShip((s) => ({
			...s,
			combat: {
				...s.combat,
				departments: {
					...s.combat.departments,
					[dept]: checked,
				},
			},
		}));
	}, []);

	const resetDepartments = useCallback(() => {
		updateShip((s) => ({
			...s,
			combat: {
				...s.combat,
				departments: {
					maneuver: false,
					tactical: false,
					engineering: false,
					command: false,
					arcana: false,
				},
			},
		}));
	}, []);

	// -----------------------------------------------------------------------
	// Turn counter
	// -----------------------------------------------------------------------

	const nextTurn = useCallback(() => {
		updateShip((s) => ({
			...s,
			combat: {
				...s.combat,
				turn: (s.combat.turn || 1) + 1,
				departments: {
					maneuver: false,
					tactical: false,
					engineering: false,
					command: false,
					arcana: false,
				},
			},
		}));
	}, []);

	const prevTurn = useCallback(() => {
		updateShip((s) => ({
			...s,
			combat: {
				...s.combat,
				turn: Math.max(1, (s.combat.turn || 1) - 1),
			},
		}));
	}, []);

	// -----------------------------------------------------------------------
	// Critical damage
	// -----------------------------------------------------------------------

	const rollCritical = useCallback(() => {
		if (!data) return;
		const result = roll(1, 1, 0);
		const d10 = result.total;
		const total = d10 + critModifier.value;
		const entry = lookupCritical(data, total);

		updateShip((s) => {
			const logEntry: CritLogEntry = {
				roll: d10,
				modifier: critModifier.value,
				total,
				name: entry.name,
				effect: entry.effect,
				turn: s.combat.turn,
			};
			return {
				...s,
				combat: {
					...s.combat,
					critLog: [...s.combat.critLog, logEntry],
				},
			};
		});
	}, [data]);

	// -----------------------------------------------------------------------
	// Mode switch
	// -----------------------------------------------------------------------

	const switchToBuilder = useCallback(() => {
		mode.value = "builder";
		updateShip((s) => ({ ...s, mode: "builder" }));
	}, []);

	// -----------------------------------------------------------------------
	// Render
	// -----------------------------------------------------------------------

	const shieldMax = shield ? shield.capacity : 0;
	const shieldRegen = shield ? shield.regeneration : 0;

	return (
		<aside class="no-print sticky top-[50px] h-[calc(100vh-50px)] overflow-y-auto p-lg bg-surface border-l border-border max-[900px]:static max-[900px]:h-auto max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:border-border">
			<h3 class="text-accent mb-md">Combat Tracker</h3>

			{/* Shield HP */}
			<div class="mb-md pb-md border-b border-border">
				<div class="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Shields</span>
					<span class="text-text-muted">{shield ? `${shield.type} Mk ${shield.mark}` : "None"}</span>
				</div>
				<div class="flex items-center gap-xs justify-center">
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("shieldCurrent", -5, shieldMax)}
					>
						−5
					</button>
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("shieldCurrent", -1, shieldMax)}
					>
						−1
					</button>
					<div class="flex items-center gap-0.5 text-[1.1rem] font-semibold">
						<input
							type="number"
							class="w-[50px] text-center text-base font-semibold p-0.5 bg-surface-raised border border-border text-text-primary"
							value={combat.shieldCurrent}
							min={0}
							onInput={(e) =>
								setHP("shieldCurrent", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
						/>
						<span class="text-text-dim">/</span>
						<span>{shieldMax}</span>
					</div>
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("shieldCurrent", 1, shieldMax)}
					>
						+1
					</button>
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("shieldCurrent", 5, shieldMax)}
					>
						+5
					</button>
				</div>
				<div class="flex items-center gap-sm mt-xs text-[0.8rem]">
					<span class="text-text-muted">Regen/turn:</span>
					<span>{shieldRegen}</span>
					<button type="button" class="btn btn-ghost btn-sm" onClick={regenShields}>
						Regenerate
					</button>
				</div>
				<div class="flex items-center gap-sm mt-xs text-[0.8rem]">
					<span class="text-text-muted">Disruption:</span>
					<input
						type="number"
						class="w-[60px] py-1 px-1.5 text-center text-[0.85rem]"
						value={combat.disruption}
						min={0}
						onInput={handleDisruptionChange}
					/>
					<button type="button" class="btn btn-ghost btn-sm" onClick={resetDisruption}>
						Reset
					</button>
				</div>
			</div>

			{/* Hull HP */}
			<div class="mb-md pb-md border-b border-border">
				<div class="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Hull Strength</span>
				</div>
				<div class="flex items-center gap-xs justify-center">
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("hullCurrent", -5, stats.hullHP)}
					>
						−5
					</button>
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("hullCurrent", -1, stats.hullHP)}
					>
						−1
					</button>
					<div class="flex items-center gap-0.5 text-[1.1rem] font-semibold">
						<input
							type="number"
							class="w-[50px] text-center text-base font-semibold p-0.5 bg-surface-raised border border-border text-text-primary"
							value={combat.hullCurrent}
							min={0}
							onInput={(e) =>
								setHP("hullCurrent", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
						/>
						<span class="text-text-dim">/</span>
						<span>{stats.hullHP}</span>
					</div>
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("hullCurrent", 1, stats.hullHP)}
					>
						+1
					</button>
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("hullCurrent", 5, stats.hullHP)}
					>
						+5
					</button>
				</div>
			</div>

			{/* Crew HP */}
			<div class="mb-md pb-md border-b border-border">
				<div class="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Crew</span>
				</div>
				<div class="flex items-center gap-xs justify-center">
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("crewCurrent", -1, stats.crew)}
					>
						−1
					</button>
					<div class="flex items-center gap-0.5 text-[1.1rem] font-semibold">
						<input
							type="number"
							class="w-[50px] text-center text-base font-semibold p-0.5 bg-surface-raised border border-border text-text-primary"
							value={combat.crewCurrent}
							min={0}
							onInput={(e) =>
								setHP("crewCurrent", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
						/>
						<span class="text-text-dim">/</span>
						<span>{stats.crew}</span>
					</div>
					<button
						type="button"
						class="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("crewCurrent", 1, stats.crew)}
					>
						+1
					</button>
				</div>
			</div>

			{/* Initiative */}
			<div class="mb-md pb-md border-b border-border">
				<div class="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Initiative</span>
				</div>
				<div class="flex items-center justify-between gap-sm">
					<span class="text-text-muted">
						Sensors({signedNum(stats.sensors)}) + Acc(
						{signedNum(stats.acc)}) + 1d10
					</span>
					<button type="button" class="btn btn-primary btn-sm" onClick={rollInitiative}>
						Roll Initiative
					</button>
				</div>
				{initResult.value && (
					<div class="text-center text-2xl font-bold p-sm">
						<span class="text-accent">
							{initResult.value.total} (d10: {initResult.value.d10})
						</span>
					</div>
				)}
			</div>

			{/* TN to Hit */}
			<div class="mb-md pb-md border-b border-border">
				<div class="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>TN to Hit</span>
				</div>
				<div class="flex items-center gap-md">
					<span class="text-2xl font-bold text-accent">{stats.tn}</span>
					<span class="text-text-muted">
						3 × {stats.cq} + {signedNum(stats.man)}
					</span>
				</div>
			</div>

			{/* Department Actions */}
			<div class="mb-md pb-md border-b border-border">
				<div class="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Department Actions</span>
					<button type="button" class="btn btn-ghost btn-sm" onClick={resetDepartments}>
						Reset
					</button>
				</div>
				<div class="flex flex-col gap-xs">
					{(["maneuver", "tactical", "engineering", "command", "arcana"] as const).map((dept) => (
						<label key={dept} class="flex items-center gap-sm text-[0.85rem] cursor-pointer">
							<input
								type="checkbox"
								checked={combat.departments[dept] || false}
								onChange={(e) => toggleDept(dept, (e.target as HTMLInputElement).checked)}
							/>{" "}
							{dept.charAt(0).toUpperCase() + dept.slice(1)}
						</label>
					))}
				</div>
			</div>

			{/* Turn Counter */}
			<div class="mb-md pb-md border-b border-border">
				<div class="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Turn</span>
				</div>
				<div class="flex items-center justify-center gap-md">
					<button type="button" class="btn btn-ghost btn-sm" onClick={prevTurn}>
						←
					</button>
					<span class="text-2xl font-bold text-accent min-w-10 text-center">{combat.turn || 1}</span>
					<button type="button" class="btn btn-primary btn-sm" onClick={nextTurn}>
						Next Turn →
					</button>
				</div>
			</div>

			{/* Critical Damage */}
			<div class="mb-md pb-md border-b border-border">
				<div class="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Critical Damage</span>
				</div>
				<div class="flex flex-wrap gap-sm items-end mb-sm">
					<div class="mb-sm">
						<label for="crit-modifier" class="text-[0.8rem]">
							Weapon Crit Rating
						</label>
						<input
							type="number"
							id="crit-modifier"
							class="w-[60px] py-1 px-1.5 text-center text-[0.85rem]"
							value={critModifier.value}
							onInput={(e) => {
								critModifier.value = Number.parseInt((e.target as HTMLInputElement).value, 10) || 0;
							}}
						/>
					</div>
					<button type="button" class="btn btn-secondary btn-sm" onClick={rollCritical}>
						Roll Critical
					</button>
				</div>
				<div class="max-h-[200px] overflow-y-auto">
					{combat.critLog.length === 0 ? (
						<span class="text-text-muted text-[0.8rem]">No critical hits yet</span>
					) : (
						combat.critLog.map((entry, i) => (
							<div
								key={i}
								class="px-sm py-xs mb-xs bg-surface-raised border-l-[3px] border-error rounded-r-sm text-[0.8rem]"
							>
								<div class="text-text-dim text-[0.7rem]">
									Turn {entry.turn} — Roll: {entry.roll} + {entry.modifier} = {entry.total}
								</div>
								<div class="font-semibold text-error">{entry.name}</div>
								<div class="text-text-muted">{entry.effect}</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Back to Builder */}
			<div class="mb-md pb-md last:border-b-0">
				<button type="button" class="btn btn-secondary w-full" onClick={switchToBuilder}>
					← Back to Builder
				</button>
			</div>
		</aside>
	);
}
