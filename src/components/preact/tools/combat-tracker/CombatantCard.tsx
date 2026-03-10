import { useState } from "preact/hooks";
import type { Combatant, CombatantCondition } from "./constants";
import { CONDITIONS, getWoundStatus } from "./constants";

interface CombatantCardProps {
	combatant: Combatant;
	isActive: boolean;
	hasTie: boolean;
	roundNumber: number;
	onModifyHP: (id: string, delta: number) => void;
	onModifyResource: (id: string, delta: number) => void;
	onRemove: (id: string) => void;
	onRerollInit: (id: string) => void;
	onToggleAction: (id: string, tokenType: string) => void;
	onAddCondition: (id: string, rect: DOMRect) => void;
	onRemoveCondition: (id: string, conditionId: string) => void;
	onNotesChange: (id: string, notes: string) => void;
}

function conditionLabel(cond: CombatantCondition): string {
	const def = CONDITIONS.find((d) => d.id === cond.conditionId);
	if (!def) return cond.conditionId;
	return def.leveled && cond.level ? `${def.name} ${cond.level}` : def.name;
}

export function CombatantCard({
	combatant: c,
	isActive,
	hasTie,
	roundNumber,
	onModifyHP,
	onModifyResource,
	onRemove,
	onRerollInit,
	onToggleAction,
	onAddCondition,
	onRemoveCondition,
	onNotesChange,
}: CombatantCardProps) {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const woundStatus = getWoundStatus(c);
	const hpPercent = c.hpMax > 0 ? Math.max(0, (c.hpCurrent / c.hpMax) * 100) : 0;

	const cardClasses = ["combatant-card", isActive && "active", c.hpCurrent <= 0 && "defeated"]
		.filter(Boolean)
		.join(" ");

	const handleAddCondition = (e: MouseEvent) => {
		const btn = e.currentTarget as HTMLElement;
		onAddCondition(c.id, btn.getBoundingClientRect());
	};

	return (
		<div class={cardClasses} data-id={c.id}>
			{/* Top bar: initiative + name + badges */}
			<div class="card-top-bar">
				<button
					type="button"
					class="init-circle"
					title="Click to reroll initiative"
					onClick={() => onRerollInit(c.id)}
				>
					{c.initiativeTotal !== null ? c.initiativeTotal : "\u2014"}
				</button>
				<div class="card-name-area">
					<span class="combatant-name">{c.name}</span>
					<span class="badge-row">
						{c.surprised && roundNumber <= 1 && <span class="badge badge-surprised">Surprised</span>}
						{hasTie && <span class="badge badge-tie">TIE</span>}
						{c.isNpc && <span class="badge badge-npc">NPC</span>}
					</span>
				</div>
				<span class={`wound-badge wound-${woundStatus}`}>{woundStatus}</span>
				<button
					type="button"
					class="btn btn-danger btn-sm card-remove-btn"
					title="Remove combatant"
					onClick={() => onRemove(c.id)}
				>
					&times;
				</button>
			</div>

			{/* Stat row */}
			<div class="stat-row">
				<span class="stat" title="Static Defense">
					<abbr>SD</abbr> {c.sd}
				</span>
				<span class="stat" title="Dexterity">
					<abbr>Dex</abbr> {c.dexterity}
				</span>
				<span class="stat" title="Composure">
					<abbr>Com</abbr> {c.composure}
				</span>
				<span class="stat" title="Willpower">
					<abbr>Wil</abbr> {c.willpower}
				</span>
				<span class="stat" title="Resilience">
					<abbr>Res</abbr> {c.resilience}
				</span>
			</div>

			{/* HP bar */}
			<div class="hp-section">
				<div class="hp-header">
					<span class="hp-label">HP</span>
					<div class="hp-controls">
						<button type="button" class="btn btn-sm" onClick={() => onModifyHP(c.id, -5)}>
							-5
						</button>
						<button type="button" class="btn btn-sm" onClick={() => onModifyHP(c.id, -1)}>
							-1
						</button>
						<span class="hp-value">
							{c.hpCurrent} / {c.hpMax}
						</span>
						<button type="button" class="btn btn-sm" onClick={() => onModifyHP(c.id, 1)}>
							+1
						</button>
						<button type="button" class="btn btn-sm" onClick={() => onModifyHP(c.id, 5)}>
							+5
						</button>
					</div>
				</div>
				<div class="hp-bar">
					<div class={`hp-bar-fill wound-${woundStatus}`} style={{ width: `${hpPercent}%` }} />
				</div>
			</div>

			{/* Resource bar */}
			{c.resourceMax > 0 && (
				<div class="resource-section">
					<div class="resource-header">
						<span class="resource-label">{c.resourceLabel || "Resource"}</span>
						<div class="resource-controls">
							<button type="button" class="btn btn-sm" onClick={() => onModifyResource(c.id, -1)}>
								-
							</button>
							<span class="resource-value">
								{c.resourceCurrent} / {c.resourceMax}
							</span>
							<button type="button" class="btn btn-sm" onClick={() => onModifyResource(c.id, 1)}>
								+
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Action budget */}
			<div class="action-budget">
				<button
					type="button"
					class={`action-token ${c.actionBudget.half1 ? "used" : ""}`}
					disabled={c.actionBudget.fullAction}
					onClick={() => onToggleAction(c.id, "half1")}
				>
					Half 1
				</button>
				<button
					type="button"
					class={`action-token ${c.actionBudget.half2 ? "used" : ""}`}
					disabled={c.actionBudget.fullAction}
					onClick={() => onToggleAction(c.id, "half2")}
				>
					Half 2
				</button>
				<button
					type="button"
					class={`action-token ${c.actionBudget.fullAction ? "used" : ""}`}
					disabled={c.actionBudget.half1 || c.actionBudget.half2}
					onClick={() => onToggleAction(c.id, "fullAction")}
				>
					Full
				</button>
				<button
					type="button"
					class={`action-token ${c.actionBudget.reaction ? "used" : ""}`}
					onClick={() => onToggleAction(c.id, "reaction")}
				>
					Reaction
				</button>
			</div>

			{/* Conditions */}
			<div class="conditions-area">
				{c.conditions.map((cond) => (
					<span class="condition-chip" key={cond.conditionId}>
						{conditionLabel(cond)}
						<button
							type="button"
							class="chip-remove"
							title="Remove condition"
							onClick={() => onRemoveCondition(c.id, cond.conditionId)}
						>
							&times;
						</button>
					</span>
				))}
				<button type="button" class="btn btn-sm add-condition-btn" onClick={handleAddCondition}>
					+ Condition
				</button>
			</div>

			{/* Expandable details */}
			<div class="card-details-toggle">
				<button type="button" class="btn btn-sm btn-ghost" onClick={() => setDetailsOpen(!detailsOpen)}>
					{detailsOpen ? "\u25BC Notes" : "\u25B6 Notes"}
				</button>
			</div>
			{detailsOpen && (
				<div class="card-details">
					<textarea
						class="notes-textarea"
						placeholder="Combatant notes..."
						value={c.notes}
						onInput={(e) => onNotesChange(c.id, (e.target as HTMLTextAreaElement).value)}
					/>
				</div>
			)}
		</div>
	);
}
