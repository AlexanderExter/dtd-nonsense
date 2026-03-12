import { Popover } from "@/components/react/ui";
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
	const getConditionState = (condId: string) => {
		const existing = existingConditions.find((c) => c.conditionId === condId);
		if (!existing) return "available";
		const def = CONDITIONS.find((d) => d.id === condId);
		if (def?.leveled) return "leveled";
		return "applied";
	};

	return (
		<Popover
			open
			onClose={onClose}
			anchorRect={{ x: anchorRect.left, y: anchorRect.bottom, width: anchorRect.width, height: 0 }}
			title="Add Condition"
			className="max-h-[200px]"
		>
			<div className="flex flex-col gap-1">
				{CONDITIONS.map((def) => {
					const state = getConditionState(def.id);
					const isAppliedNonLeveled = state === "applied";
					return (
						<button
							type="button"
							key={def.id}
							className="block w-full py-1 px-2 bg-transparent border-none text-text-primary text-[0.8rem] text-left cursor-pointer rounded-sm hover:bg-surface hover:text-accent disabled:opacity-40 disabled:pointer-events-none"
							onClick={() => {
								onPick(combatantId, def.id);
								onClose();
							}}
							disabled={isAppliedNonLeveled}
						>
							<span className="font-semibold">
								{def.name}
								{state === "leveled" && " (+1 level)"}
							</span>
							<span className="text-text-muted text-[0.78rem]"> {def.effect}</span>
						</button>
					);
				})}
			</div>
		</Popover>
	);
}
