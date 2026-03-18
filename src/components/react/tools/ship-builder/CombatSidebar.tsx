import { useCallback, useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import { roll } from "@/lib/dtd/dice.ts";
import { type CritLogEntry, getShipStats, lookupCritical, signedNum } from "./constants";
import { useShipStore } from "./store";

// =========================================================================
// Component
// =========================================================================

export function CombatSidebar() {
	const { shipData, ship, updateShip } = useShipStore();
	const [initResult, setInitResult] = useState<{ total: number; d10: number } | null>(null);
	const [critModifier, setCritModifier] = useState(0);

	const data = shipData;
	const currentShip = ship;

	// Derived values — may be null/undefined before data loads.
	// Computed here so hooks (which must precede early returns) can close over them.
	const hull = data?.hulls.find((h) => h.id === currentShip.hullId);
	const stats = hull ? getShipStats(currentShip, hull) : null;
	const shield = data?.shields.find((s) => s.id === currentShip.shieldId);

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
		[updateShip],
	);

	const setHP = useCallback(
		(field: "shieldCurrent" | "hullCurrent" | "crewCurrent", value: number) => {
			updateShip((s) => ({
				...s,
				combat: {
					...s.combat,
					[field]: Math.max(0, value),
				},
			}));
		},
		[updateShip],
	);

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
	}, [shield, updateShip]);

	const handleDisruptionChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			const val = Number.parseInt((e.target as HTMLInputElement).value, 10) || 0;
			updateShip((s) => ({
				...s,
				combat: { ...s.combat, disruption: val },
			}));
		},
		[updateShip],
	);

	const resetDisruption = useCallback(() => {
		updateShip((s) => ({
			...s,
			combat: { ...s.combat, disruption: 0 },
		}));
	}, [updateShip]);

	// -----------------------------------------------------------------------
	// Initiative
	// -----------------------------------------------------------------------

	const rollInitiative = useCallback(() => {
		if (!stats) return;
		const result = roll(1, 1, 0);
		const d10 = result.total;
		const total = stats.sensors + stats.acc + d10;
		setInitResult({ total, d10 });
	}, [stats]);

	// -----------------------------------------------------------------------
	// Departments
	// -----------------------------------------------------------------------

	const toggleDept = useCallback(
		(dept: string, checked: boolean) => {
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
		},
		[updateShip],
	);

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
	}, [updateShip]);

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
	}, [updateShip]);

	const prevTurn = useCallback(() => {
		updateShip((s) => ({
			...s,
			combat: {
				...s.combat,
				turn: Math.max(1, (s.combat.turn || 1) - 1),
			},
		}));
	}, [updateShip]);

	// -----------------------------------------------------------------------
	// Critical damage
	// -----------------------------------------------------------------------

	const rollCritical = useCallback(() => {
		if (!data) return;
		const result = roll(1, 1, 0);
		const d10 = result.total;
		const total = d10 + critModifier;
		const entry = lookupCritical(data, total);

		updateShip((s) => {
			const logEntry: CritLogEntry = {
				roll: d10,
				modifier: critModifier,
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
	}, [data, critModifier, updateShip]);

	// -----------------------------------------------------------------------
	// Mode switch
	// -----------------------------------------------------------------------

	const switchToBuilder = useCallback(() => {
		useShipStore.getState().setMode("builder");
		updateShip((s) => ({ ...s, mode: "builder" }));
	}, [updateShip]);

	// -----------------------------------------------------------------------
	// Early returns (after all hooks)
	// -----------------------------------------------------------------------

	if (!data || !hull || !stats) return null;

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
	// Render
	// -----------------------------------------------------------------------

	const shieldMax = shield ? shield.capacity : 0;
	const shieldRegen = shield ? shield.regeneration : 0;

	return (
		<aside className="no-print sticky top-[50px] h-[calc(100vh-50px)] overflow-y-auto p-lg bg-surface border-l border-border max-[900px]:static max-[900px]:h-auto max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:border-border">
			<h3 className="text-accent mb-md">Combat Tracker</h3>

			{/* Shield HP */}
			<div className="mb-md pb-md border-b border-border">
				<div className="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Shields</span>
					<span className="text-text-muted">{shield ? `${shield.type} Mk ${shield.mark}` : "None"}</span>
				</div>
				<div className="flex items-center gap-xs justify-center">
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("shieldCurrent", -5, shieldMax)}
					>
						−5
					</button>
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("shieldCurrent", -1, shieldMax)}
					>
						−1
					</button>
					<div className="flex items-center gap-0.5 text-[1.1rem] font-semibold">
						<GameInput
							type="number"
							className="w-[50px]"
							value={combat.shieldCurrent}
							min={0}
							onInput={(e) =>
								setHP("shieldCurrent", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
						/>
						<span className="text-text-dim">/</span>
						<span>{shieldMax}</span>
					</div>
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("shieldCurrent", 1, shieldMax)}
					>
						+1
					</button>
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("shieldCurrent", 5, shieldMax)}
					>
						+5
					</button>
				</div>
				<div className="flex items-center gap-sm mt-xs text-[0.8rem]">
					<span className="text-text-muted">Regen/turn:</span>
					<span>{shieldRegen}</span>
					<Button variant="ghost" size="sm" onClick={regenShields}>
						Regenerate
					</Button>
				</div>
				<div className="flex items-center gap-sm mt-xs text-[0.8rem]">
					<span className="text-text-muted">Disruption:</span>
					<GameInput
						type="number"
						className="w-[60px]"
						value={combat.disruption}
						min={0}
						onInput={handleDisruptionChange}
					/>
					<Button variant="ghost" size="sm" onClick={resetDisruption}>
						Reset
					</Button>
				</div>
			</div>

			{/* Hull HP */}
			<div className="mb-md pb-md border-b border-border">
				<div className="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Hull Strength</span>
				</div>
				<div className="flex items-center gap-xs justify-center">
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("hullCurrent", -5, stats.hullHP)}
					>
						−5
					</button>
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("hullCurrent", -1, stats.hullHP)}
					>
						−1
					</button>
					<div className="flex items-center gap-0.5 text-[1.1rem] font-semibold">
						<GameInput
							type="number"
							className="w-[50px]"
							value={combat.hullCurrent}
							min={0}
							onInput={(e) =>
								setHP("hullCurrent", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
						/>
						<span className="text-text-dim">/</span>
						<span>{stats.hullHP}</span>
					</div>
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("hullCurrent", 1, stats.hullHP)}
					>
						+1
					</button>
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("hullCurrent", 5, stats.hullHP)}
					>
						+5
					</button>
				</div>
			</div>

			{/* Crew HP */}
			<div className="mb-md pb-md border-b border-border">
				<div className="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Crew</span>
				</div>
				<div className="flex items-center gap-xs justify-center">
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("crewCurrent", -1, stats.crew)}
					>
						−1
					</button>
					<div className="flex items-center gap-0.5 text-[1.1rem] font-semibold">
						<GameInput
							type="number"
							className="w-[50px]"
							value={combat.crewCurrent}
							min={0}
							onInput={(e) =>
								setHP("crewCurrent", Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
							}
						/>
						<span className="text-text-dim">/</span>
						<span>{stats.crew}</span>
					</div>
					<button
						type="button"
						className="py-1 px-2 bg-surface-raised border border-border rounded-sm text-text-primary cursor-pointer text-[0.8rem] transition-all duration-150 hover:border-accent hover:text-accent"
						onClick={() => adjustHP("crewCurrent", 1, stats.crew)}
					>
						+1
					</button>
				</div>
			</div>

			{/* Initiative */}
			<div className="mb-md pb-md border-b border-border">
				<div className="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Initiative</span>
				</div>
				<div className="flex items-center justify-between gap-sm">
					<span className="text-text-muted">
						Sensors({signedNum(stats.sensors)}) + Acc(
						{signedNum(stats.acc)}) + 1d10
					</span>
					<Button variant="primary" size="sm" onClick={rollInitiative}>
						Roll Initiative
					</Button>
				</div>
				{initResult && (
					<div className="text-center text-2xl font-bold p-sm">
						<span className="text-accent">
							{initResult.total} (d10: {initResult.d10})
						</span>
					</div>
				)}
			</div>

			{/* TN to Hit */}
			<div className="mb-md pb-md border-b border-border">
				<div className="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>TN to Hit</span>
				</div>
				<div className="flex items-center gap-md">
					<span className="text-2xl font-bold text-accent">{stats.tn}</span>
					<span className="text-text-muted">
						3 × {stats.cq} + {signedNum(stats.man)}
					</span>
				</div>
			</div>

			{/* Department Actions */}
			<div className="mb-md pb-md border-b border-border">
				<div className="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Department Actions</span>
					<Button variant="ghost" size="sm" onClick={resetDepartments}>
						Reset
					</Button>
				</div>
				<div className="flex flex-col gap-xs">
					{(["maneuver", "tactical", "engineering", "command", "arcana"] as const).map((dept) => (
						<label key={dept} className="flex items-center gap-sm text-[0.85rem] cursor-pointer">
							<GameCheckbox
								checked={combat.departments[dept] || false}
								onChange={(e) => toggleDept(dept, (e.target as HTMLInputElement).checked)}
							/>{" "}
							{dept.charAt(0).toUpperCase() + dept.slice(1)}
						</label>
					))}
				</div>
			</div>

			{/* Turn Counter */}
			<div className="mb-md pb-md border-b border-border">
				<div className="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Turn</span>
				</div>
				<div className="flex items-center justify-center gap-md">
					<Button variant="ghost" size="sm" onClick={prevTurn}>
						←
					</Button>
					<span className="text-2xl font-bold text-accent min-w-10 text-center">{combat.turn || 1}</span>
					<Button variant="primary" size="sm" onClick={nextTurn}>
						Next Turn →
					</Button>
				</div>
			</div>

			{/* Critical Damage */}
			<div className="mb-md pb-md border-b border-border">
				<div className="flex justify-between items-center mb-sm font-semibold text-[0.9rem]">
					<span>Critical Damage</span>
				</div>
				<div className="flex flex-wrap gap-sm items-end mb-sm">
					<div className="mb-sm">
						<label htmlFor="crit-modifier" className="text-[0.8rem]">
							Weapon Crit Rating
						</label>
						<GameInput
							type="number"
							id="crit-modifier"
							className="w-[60px]"
							value={critModifier}
							onInput={(e) => {
								setCritModifier(Number.parseInt((e.target as HTMLInputElement).value, 10) || 0);
							}}
						/>
					</div>
					<Button variant="secondary" size="sm" onClick={rollCritical}>
						Roll Critical
					</Button>
				</div>
				<div className="max-h-[200px] overflow-y-auto">
					{combat.critLog.length === 0 ? (
						<span className="text-text-muted text-[0.8rem]">No critical hits yet</span>
					) : (
						combat.critLog.map((entry) => (
							<div
								key={`${entry.turn}-${entry.roll}-${entry.total}-${entry.name}`}
								className="px-sm py-xs mb-xs bg-surface-raised border-l-[3px] border-error rounded-r-sm text-[0.8rem]"
							>
								<div className="text-text-dim text-[0.7rem]">
									Turn {entry.turn} — Roll: {entry.roll} + {entry.modifier} = {entry.total}
								</div>
								<div className="font-semibold text-error">{entry.name}</div>
								<div className="text-text-muted">{entry.effect}</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Back to Builder */}
			<div className="mb-md pb-md last:border-b-0">
				<Button variant="secondary" className="w-full" onClick={switchToBuilder}>
					← Back to Builder
				</Button>
			</div>
		</aside>
	);
}
