import { Popover } from "@/components/react/ui/Popover";
import type { CombatantCondition } from "./constants";
import { CONDITIONS } from "./constants";

interface ConditionPickerProps {
	anchorRect: DOMRect;
	combatantId: string;
	existingConditions: CombatantCondition[];
	onClose: () => void;
	onPick: (combatantId: string, conditionId: string) => void;
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
			anchorRect={{ x: anchorRect.left, y: anchorRect.bottom, width: anchorRect.width, height: 0 }}
			className="max-h-[200px]"
			onClose={onClose}
			open
			title="Add Condition"
		>
			<div className="flex flex-col gap-1">
				{CONDITIONS.map((def) => {
					const state = getConditionState(def.id);
					const isAppliedNonLeveled = state === "applied";
					return (
						<button
							className="block w-full cursor-pointer rounded-sm border-none bg-transparent px-2 py-1 text-left text-[0.8rem] text-text-primary hover:bg-surface hover:text-accent disabled:pointer-events-none disabled:opacity-40"
							disabled={isAppliedNonLeveled}
							key={def.id}
							onClick={() => {
								onPick(combatantId, def.id);
								onClose();
							}}
							type="button"
						>
							<span className="font-semibold">
								{def.name}
								{state === "leveled" && " (+1 level)"}
							</span>
							<span className="text-[0.78rem] text-text-muted"> {def.effect}</span>
						</button>
					);
				})}
			</div>
		</Popover>
	);
}
