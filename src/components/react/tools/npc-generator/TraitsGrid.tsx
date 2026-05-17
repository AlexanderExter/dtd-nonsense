import { useCallback } from "react";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import type { TraitDef } from "./constants";

interface TraitsGridProps {
	activeTraits: Array<{ id: string; param?: string | number }>;
	onChange: (traits: Array<{ id: string; param?: string | number }>) => void;
	traitsData: TraitDef[];
}

export function TraitsGrid({ activeTraits, traitsData, onChange }: TraitsGridProps) {
	const isActive = useCallback((traitId: string) => activeTraits.some((t) => t.id === traitId), [activeTraits]);

	const getParam = useCallback(
		(traitId: string): string | number | undefined => {
			const match = activeTraits.find((t) => t.id === traitId);
			return match?.param;
		},
		[activeTraits],
	);

	const toggleTrait = useCallback(
		(traitId: string, checked: boolean) => {
			if (checked) {
				onChange([...activeTraits, { id: traitId }]);
			} else {
				onChange(activeTraits.filter((t) => t.id !== traitId));
			}
		},
		[activeTraits, onChange],
	);

	const updateParam = useCallback(
		(traitId: string, rawValue: string) => {
			const updated = activeTraits.map((t) => {
				if (t.id !== traitId) return t;
				const trimmed = rawValue.trim();
				if (!trimmed) return { id: t.id };
				const numVal = Number(trimmed);
				return { id: t.id, param: Number.isNaN(numVal) ? trimmed : numVal };
			});
			onChange(updated);
		},
		[activeTraits, onChange],
	);

	return (
		<div className="mb-lg border-border border-b pb-md last:border-b-0">
			<h2 className="m-0 mb-sm text-accent text-sm uppercase tracking-wide-px">Traits</h2>
			<div className="flex flex-col gap-xs">
				{traitsData.map((trait) => {
					const active = isActive(trait.id);
					const paramValue = getParam(trait.id);
					return (
						<div
							className={[
								"flex cursor-pointer items-center gap-sm rounded-sm border bg-surface px-sm py-xs transition-all duration-150 hover:border-border-light",
								active ? "border-accent bg-accent-bg-subtle" : "border-border",
							].join(" ")}
							key={trait.id}
						>
							<GameCheckbox
								checked={active}
								className="m-0 w-auto"
								id={`trait-${trait.id}`}
								onChange={(e) => toggleTrait(trait.id, (e.target as HTMLInputElement).checked)}
							/>
							<label className="flex-1 font-medium text-sm" htmlFor={`trait-${trait.id}`}>
								{trait.name}
							</label>
							{trait.parameterized && (
								<GameInput
									className={[
										"text-center",
										trait.paramType === "caster" || trait.paramType === "resource"
											? "w-[150px]"
											: "w-[70px]",
									].join(" ")}
									disabled={!active}
									onInput={(e) => updateParam(trait.id, (e.target as HTMLInputElement).value)}
									placeholder={trait.paramLabel || "X"}
									type="text"
									value={paramValue != null ? String(paramValue) : ""}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
