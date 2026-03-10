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
			class="bg-surface-raised border border-border rounded-md p-sm max-h-[200px] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
			style={{
				position: "fixed",
				top: `${top}px`,
				left: `${left}px`,
				zIndex: 1000,
			}}
		>
			<div class="flex justify-between items-center mb-sm">
				<strong>Add Condition</strong>
				<button type="button" class="btn btn-sm" onClick={onClose}>
					&times;
				</button>
			</div>
			<div class="flex flex-col gap-1">
				{CONDITIONS.map((def) => {
					const state = getConditionState(def.id);
					const isAppliedNonLeveled = state === "applied";
					return (
						<button
							type="button"
							key={def.id}
							class="block w-full py-1 px-2 bg-transparent border-none text-text-primary text-[0.8rem] text-left cursor-pointer rounded-sm hover:bg-surface hover:text-accent disabled:opacity-40 disabled:pointer-events-none"
							onClick={() => {
								onPick(combatantId, def.id);
								onClose();
							}}
							disabled={isAppliedNonLeveled}
						>
							<span class="font-semibold">
								{def.name}
								{state === "leveled" && " (+1 level)"}
							</span>
							<span class="text-text-muted text-[0.78rem]"> {def.effect}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
