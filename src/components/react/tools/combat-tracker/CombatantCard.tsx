import { useState } from "react";
import { Badge } from "@/components/react/ui/Badge";
import { Button } from "@/components/react/ui/Button";
import { GameTextarea } from "@/components/react/ui/GameTextarea";
import { cn } from "@/lib/utils";
import type { Combatant, CombatantCondition, ConditionDef } from "./constants";
import { getWoundStatus } from "./constants";

interface CombatantCardProps {
	combatant: Combatant;
	conditions: ConditionDef[];
	hasTie: boolean;
	isActive: boolean;
	onAddCondition: (id: string, rect: DOMRect) => void;
	onModifyHP: (id: string, delta: number) => void;
	onModifyResource: (id: string, delta: number) => void;
	onNotesChange: (id: string, notes: string) => void;
	onRemove: (id: string) => void;
	onRemoveCondition: (id: string, conditionId: string) => void;
	onRerollInit: (id: string) => void;
	onToggleAction: (id: string, tokenType: string) => void;
	roundNumber: number;
}

function conditionLabel(cond: CombatantCondition, conditions: ConditionDef[]): string {
	const def = conditions.find((d) => d.id === cond.conditionId);
	if (!def) return cond.conditionId;
	return def.leveled && cond.level ? `${def.name} ${cond.level}` : def.name;
}

const WOUND_FILL_COLORS: Record<string, string> = {
	healthy: "bg-success",
	light: "bg-wound-light",
	heavy: "bg-warning",
	critical: "bg-error",
	down: "bg-wound-down",
};

const WOUND_BADGE_COLORS: Record<string, string> = {
	healthy: "bg-success-bg text-success",
	light: "bg-wound-light-bg text-wound-light",
	heavy: "bg-warning-bg text-warning",
	critical: "bg-error-bg text-error",
	down: "bg-wound-down-bg text-wound-down",
};

export function CombatantCard({
	combatant: c,
	conditions,
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

	const cardClasses = cn(
		"relative rounded-md border-2 bg-surface px-lg py-md transition-all duration-200",
		isActive ? "border-accent shadow-[0_0_12px_rgba(212,168,75,0.25)]" : "border-border",
		c.hpCurrent <= 0 && "opacity-45",
	);

	const initClasses = [
		"flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold text-accent shrink-0 border-2 cursor-pointer",
		isActive ? "border-accent bg-accent-bg-strong" : "border-accent-dim bg-bg",
	].join(" ");

	const handleAddCondition = (e: React.MouseEvent<HTMLButtonElement>) => {
		const btn = e.currentTarget as HTMLElement;
		onAddCondition(c.id, btn.getBoundingClientRect());
	};

	return (
		<div className={cardClasses} data-id={c.id}>
			{/* Top bar: initiative + name + badges */}
			<div className="mb-sm flex items-center gap-md max-tool-md:flex-wrap">
				<button
					className={initClasses}
					onClick={() => onRerollInit(c.id)}
					title="Click to reroll initiative"
					type="button"
				>
					{c.initiativeTotal !== null ? c.initiativeTotal : "\u2014"}
				</button>
				<div className="flex-1">
					<span className={cn("font-semibold text-lg text-text-primary", c.hpCurrent <= 0 && "line-through")}>
						{c.name}
					</span>
					{c.surprised && roundNumber <= 1 && (
						<Badge className="ml-sm" variant="warning">
							Surprised
						</Badge>
					)}
					{hasTie && (
						<Badge className="ml-sm" variant="info">
							TIE
						</Badge>
					)}
					{c.isNpc && (
						<Badge className="ml-sm" variant="muted">
							NPC
						</Badge>
					)}
				</div>
				<span
					className={`inline-block rounded-sm px-2 py-0.5 font-semibold text-xs uppercase tracking-wide-px ${WOUND_BADGE_COLORS[woundStatus] || ""}`}
				>
					{woundStatus}
				</span>
				<Button onClick={() => onRemove(c.id)} size="sm" title="Remove combatant" variant="danger">
					&times;
				</Button>
			</div>

			{/* Stat row */}
			<div className="mb-sm flex flex-wrap items-center gap-x-lg gap-y-sm text-sm text-text-muted max-tool-md:gap-sm">
				<span className="flex items-center gap-xs font-medium text-text-primary" title="Static Defense">
					<abbr className="font-semibold text-text-dim text-xs uppercase tracking-wide-px">SD</abbr> {c.sd}
				</span>
				<span className="flex items-center gap-xs font-medium text-text-primary" title="Dexterity">
					<abbr className="font-semibold text-text-dim text-xs uppercase tracking-wide-px">Dex</abbr>{" "}
					{c.dexterity}
				</span>
				<span className="flex items-center gap-xs font-medium text-text-primary" title="Composure">
					<abbr className="font-semibold text-text-dim text-xs uppercase tracking-wide-px">Com</abbr>{" "}
					{c.composure}
				</span>
				<span className="flex items-center gap-xs font-medium text-text-primary" title="Willpower">
					<abbr className="font-semibold text-text-dim text-xs uppercase tracking-wide-px">Wil</abbr>{" "}
					{c.willpower}
				</span>
				<span className="flex items-center gap-xs font-medium text-text-primary" title="Resilience">
					<abbr className="font-semibold text-text-dim text-xs uppercase tracking-wide-px">Res</abbr>{" "}
					{c.resilience}
				</span>
			</div>

			{/* HP bar */}
			<div className="my-sm">
				<div className="mb-1 flex items-center justify-between">
					<span className="font-semibold text-text-muted text-xs">HP</span>
					<div className="flex items-center gap-0.5">
						<Button onClick={() => onModifyHP(c.id, -5)} size="sm">
							-5
						</Button>
						<Button onClick={() => onModifyHP(c.id, -1)} size="sm">
							-1
						</Button>
						<span className="font-bold text-text-primary text-xs">
							{c.hpCurrent} / {c.hpMax}
						</span>
						<Button onClick={() => onModifyHP(c.id, 1)} size="sm">
							+1
						</Button>
						<Button onClick={() => onModifyHP(c.id, 5)} size="sm">
							+5
						</Button>
					</div>
				</div>
				<div className="h-2.5 overflow-hidden rounded-[5px] border border-border bg-bg">
					<div
						className={`h-full rounded-[5px] transition-all duration-300 ${WOUND_FILL_COLORS[woundStatus] || ""}`}
						style={{ width: `${hpPercent}%` }}
					/>
				</div>
			</div>

			{/* Resource bar */}
			{c.resourceMax > 0 && (
				<div className="my-xs">
					<div className="mb-0.5 flex items-center justify-between">
						<span className="font-semibold text-text-dim text-xs">{c.resourceLabel || "Resource"}</span>
						<div className="flex items-center gap-0.5">
							<Button onClick={() => onModifyResource(c.id, -1)} size="sm">
								-
							</Button>
							<span className="font-bold text-info text-xs">
								{c.resourceCurrent} / {c.resourceMax}
							</span>
							<Button onClick={() => onModifyResource(c.id, 1)} size="sm">
								+
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Action budget */}
			<div className="my-sm flex flex-wrap items-center gap-sm max-tool-md:gap-1">
				<button
					className={cn(
						"inline-flex cursor-pointer select-none items-center gap-1 rounded-sm border border-border bg-bg px-2 py-2xs text-text-muted text-xs transition-all duration-150 hover:border-accent-dim",
						c.actionBudget.half1 && "!bg-accent-dim !border-accent !text-text-primary",
						c.actionBudget.fullAction && "pointer-events-none opacity-35",
					)}
					onClick={() => onToggleAction(c.id, "half1")}
					type="button"
				>
					Half 1
				</button>
				<button
					className={cn(
						"inline-flex cursor-pointer select-none items-center gap-1 rounded-sm border border-border bg-bg px-2 py-2xs text-text-muted text-xs transition-all duration-150 hover:border-accent-dim",
						c.actionBudget.half2 && "!bg-accent-dim !border-accent !text-text-primary",
						c.actionBudget.fullAction && "pointer-events-none opacity-35",
					)}
					onClick={() => onToggleAction(c.id, "half2")}
					type="button"
				>
					Half 2
				</button>
				<button
					className={cn(
						"inline-flex cursor-pointer select-none items-center gap-1 rounded-sm border border-border bg-bg px-2 py-2xs text-text-muted text-xs transition-all duration-150 hover:border-accent-dim",
						c.actionBudget.fullAction && "!bg-accent-dim !border-accent !text-text-primary",
						(c.actionBudget.half1 || c.actionBudget.half2) && "pointer-events-none opacity-35",
					)}
					onClick={() => onToggleAction(c.id, "fullAction")}
					type="button"
				>
					Full
				</button>
				<button
					className={cn(
						"inline-flex cursor-pointer select-none items-center gap-1 rounded-sm border border-border bg-bg px-2 py-2xs text-text-muted text-xs transition-all duration-150 hover:border-accent-dim",
						c.actionBudget.reaction && "!bg-accent-dim !border-accent !text-text-primary",
					)}
					onClick={() => onToggleAction(c.id, "reaction")}
					type="button"
				>
					Reaction
				</button>
			</div>

			{/* Conditions */}
			<div className="my-sm flex flex-wrap items-center gap-1">
				{c.conditions.map((cond) => (
					<span
						className="inline-flex items-center gap-1 whitespace-nowrap rounded-xl border border-error-border bg-error-bg px-2 py-0.5 text-error text-xs"
						key={cond.conditionId}
					>
						{conditionLabel(cond, conditions)}
						<button
							aria-label="Remove condition"
							className="cursor-pointer border-none bg-transparent p-0 text-error text-xs leading-none opacity-60 hover:opacity-100"
							onClick={() => onRemoveCondition(c.id, cond.conditionId)}
							type="button"
						>
							&times;
						</button>
					</span>
				))}
				<button
					aria-label="Add condition"
					className="inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border border-border border-dashed bg-surface-raised text-sm text-text-dim leading-none hover:border-accent hover:text-accent"
					onClick={handleAddCondition}
					type="button"
				>
					+
				</button>
			</div>

			{/* Expandable details */}
			<div>
				<Button onClick={() => setDetailsOpen(!detailsOpen)} size="sm" variant="ghost">
					{detailsOpen ? "\u25BC Notes" : "\u25B6 Notes"}
				</Button>
			</div>
			{detailsOpen && (
				<div className="mt-sm border-border border-t pt-sm">
					<GameTextarea
						onInput={(e) => onNotesChange(c.id, (e.target as HTMLTextAreaElement).value)}
						placeholder="Combatant notes..."
						value={c.notes}
					/>
				</div>
			)}
		</div>
	);
}
