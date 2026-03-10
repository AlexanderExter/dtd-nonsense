import { useEffect, useRef } from "preact/hooks";
import type { CombatantCondition } from "./constants";
import { CONDITIONS } from "./constants";

interface ConditionPickerProps {
	combatantId: string;
	existingConditions: CombatantCondition[];
	anchorRect: DOMRect;
	onPick: (combatantId: string, conditionId: string) => void;
	onClose: () => void;
}

export function ConditionPicker({
	combatantId,
	existingConditions,
	anchorRect,
	onPick,
	onClose,
}: ConditionPickerProps) {
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	const getConditionState = (condId: string) => {
		const existing = existingConditions.find((c) => c.conditionId === condId);
		if (!existing) return "available";
		const def = CONDITIONS.find((d) => d.id === condId);
		if (def?.leveled) return "leveled";
		return "applied";
	};

	const top = anchorRect.bottom + 4;
	const left = anchorRect.left;

	return (
		<div
			ref={panelRef}
			class="condition-picker"
			style={{ position: "fixed", top: `${top}px`, left: `${left}px`, zIndex: 1000 }}
		>
			<div class="condition-picker-header">
				<strong>Add Condition</strong>
				<button type="button" class="btn btn-sm" onClick={onClose}>
					&times;
				</button>
			</div>
			<div class="condition-picker-list">
				{CONDITIONS.map((def) => {
					const state = getConditionState(def.id);
					const isAppliedNonLeveled = state === "applied";
					return (
						<button
							type="button"
							key={def.id}
							class={`condition-picker-item ${isAppliedNonLeveled ? "dimmed" : ""}`}
							style={isAppliedNonLeveled ? { opacity: 0.4 } : undefined}
							onClick={() => {
								onPick(combatantId, def.id);
								onClose();
							}}
							disabled={isAppliedNonLeveled}
						>
							<span class="condition-picker-name">
								{def.name}
								{state === "leveled" && " (+1 level)"}
							</span>
							<span class="condition-picker-effect">{def.effect}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
