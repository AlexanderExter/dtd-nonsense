import { useState } from "react";
import { Badge, Button } from "@/components/react/ui";
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

const WOUND_FILL_COLORS: Record<string, string> = {
	healthy: "bg-success",
	light: "bg-wound-light",
	heavy: "bg-warning",
	critical: "bg-error",
	down: "bg-[#4a0000]",
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

	const cardClasses = [
		"bg-surface border-2 rounded-md px-lg py-md transition-all duration-200 relative",
		isActive ? "border-accent shadow-[0_0_12px_rgba(212,168,75,0.25)]" : "border-border",
		c.hpCurrent <= 0 && "opacity-45",
	]
		.filter(Boolean)
		.join(" ");

	const initClasses = [
		"flex items-center justify-center w-10 h-10 rounded-full text-[1.1rem] font-bold text-accent shrink-0 border-2 cursor-pointer",
		isActive ? "border-accent bg-accent-bg-strong" : "border-accent-dim bg-bg",
	].join(" ");

	const handleAddCondition = (e: React.MouseEvent<HTMLButtonElement>) => {
		const btn = e.currentTarget as HTMLElement;
		onAddCondition(c.id, btn.getBoundingClientRect());
	};

	return (
		<div className={cardClasses} data-id={c.id}>
			{/* Top bar: initiative + name + badges */}
			<div className="flex items-center gap-md mb-sm max-[768px]:flex-wrap">
				<button
					type="button"
					className={initClasses}
					title="Click to reroll initiative"
					onClick={() => onRerollInit(c.id)}
				>
					{c.initiativeTotal !== null ? c.initiativeTotal : "\u2014"}
				</button>
				<div className="flex-1">
					<span
						className={["text-[1.1rem] font-semibold text-text-primary", c.hpCurrent <= 0 && "line-through"]
							.filter(Boolean)
							.join(" ")}
					>
						{c.name}
					</span>
					{c.surprised && roundNumber <= 1 && (
						<Badge variant="warning" className="ml-sm">
							Surprised
						</Badge>
					)}
					{hasTie && (
						<Badge variant="info" className="ml-sm">
							TIE
						</Badge>
					)}
					{c.isNpc && (
						<Badge variant="muted" className="ml-sm">
							NPC
						</Badge>
					)}
				</div>
				<span
					className={`inline-block px-2 py-0.5 rounded-sm text-[0.7rem] font-semibold uppercase tracking-[0.5px] ${WOUND_BADGE_COLORS[woundStatus] || ""}`}
				>
					{woundStatus}
				</span>
				<Button variant="danger" size="sm" title="Remove combatant" onClick={() => onRemove(c.id)}>
					&times;
				</Button>
			</div>

			{/* Stat row */}
			<div className="flex flex-wrap gap-x-lg gap-y-sm items-center mb-sm text-[0.85rem] text-text-muted max-[768px]:gap-sm">
				<span className="flex items-center gap-xs text-text-primary font-medium" title="Static Defense">
					<abbr className="font-semibold text-text-dim uppercase text-[0.7rem] tracking-[0.5px]">SD</abbr>{" "}
					{c.sd}
				</span>
				<span className="flex items-center gap-xs text-text-primary font-medium" title="Dexterity">
					<abbr className="font-semibold text-text-dim uppercase text-[0.7rem] tracking-[0.5px]">Dex</abbr>{" "}
					{c.dexterity}
				</span>
				<span className="flex items-center gap-xs text-text-primary font-medium" title="Composure">
					<abbr className="font-semibold text-text-dim uppercase text-[0.7rem] tracking-[0.5px]">Com</abbr>{" "}
					{c.composure}
				</span>
				<span className="flex items-center gap-xs text-text-primary font-medium" title="Willpower">
					<abbr className="font-semibold text-text-dim uppercase text-[0.7rem] tracking-[0.5px]">Wil</abbr>{" "}
					{c.willpower}
				</span>
				<span className="flex items-center gap-xs text-text-primary font-medium" title="Resilience">
					<abbr className="font-semibold text-text-dim uppercase text-[0.7rem] tracking-[0.5px]">Res</abbr>{" "}
					{c.resilience}
				</span>
			</div>

			{/* HP bar */}
			<div className="my-sm">
				<div className="flex justify-between items-center mb-1">
					<span className="text-[0.8rem] font-semibold text-text-muted">HP</span>
					<div className="flex items-center gap-0.5">
						<Button size="sm" onClick={() => onModifyHP(c.id, -5)}>
							-5
						</Button>
						<Button size="sm" onClick={() => onModifyHP(c.id, -1)}>
							-1
						</Button>
						<span className="text-[0.8rem] font-bold text-text-primary">
							{c.hpCurrent} / {c.hpMax}
						</span>
						<Button size="sm" onClick={() => onModifyHP(c.id, 1)}>
							+1
						</Button>
						<Button size="sm" onClick={() => onModifyHP(c.id, 5)}>
							+5
						</Button>
					</div>
				</div>
				<div className="h-2.5 bg-bg rounded-[5px] overflow-hidden border border-border">
					<div
						className={`h-full rounded-[5px] transition-all duration-300 ${WOUND_FILL_COLORS[woundStatus] || ""}`}
						style={{ width: `${hpPercent}%` }}
					/>
				</div>
			</div>

			{/* Resource bar */}
			{c.resourceMax > 0 && (
				<div className="my-xs">
					<div className="flex justify-between items-center mb-0.5">
						<span className="text-xs font-semibold text-text-dim">{c.resourceLabel || "Resource"}</span>
						<div className="flex items-center gap-0.5">
							<Button size="sm" onClick={() => onModifyResource(c.id, -1)}>
								-
							</Button>
							<span className="text-xs font-bold text-info">
								{c.resourceCurrent} / {c.resourceMax}
							</span>
							<Button size="sm" onClick={() => onModifyResource(c.id, 1)}>
								+
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Action budget */}
			<div className="flex gap-sm items-center my-sm flex-wrap max-[768px]:gap-1">
				<button
					type="button"
					className={[
						"inline-flex items-center gap-1 px-2 py-[3px] bg-bg border border-border rounded-sm text-xs text-text-muted cursor-pointer transition-all duration-150 select-none hover:border-accent-dim",
						c.actionBudget.half1 && "!bg-accent-dim !border-accent !text-text-primary",
						c.actionBudget.fullAction && "opacity-35 pointer-events-none",
					]
						.filter(Boolean)
						.join(" ")}
					onClick={() => onToggleAction(c.id, "half1")}
				>
					Half 1
				</button>
				<button
					type="button"
					className={[
						"inline-flex items-center gap-1 px-2 py-[3px] bg-bg border border-border rounded-sm text-xs text-text-muted cursor-pointer transition-all duration-150 select-none hover:border-accent-dim",
						c.actionBudget.half2 && "!bg-accent-dim !border-accent !text-text-primary",
						c.actionBudget.fullAction && "opacity-35 pointer-events-none",
					]
						.filter(Boolean)
						.join(" ")}
					onClick={() => onToggleAction(c.id, "half2")}
				>
					Half 2
				</button>
				<button
					type="button"
					className={[
						"inline-flex items-center gap-1 px-2 py-[3px] bg-bg border border-border rounded-sm text-xs text-text-muted cursor-pointer transition-all duration-150 select-none hover:border-accent-dim",
						c.actionBudget.fullAction && "!bg-accent-dim !border-accent !text-text-primary",
						(c.actionBudget.half1 || c.actionBudget.half2) && "opacity-35 pointer-events-none",
					]
						.filter(Boolean)
						.join(" ")}
					onClick={() => onToggleAction(c.id, "fullAction")}
				>
					Full
				</button>
				<button
					type="button"
					className={[
						"inline-flex items-center gap-1 px-2 py-[3px] bg-bg border border-border rounded-sm text-xs text-text-muted cursor-pointer transition-all duration-150 select-none hover:border-accent-dim",
						c.actionBudget.reaction && "!bg-accent-dim !border-accent !text-text-primary",
					]
						.filter(Boolean)
						.join(" ")}
					onClick={() => onToggleAction(c.id, "reaction")}
				>
					Reaction
				</button>
			</div>

			{/* Conditions */}
			<div className="flex flex-wrap gap-1 my-sm items-center">
				{c.conditions.map((cond) => (
					<span
						className="inline-flex items-center gap-1 px-2 py-0.5 bg-error-bg border border-error-border rounded-xl text-[0.72rem] text-error whitespace-nowrap"
						key={cond.conditionId}
					>
						{conditionLabel(cond)}
						<button
							type="button"
							className="bg-transparent border-none text-error cursor-pointer text-[0.8rem] p-0 leading-none opacity-60 hover:opacity-100"
							title="Remove condition"
							onClick={() => onRemoveCondition(c.id, cond.conditionId)}
						>
							&times;
						</button>
					</span>
				))}
				<button
					type="button"
					className="inline-flex items-center justify-center w-[22px] h-[22px] bg-surface-raised border border-dashed border-border rounded-full text-text-dim cursor-pointer text-[0.85rem] leading-none hover:border-accent hover:text-accent"
					onClick={handleAddCondition}
				>
					+
				</button>
			</div>

			{/* Expandable details */}
			<div>
				<Button variant="ghost" size="sm" onClick={() => setDetailsOpen(!detailsOpen)}>
					{detailsOpen ? "\u25BC Notes" : "\u25B6 Notes"}
				</Button>
			</div>
			{detailsOpen && (
				<div className="mt-sm pt-sm border-t border-border">
					<textarea
						className="w-full min-h-[60px] resize-y"
						placeholder="Combatant notes..."
						value={c.notes}
						onInput={(e) => onNotesChange(c.id, (e.target as HTMLTextAreaElement).value)}
					/>
				</div>
			)}
		</div>
	);
}
